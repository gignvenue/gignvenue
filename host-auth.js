/* ============================================
   HOST AUTH — shared across all pages
   Uses localStorage to simulate a session.
   ============================================ */

const Auth = (() => {
  const USERS_KEY   = 'gnv_host_users';
  const SESSION_KEY = 'gnv_host_session';

  /* ── seed a demo account on first load ── */
  function _seed() {
    if (getUsers().length) return;
    const demo = {
      id        : 'u_demo',
      firstName : 'Sarah',
      lastName  : 'Johnson',
      email     : 'sarah@example.com',
      password  : 'Password1',          // plain-text only for demo
      avatar    : 'https://randomuser.me/api/portraits/women/44.jpg',
      joined    : '2020-03-15',
      superhost : true,
      phone     : '+1 (310) 555-0192',
      bio       : 'Passionate traveler and host. Love connecting with guests from all over the world.',
    };
    saveUsers([demo]);
  }

  function getUsers()          { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  function saveUsers(arr)      { localStorage.setItem(USERS_KEY, JSON.stringify(arr)); }
  function getSession()        { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  function saveSession(user)   { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
  function clearSession()      { localStorage.removeItem(SESSION_KEY); }

  function currentUser() { return getSession(); }

  function requireAuth(redirectTo = 'host-login.html') {
    if (!currentUser()) { window.location.href = redirectTo; }
  }

  function requireGuest(redirectTo = 'host-dashboard.html') {
    if (currentUser()) { window.location.href = redirectTo; }
  }

  function login(email, password) {
    _seed();
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'Incorrect email or password.' };
    const { password: _pw, ...safe } = user;
    saveSession(safe);
    return { ok: true, user: safe };
  }

  function signup(firstName, lastName, email, password) {
    _seed();
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const newUser = {
      id        : 'u_' + Date.now(),
      firstName,
      lastName,
      email,
      password,
      avatar    : `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}`,
      joined    : new Date().toISOString().slice(0, 10),
      superhost : false,
      phone     : '',
      bio       : '',
    };
    users.push(newUser);
    saveUsers(users);
    const { password: _pw, ...safe } = newUser;
    saveSession(safe);
    return { ok: true, user: safe };
  }

  function logout(redirectTo = 'index.html') {
    clearSession();
    window.location.href = redirectTo;
  }

  function updateProfile(updates) {
    const session = getSession();
    if (!session) return;
    const users   = getUsers();
    const idx     = users.findIndex(u => u.id === session.id);
    if (idx === -1) return;
    Object.assign(users[idx], updates);
    saveUsers(users);
    const { password: _pw, ...safe } = users[idx];
    saveSession(safe);
    return safe;
  }

  /* call once on page load to seed the demo account */
  _seed();

  return { login, signup, logout, currentUser, requireAuth, requireGuest, updateProfile };
})();
