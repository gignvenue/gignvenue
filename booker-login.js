/* ============================================
   BOOKER LOGIN PAGE LOGIC
   ============================================ */

'use strict';

// Redirect if already logged in
BookerAuth.requireGuest('booker-dashboard.html');

// ─── TAB SWITCHER ──────────────────────────────────────────────────────────────

function switchTab(tab) {
  ['loginForm','signupForm','forgotForm'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('tabLogin')?.classList.remove('active');
  document.getElementById('tabSignup')?.classList.remove('active');

  if (tab === 'login')  {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('tabLogin').classList.add('active');
  } else if (tab === 'signup') {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('tabSignup').classList.add('active');
  } else if (tab === 'forgot') {
    document.getElementById('forgotForm').classList.remove('hidden');
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPassword').value;
  let valid = true;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    setErr('loginEmailErr', 'Please enter a valid email address.', 'loginEmail');
    valid = false;
  }
  if (!pw) {
    setErr('loginPwErr', 'Please enter your password.', 'loginPassword');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = `<svg class="spin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Logging in…`;

  const result = await BookerAuth.login(email, pw);
  if (result.ok) {
    window.location.href = 'booker-dashboard.html';
  } else {
    setErr('loginFormErr', result.error);
    btn.disabled = false;
    btn.textContent = 'Log in';
  }
}

// ─── SIGNUP ────────────────────────────────────────────────────────────────────

async function handleSignup(e) {
  e.preventDefault();
  clearErrors();

  const first   = document.getElementById('suFirst').value.trim();
  const last    = document.getElementById('suLast').value.trim();
  const artist  = document.getElementById('suArtist').value.trim();
  const genre   = document.getElementById('suGenre').value.trim();
  const email   = document.getElementById('suEmail').value.trim();
  const pw      = document.getElementById('suPassword').value;
  const confirm = document.getElementById('suConfirm').value;
  const agreed  = document.getElementById('suAgree').checked;
  let valid = true;

  if (!first)  { setErr('suFirstErr', 'Required.', 'suFirst'); valid = false; }
  if (!last)   { setErr('suLastErr', 'Required.', 'suLast'); valid = false; }
  if (!email || !/\S+@\S+\.\S+/.test(email)) { setErr('suEmailErr', 'Valid email required.', 'suEmail'); valid = false; }
  if (pw.length < 8) { setErr('suPwErr', 'Password must be at least 8 characters.', 'suPassword'); valid = false; }
  if (pw !== confirm) { setErr('suConfirmErr', 'Passwords do not match.', 'suConfirm'); valid = false; }
  if (!agreed) { setErr('signupFormErr', 'Please agree to the terms to continue.'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('signupBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  const result = await BookerAuth.signup(first, last, email, pw, artist, genre);
  if (result.ok) {
    // With email confirmation enabled, Supabase doesn't create a session until confirmed
    const { data: { session } } = await gnvClient.auth.getSession();
    if (session) {
      window.location.href = 'booker-dashboard.html';
    } else {
      const form = document.getElementById('signupForm');
      if (form) form.innerHTML = `
        <div style="text-align:center;padding:24px 0;">
          <div style="font-size:40px;margin-bottom:16px;">📬</div>
          <h2 style="font-size:20px;font-weight:700;margin:0 0 10px;">Check your inbox</h2>
          <p style="color:#888;font-size:14px;line-height:1.6;margin:0 0 20px;">We sent a confirmation link to <strong>${document.getElementById('suEmail')?.value || 'your email'}</strong>. Click it to activate your account, then log in here.</p>
          <button type="button" class="btn-primary" onclick="switchTab('login')" style="width:100%;">Go to log in</button>
        </div>`;
    }
  } else {
    setErr('signupFormErr', result.error);
    btn.disabled = false;
    btn.textContent = 'Create account';
  }
}

// ─── FORGOT PASSWORD ────────────────────────────────────────────────────────────

async function handleForgot() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return;
  await BookerAuth.sendPasswordReset(email);
  // Always show success — don't reveal whether email exists
  document.getElementById('forgotSuccess').classList.remove('hidden');
}

// ─── SOCIAL LOGIN ──────────────────────────────────────────────────────────────

function socialLogin(provider) {
  showToastMsg(`${provider} login coming soon — please use email for now.`);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clearErrors() {
  document.querySelectorAll('.field-error, .form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('input.error, input.valid').forEach(el => {
    el.classList.remove('error', 'valid');
  });
}

function setErr(errId, msg, inputId) {
  const el = document.getElementById(errId);
  if (el) el.textContent = msg;
  if (inputId) document.getElementById(inputId)?.classList.add('error');
}

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Hide' : 'Show';
}

function checkPwStrength(pw) {
  const bar  = document.getElementById('pwBar');
  const hint = document.getElementById('pwHint');
  if (!bar) return;
  bar.className = 'pw-bar';
  if (pw.length === 0) { bar.style.width = '0'; hint.textContent = 'Use 8+ characters with a mix of letters and numbers.'; return; }
  const strong = pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
  const fair   = pw.length >= 8 && (/[A-Z]/.test(pw) || /[0-9]/.test(pw));
  if (strong)     { bar.classList.add('strong'); hint.textContent = 'Strong password!'; }
  else if (fair)  { bar.classList.add('fair');   hint.textContent = 'Good — add symbols or uppercase for a stronger password.'; }
  else            { bar.classList.add('weak');    hint.textContent = 'Too weak — use at least 8 characters.'; }
}
