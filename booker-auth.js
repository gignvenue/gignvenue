/* ============================================
   BOOKER AUTH — Supabase-backed
   Public API matches the old localStorage version
   so booker-dashboard.js needs minimal changes.
   ============================================ */

(function(global) {
  'use strict';

  // In-memory cache
  let _artistRecord = null;

  async function _fetchArtist(authId) {
    const { data } = await gnvClient
      .from('artists')
      .select('*')
      .eq('auth_id', authId)
      .single();
    return data || null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const BookerAuth = {

    async currentUser() {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) return null;
      if (!_artistRecord) _artistRecord = await _fetchArtist(session.user.id);
      return _artistRecord;
    },

    // Profile and user are the same record in Supabase (artists table)
    async currentProfile() {
      return this.currentUser();
    },

    async requireAuth(redirectTo = 'booker-login.html') {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) { window.location.href = redirectTo; return null; }
      _artistRecord = await _fetchArtist(session.user.id);
      if (!_artistRecord) { window.location.href = redirectTo; return null; }
      return _artistRecord;
    },

    async requireGuest(redirectTo = 'booker-dashboard.html') {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (session) window.location.href = redirectTo;
    },

    async login(email, password) {
      const { data, error } = await gnvClient.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: 'Invalid email or password.' };
      _artistRecord = await _fetchArtist(data.user.id);
      if (!_artistRecord) return { ok: false, error: 'Account not found. Please sign up.' };
      return { ok: true, user: _artistRecord };
    },

    async signup(firstName, lastName, email, password, artistName, genre) {
      const { data, error } = await gnvClient.auth.signUp({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('already')) {
          return { ok: false, error: 'An account with this email already exists. Please log in.' };
        }
        return { ok: false, error: error.message };
      }

      // Block same email being used on both sides — each role requires its own account
      const { data: existingArtist } = await gnvClient.from('artists').select('id').eq('auth_id', data.user.id).maybeSingle();
      if (existingArtist) return { ok: false, error: 'An account with this email already exists. Please log in.' };

      const { data: existingHost } = await gnvClient.from('hosts').select('id').eq('auth_id', data.user.id).maybeSingle();
      if (existingHost) {
        await gnvClient.auth.signOut();
        return { ok: false, error: 'That email is already registered as a host account. Please use a different email for your artist account.' };
      }

      // Create artist profile row
      const { data: artist, error: insertErr } = await gnvClient
        .from('artists')
        .insert({
          auth_id:      data.user.id,
          email,
          display_name: artistName || `${firstName} ${lastName}`,
          genre:        genre || '',
        })
        .select()
        .single();

      if (insertErr) return { ok: false, error: 'Could not create your account. Please try again.' };
      _artistRecord = artist;
      return { ok: true, user: artist };
    },

    async logout(redirect) {
      await gnvClient.auth.signOut();
      _artistRecord = null;
      if (redirect) window.location.href = redirect;
    },

    async updateProfile(updates) {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) return;
      const { data, error } = await gnvClient
        .from('artists')
        .update(updates)
        .eq('auth_id', session.user.id)
        .select()
        .single();
      if (error) return null;
      _artistRecord = data;
      return data;
    },

    async sendPasswordReset(email) {
      const { error } = await gnvClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/booker-login.html',
      });
      return { ok: !error, error: error?.message };
    },

    // Legacy stubs — kept so any dashboard code calling these doesn't break
    // Will be removed once dashboard data layer is migrated
    getProfiles()             { return _artistRecord ? [_artistRecord] : []; },
    setActiveProfile()        { /* no-op — single profile per artist */ },
    createProfile(fields)     { return this.updateProfile(fields); },
    deleteProfile()           { return false; /* not supported */ },
  };

  global.BookerAuth = BookerAuth;
})(window);
