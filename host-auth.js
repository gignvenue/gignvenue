/* ============================================
   HOST AUTH — Supabase-backed
   Public API matches the old localStorage version
   so host-dashboard.js needs no changes.
   ============================================ */

const Auth = (() => {
  'use strict';

  // In-memory cache — populated by requireAuth / login
  let _hostRecord = null;

  async function _fetchHost(authId) {
    const { data } = await gnvClient
      .from('hosts')
      .select('*')
      .eq('auth_id', authId)
      .single();
    return data || null;
  }

  // Maps DB snake_case → JS camelCase
  function _enrichHost(record) {
    if (!record) return null;
    return {
      ...record,
      firstName: record.first_name || '',
      lastName:  record.last_name  || '',
      showEmail: record.show_email || false,
      showPhone: record.show_phone || false,
    };
  }

  // Maps JS camelCase → DB snake_case for writes
  const _FIELD_MAP = {
    firstName: 'first_name',
    lastName:  'last_name',
    showEmail: 'show_email',
    showPhone: 'show_phone',
  };

  function _toDb(updates) {
    const db = {};
    Object.entries(updates).forEach(([k, v]) => { db[_FIELD_MAP[k] || k] = v; });
    return db;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async function currentUser() {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) return null;
    if (!_hostRecord) _hostRecord = await _fetchHost(session.user.id);
    return _enrichHost(_hostRecord);
  }

  // Call at top of protected pages — redirects to login if no session
  async function requireAuth(redirectTo = 'host-login.html') {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) { window.location.href = redirectTo; return null; }
    _hostRecord = await _fetchHost(session.user.id);
    if (!_hostRecord) { window.location.href = redirectTo; return null; }
    return _enrichHost(_hostRecord);
  }

  // Call at top of login/signup pages — redirects to dashboard if already logged in as a host
  async function requireGuest(redirectTo = 'host-dashboard.html') {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) return;
    const host = await _fetchHost(session.user.id);
    if (host) window.location.href = redirectTo;
    // Session exists but belongs to an artist account — stay on login page
  }

  async function login(email, password) {
    const { data, error } = await gnvClient.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: 'Incorrect email or password.' };
    _hostRecord = await _fetchHost(data.user.id);
    if (!_hostRecord) return { ok: false, error: 'Account not found. Please sign up.' };
    return { ok: true, user: _enrichHost(_hostRecord) };
  }

  async function signup(firstName, lastName, email, password) {
    const { data, error } = await gnvClient.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return { ok: false, error: 'An account with that email already exists. Please log in.' };
      }
      return { ok: false, error: error.message };
    }

    // Block same email being used on both sides — each role requires its own account
    const { data: existingHost }   = await gnvClient.from('hosts').select('id').eq('auth_id', data.user.id).maybeSingle();
    if (existingHost) return { ok: false, error: 'An account with that email already exists. Please log in.' };

    const { data: existingArtist } = await gnvClient.from('artists').select('id').eq('auth_id', data.user.id).maybeSingle();
    if (existingArtist) {
      await gnvClient.auth.signOut();
      return { ok: false, error: 'That email is already registered as an artist account. Please use a different email for your host account.' };
    }

    // Create host profile row via security definer function (works before email confirmation)
    const { error: insertErr } = await gnvClient.rpc('create_host_profile', {
      p_auth_id:      data.user.id,
      p_email:        email,
      p_display_name: `${firstName} ${lastName}`,
    });

    if (insertErr) return { ok: false, error: 'Could not create your account. Please try again.' };

    // Store first/last name separately (non-blocking — columns may not exist yet)
    if (firstName || lastName) {
      gnvClient.from('hosts')
        .update({ first_name: firstName || null, last_name: lastName || null })
        .eq('auth_id', data.user.id)
        .then();
    }

    // Fetch the created row
    const { data: host } = await gnvClient.from('hosts').select().eq('auth_id', data.user.id).single();
    _hostRecord = host;
    return { ok: true, user: _enrichHost(host) };
  }

  async function logout(redirectTo = 'index.html') {
    await gnvClient.auth.signOut();
    _hostRecord = null;
    window.location.href = redirectTo;
  }

  async function updateProfile(updates) {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) return null;
    const { data, error } = await gnvClient
      .from('hosts')
      .update(_toDb(updates))
      .eq('auth_id', session.user.id)
      .select()
      .single();
    if (error) return null;
    _hostRecord = data;
    return _enrichHost(data);
  }

  async function sendPasswordReset(email) {
    const { error } = await gnvClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/host-login.html',
    });
    return { ok: !error, error: error?.message };
  }

  return { login, signup, logout, currentUser, requireAuth, requireGuest, updateProfile, sendPasswordReset };
})();
