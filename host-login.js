/* ============================================
   HOST LOGIN PAGE LOGIC
   ============================================ */

'use strict';

// Redirect if already logged in
Auth.requireGuest('host-dashboard.html');

// ─── TAB SWITCHING ────────────────────────────────────────────────────────────

function switchTab(tab) {
  const isLogin  = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);
  document.getElementById('forgotForm').classList.add('hidden');
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabSignup').classList.toggle('active', !isLogin);
  document.getElementById('authSwitchNote').innerHTML = isLogin
    ? `Don't have an account? <button type="button" class="link-btn" onclick="switchTab('signup')">Sign up</button>`
    : `Already have an account? <button type="button" class="link-btn" onclick="switchTab('login')">Log in</button>`;
}

function showForgot() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('hidden');
  document.getElementById('authSwitchNote').innerHTML = '';
}
function showLogin() { switchTab('login'); }

// ─── VALIDATION HELPERS ───────────────────────────────────────────────────────

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearErrors(...ids) { ids.forEach(id => setError(id, '')); }

function markInput(id, valid) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('error', !valid);
  el.classList.toggle('valid', valid);
}

function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
function validatePassword(val) { return val.length >= 8 && /\d/.test(val); }

// ─── PASSWORD TOGGLE ──────────────────────────────────────────────────────────

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text';  btn.textContent = 'Hide'; }
  else                           { input.type = 'password'; btn.textContent = 'Show'; }
}

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────────

document.getElementById('signupPassword').addEventListener('input', function () {
  const val  = this.value;
  const bar  = document.getElementById('pwBar');
  const hint = document.getElementById('pwHint');
  bar.className = 'pw-bar';
  if (!val) { hint.textContent = 'Use 8+ characters with a mix of letters and numbers.'; return; }
  let score = 0;
  if (val.length >= 8)        score++;
  if (/[A-Z]/.test(val))      score++;
  if (/\d/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  if (score <= 1)      { bar.classList.add('weak');   hint.textContent = 'Too weak — add numbers or symbols.'; }
  else if (score <= 2) { bar.classList.add('fair');   hint.textContent = 'Getting there — try adding uppercase or symbols.'; }
  else                 { bar.classList.add('strong');  hint.textContent = 'Strong password!'; }
});

// ─── LOGIN HANDLER ────────────────────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  clearErrors('loginEmailErr', 'loginPasswordErr', 'loginFormErr');

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  let ok = true;

  if (!validateEmail(email)) {
    setError('loginEmailErr', 'Please enter a valid email address.');
    markInput('loginEmail', false); ok = false;
  } else { markInput('loginEmail', true); }

  if (!password) {
    setError('loginPasswordErr', 'Password is required.');
    markInput('loginPassword', false); ok = false;
  } else { markInput('loginPassword', true); }

  if (!ok) return;

  const btn = document.getElementById('loginBtn');
  setLoading(btn, true);

  // Simulate network latency
  await delay(900);

  const result = await Auth.login(email, password);
  setLoading(btn, false);

  if (!result.ok) {
    setError('loginFormErr', result.error);
    markInput('loginEmail', false);
    markInput('loginPassword', false);
    shakeForm('loginForm');
    return;
  }

  // Redirect to dashboard
  window.location.href = 'host-dashboard.html';
}

// ─── SIGNUP HANDLER ───────────────────────────────────────────────────────────

async function handleSignup(e) {
  e.preventDefault();
  clearErrors('signupFirstErr', 'signupLastErr', 'signupEmailErr', 'signupPasswordErr', 'signupConfirmErr', 'signupFormErr');

  const first    = document.getElementById('signupFirst').value.trim();
  const last     = document.getElementById('signupLast').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  const agreed   = document.getElementById('agreeTerms').checked;
  let ok = true;

  if (!first) { setError('signupFirstErr', 'First name is required.'); markInput('signupFirst', false); ok = false; }
  else markInput('signupFirst', true);

  if (!last) { setError('signupLastErr', 'Last name is required.'); markInput('signupLast', false); ok = false; }
  else markInput('signupLast', true);

  if (!validateEmail(email)) { setError('signupEmailErr', 'Enter a valid email address.'); markInput('signupEmail', false); ok = false; }
  else markInput('signupEmail', true);

  if (!validatePassword(password)) {
    setError('signupPasswordErr', 'Must be 8+ characters with at least one number.');
    markInput('signupPassword', false); ok = false;
  } else markInput('signupPassword', true);

  if (password !== confirm) {
    setError('signupConfirmErr', 'Passwords do not match.');
    markInput('signupConfirm', false); ok = false;
  } else if (confirm) markInput('signupConfirm', true);

  if (!agreed) { setError('signupFormErr', 'You must agree to the Terms of Service to continue.'); ok = false; }

  if (!ok) return;

  const btn = document.getElementById('signupBtn');
  setLoading(btn, true);
  await delay(1000);

  const result = await Auth.signup(first, last, email, password);
  setLoading(btn, false);

  if (!result.ok) {
    setError('signupFormErr', result.error);
    markInput('signupEmail', false);
    shakeForm('signupForm');
    return;
  }

  window.location.href = 'host-dashboard.html';
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

async function handleForgot() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!validateEmail(email)) {
    document.getElementById('forgotEmail').classList.add('error');
    return;
  }
  await Auth.sendPasswordReset(email);
  // Always show success — don't reveal whether email exists
  document.getElementById('forgotSuccess').classList.remove('hidden');
}

// ─── SOCIAL LOGIN (SIMULATED) ────────────────────────────────────────────────

function socialLogin(provider) {
  showToastMsg(`${provider} login coming soon — please use email for now.`);
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.btn-text').hidden   = loading;
  btn.querySelector('.btn-spinner').hidden = !loading;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function shakeForm(id) {
  const form = document.getElementById(id);
  form.style.animation = 'shake 0.4s ease';
  form.addEventListener('animationend', () => form.style.animation = '', { once: true });
}

function showToastMsg(msg) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:10px 20px;border-radius:999px;font-size:14px;z-index:9999;transition:opacity 0.3s';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 2500);
}

// CSS shake animation injected inline
const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }`;
document.head.appendChild(style);
