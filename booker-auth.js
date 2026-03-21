/* ============================================
   BOOKER AUTHENTICATION MODULE — GigNVenue
   ============================================ */

(function(global) {
  'use strict';

  const USERS_KEY    = 'vf_booker_users';
  const SESSION_KEY  = 'vf_booker_session';
  const PROFILES_KEY = 'vf_band_profiles';

  // Fields that live on the user account vs. on a band profile
  const ACCOUNT_FIELDS = new Set(['firstName','lastName','email','password','phone']);

  // ── Seed demo account + profile ───────────────────────────────────────────
  const DEMO_PROFILE = {
    id:           'profile_demo',
    userId:       'booker_demo',
    artistName:   'Alex Rivera & The Static',
    genre:        'Indie Rock / Alternative',
    actType:      'band',
    homeCity:     'Los Angeles, CA',
    performers:   4,
    yearsActive:  6,
    setLength:    '75 min (single set) or 2 × 40 min',
    travel:       'national',
    eventTypes:   'Concerts, Album launches, Festivals, Private showcases',
    audienceSize: '200–800',
    sound:        'pa_required',
    stageSize:    '16×12',
    rider:        'Full backline: drums, bass amp (Ampeg SVT), guitar cabs ×2 (Marshall 4×12). 4 monitor sends. House FOH engineer preferred — we travel with stems. Green room required. Load-in access minimum 2 hours before doors.',
    bio:          'Alex Rivera & The Static are a four-piece indie rock band from Los Angeles, blending driving guitars, layered synths, and emotionally honest songwriting. Formed in 2019, the band has toured nationally, released two full-length albums, and built a loyal following across the West Coast and beyond.\n\nTheir live show is known for high energy and crowd connection — they don\'t just perform, they pull the room in. Whether headlining a 500-cap club or opening a 2,000-seat theater, they bring the same intensity to every stage.',
    website:      'https://gignvenue.com',
    epk:          'https://gignvenue.com',
    instagram:    'https://instagram.com',
    youtube:      'https://youtube.com',
    tiktok:       'https://tiktok.com',
    spotify:      'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH',
    soundcloud:   'https://soundcloud.com/arcticmonkeys',
    avatar:       'https://randomuser.me/api/portraits/men/32.jpg',
  };

  function seedDemo() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (!users.find(u => u.email === 'alex@example.com')) {
      users.push({
        id: 'booker_demo',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex@example.com',
        password: 'Password1',
        joined: '2024-01-15T00:00:00.000Z',
        verified: true,
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    // Always upsert the full demo profile so new fields are picked up
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    const idx = profiles.findIndex(p => p.userId === 'booker_demo');
    if (idx > -1) profiles[idx] = DEMO_PROFILE;
    else profiles.push(DEMO_PROFILE);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }
  seedDemo();

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  }

  function ensureProfile(user) {
    // If this user has no band profiles yet, migrate fields from the user object
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    if (profiles.find(p => p.userId === user.id)) return;
    profiles.push({
      id: 'profile_' + Date.now(),
      userId: user.id,
      artistName: user.artistName || `${user.firstName} ${user.lastName}`,
      genre:       user.genre        || '',
      bio:         user.bio          || '',
      avatar:      user.avatar       || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&backgroundColor=FF385C&textColor=ffffff`,
      eventTypes:  user.eventTypes   || '',
      actType:     user.actType      || '',
      homeCity:    user.homeCity     || '',
      performers:  user.performers   || '',
      yearsActive: user.yearsActive  || '',
      setLength:   user.setLength    || '',
      travel:      user.travel       || '',
      audienceSize:user.audienceSize || '',
      sound:       user.sound        || '',
      stageSize:   user.stageSize    || '',
      rider:       user.rider        || '',
      website:     user.website      || '',
      epk:         user.epk          || '',
      instagram:   user.instagram    || '',
      facebook:    user.facebook     || '',
      tiktok:      user.tiktok       || '',
      youtube:     user.youtube      || '',
      spotify:     user.spotify      || '',
      soundcloud:  user.soundcloud   || '',
    });
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  // ── Auth API ──────────────────────────────────────────────────────────────
  const BookerAuth = {

    login(email, password) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return { ok: false, error: 'Invalid email or password.' };
      ensureProfile(user);
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      const firstProfile = profiles.find(p => p.userId === user.id);
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: user.id,
        activeProfileId: firstProfile ? firstProfile.id : null,
        ts: Date.now(),
      }));
      return { ok: true, user };
    },

    signup(firstName, lastName, email, password, artistName, genre) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (users.find(u => u.email === email)) return { ok: false, error: 'An account with this email already exists.' };
      const userId = 'booker_' + Date.now();
      const user = {
        id: userId, firstName, lastName, email, password,
        joined: new Date().toISOString(),
        verified: false,
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      // Create first band profile
      const profileId = 'profile_' + Date.now();
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      profiles.push({
        id: profileId,
        userId,
        artistName: artistName || `${firstName} ${lastName}`,
        genre: genre || '',
        bio: '', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}&backgroundColor=FF385C&textColor=ffffff`,
      });
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, activeProfileId: profileId, ts: Date.now() }));
      return { ok: true, user };
    },

    logout(redirect) {
      localStorage.removeItem(SESSION_KEY);
      if (redirect) window.location.href = redirect;
    },

    currentUser() {
      const session = getSession();
      if (!session) return null;
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return users.find(u => u.id === session.userId) || null;
    },

    currentProfile() {
      const session = getSession();
      if (!session) return null;
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      return profiles.find(p => p.id === session.activeProfileId) || profiles.find(p => p.userId === session.userId) || null;
    },

    getProfiles() {
      const session = getSession();
      if (!session) return [];
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      return profiles.filter(p => p.userId === session.userId);
    },

    setActiveProfile(profileId) {
      const session = getSession();
      if (!session) return;
      session.activeProfileId = profileId;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    createProfile(fields) {
      const session = getSession();
      if (!session) return null;
      const profileId = 'profile_' + Date.now();
      const profile = Object.assign({ id: profileId, userId: session.userId }, fields);
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      profiles.push(profile);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      this.setActiveProfile(profileId);
      return profile;
    },

    deleteProfile(profileId) {
      const session = getSession();
      if (!session) return false;
      const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
      const remaining = profiles.filter(p => !(p.id === profileId && p.userId === session.userId));
      if (remaining.filter(p => p.userId === session.userId).length === 0) return false; // must keep at least one
      localStorage.setItem(PROFILES_KEY, JSON.stringify(remaining));
      if (session.activeProfileId === profileId) {
        const next = remaining.find(p => p.userId === session.userId);
        if (next) this.setActiveProfile(next.id);
      }
      return true;
    },

    // Updates account-level fields (firstName, lastName, email, password, phone) on the user object,
    // and profile-level fields on the active band profile.
    updateProfile(updates) {
      const session = getSession();
      if (!session) return;
      const accountUpdates  = {};
      const profileUpdates  = {};
      Object.keys(updates).forEach(k => {
        if (ACCOUNT_FIELDS.has(k)) accountUpdates[k] = updates[k];
        else profileUpdates[k] = updates[k];
      });
      if (Object.keys(accountUpdates).length) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const idx = users.findIndex(u => u.id === session.userId);
        if (idx > -1) { Object.assign(users[idx], accountUpdates); localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
      }
      if (Object.keys(profileUpdates).length) {
        const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
        const idx = profiles.findIndex(p => p.id === session.activeProfileId);
        if (idx > -1) { Object.assign(profiles[idx], profileUpdates); localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }
      }
    },

    requireAuth(redirect) {
      if (!this.currentUser()) window.location.href = redirect || 'booker-login.html';
    },

    requireGuest(redirect) {
      if (this.currentUser()) window.location.href = redirect || 'booker-dashboard.html';
    },
  };

  global.BookerAuth = BookerAuth;
})(window);
