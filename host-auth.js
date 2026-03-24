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

  // ── Public API ────────────────────────────────────────────────────────────

  async function currentUser() {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) return null;
    if (!_hostRecord) _hostRecord = await _fetchHost(session.user.id);
    return _hostRecord;
  }

  // Call at top of protected pages — redirects to login if no session
  async function requireAuth(redirectTo = 'host-login.html') {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (!session) { window.location.href = redirectTo; return null; }
    _hostRecord = await _fetchHost(session.user.id);
    if (!_hostRecord) { window.location.href = redirectTo; return null; }
    return _hostRecord;
  }

  // Call at top of login/signup pages — redirects to dashboard if already logged in
  async function requireGuest(redirectTo = 'host-dashboard.html') {
    const { data: { session } } = await gnvClient.auth.getSession();
    if (session) window.location.href = redirectTo;
  }

  async function login(email, password) {
    const { data, error } = await gnvClient.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: 'Incorrect email or password.' };
    _hostRecord = await _fetchHost(data.user.id);
    if (!_hostRecord) return { ok: false, error: 'Account not found. Please sign up.' };
    return { ok: true, user: _hostRecord };
  }

  async function signup(firstName, lastName, email, password) {
    const { data, error } = await gnvClient.auth.signUp({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        return { ok: false, error: 'An account with that email already exists.' };
      }
      return { ok: false, error: error.message };
    }

    // Create host profile row linked to the new auth user
    const { data: host, error: insertErr } = await gnvClient
      .from('hosts')
      .insert({
        auth_id:      data.user.id,
        email,
        display_name: `${firstName} ${lastName}`,
      })
      .select()
      .single();

    if (insertErr) return { ok: false, error: 'Could not create your account. Please try again.' };
    _hostRecord = host;
    return { ok: true, user: host };
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
      .update(updates)
      .eq('auth_id', session.user.id)
      .select()
      .single();
    if (error) return null;
    _hostRecord = data;
    return data;
  }

  async function sendPasswordReset(email) {
    const { error } = await gnvClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/host-login.html',
    });
    return { ok: !error, error: error?.message };
  }

  return { login, signup, logout, currentUser, requireAuth, requireGuest, updateProfile, sendPasswordReset };
})();
