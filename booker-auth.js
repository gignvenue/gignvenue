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

  // Maps DB snake_case → JS camelCase so dashboards work without changes
  function _enrichArtist(record, authId) {
    if (!record) return null;
    return {
      ...record,
      authId,
      firstName:       record.first_name        || '',
      lastName:        record.last_name         || '',
      artistName:      record.artist_name       || record.display_name || '',
      actType:         record.act_type          || '',
      homeCity:        record.home_city         || '',
      yearsActive:     record.years_active      || '',
      setLength:       record.set_length        || '',
      eventTypes:      record.event_types       || '',
      audienceSize:    record.audience_size     || '',
      stageSize:       record.stage_size        || '',
      spotifyEmbed:    record.spotify_embed     !== false,
      soundcloudEmbed: record.soundcloud_embed  !== false,
    };
  }

  // Maps JS camelCase → DB snake_case for writes
  const _FIELD_MAP = {
    firstName:       'first_name',
    lastName:        'last_name',
    artistName:      'artist_name',
    actType:         'act_type',
    homeCity:        'home_city',
    yearsActive:     'years_active',
    setLength:       'set_length',
    eventTypes:      'event_types',
    audienceSize:    'audience_size',
    stageSize:       'stage_size',
    spotifyEmbed:    'spotify_embed',
    soundcloudEmbed: 'soundcloud_embed',
  };

  function _toDb(updates) {
    const db = {};
    Object.entries(updates).forEach(([k, v]) => { db[_FIELD_MAP[k] || k] = v; });
    // Keep display_name in sync with artist_name
    if (updates.artistName) db.display_name = updates.artistName;
    return db;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const BookerAuth = {

    async currentUser() {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) return null;
      if (!_artistRecord) _artistRecord = await _fetchArtist(session.user.id);
      return _enrichArtist(_artistRecord, session.user.id);
    },

    async currentProfile() {
      return this.currentUser();
    },

    async requireAuth(redirectTo = 'booker-login.html') {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) { window.location.href = redirectTo; return null; }
      _artistRecord = await _fetchArtist(session.user.id);
      if (!_artistRecord) { window.location.href = redirectTo; return null; }
      return _enrichArtist(_artistRecord, session.user.id);
    },

    async requireGuest(redirectTo = 'booker-dashboard.html') {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) return;
      const artist = await _fetchArtist(session.user.id);
      if (artist) window.location.href = redirectTo;
      // Session exists but belongs to a host account — stay on login page
    },

    async login(email, password) {
      const { data, error } = await gnvClient.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: 'Invalid email or password.' };
      _artistRecord = await _fetchArtist(data.user.id);
      if (!_artistRecord) return { ok: false, error: 'Account not found. Please sign up.' };
      return { ok: true, user: _enrichArtist(_artistRecord, data.user.id) };
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

      // Create artist profile row via security definer function (works before email confirmation)
      const { error: insertErr } = await gnvClient.rpc('create_artist_profile', {
        p_auth_id:      data.user.id,
        p_email:        email,
        p_display_name: artistName || `${firstName} ${lastName}`,
        p_genre:        genre || '',
      });

      if (insertErr) return { ok: false, error: 'Could not create your account. Please try again.' };

      // Store first/last name separately (non-blocking — columns may not exist yet)
      if (firstName || lastName) {
        gnvClient.from('artists')
          .update({ first_name: firstName || null, last_name: lastName || null, artist_name: artistName || null })
          .eq('auth_id', data.user.id)
          .then();
      }

      // Fetch the created row
      const { data: artist } = await gnvClient.from('artists').select().eq('auth_id', data.user.id).single();
      _artistRecord = artist;
      return { ok: true, user: _enrichArtist(artist, data.user.id) };
    },

    async logout(redirect) {
      await gnvClient.auth.signOut();
      _artistRecord = null;
      if (redirect) window.location.href = redirect;
    },

    async updateProfile(updates) {
      const { data: { session } } = await gnvClient.auth.getSession();
      if (!session) return null;
      const { data, error } = await gnvClient
        .from('artists')
        .update(_toDb(updates))
        .eq('auth_id', session.user.id)
        .select()
        .single();
      if (error) return null;
      _artistRecord = data;
      return _enrichArtist(data, session.user.id);
    },

    async sendPasswordReset(email) {
      const { error } = await gnvClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/booker-login.html',
      });
      return { ok: !error, error: error?.message };
    },

    // Legacy stubs — kept so any dashboard code calling these doesn't break
    getProfiles()             { return _artistRecord ? [_artistRecord] : []; },
    setActiveProfile()        { /* no-op — single profile per artist */ },
    createProfile(fields)     { return this.updateProfile(fields); },
    deleteProfile()           { return false; /* not supported */ },
  };

  global.BookerAuth = BookerAuth;
})(window);
