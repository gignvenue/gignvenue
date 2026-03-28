// ─── DEMO RESET ───────────────────────────────────────────────────────────────
// Increment DEMO_VERSION any time seed data changes to auto-wipe stale state.

const DEMO_VERSION = 'v1';

const _DEMO_KEYS = k => k.startsWith('bb_') || k.startsWith('gnv_');

function _clearDemoStorage() {
  Object.keys(localStorage).filter(_DEMO_KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.setItem('gnv_demo_version', DEMO_VERSION);
}

// Auto-reset if version has changed since last visit
if (localStorage.getItem('gnv_demo_version') !== DEMO_VERSION) {
  _clearDemoStorage();
}

// Inject the reset button once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.createElement('button');
  btn.id        = 'demoResetBtn';
  btn.innerHTML = '↺ Reset demo';
  btn.title     = 'Clear all demo data and restore defaults';
  btn.style.cssText = [
    'position:fixed', 'bottom:20px', 'left:20px', 'z-index:9999',
    'background:#141414', 'color:#888', 'border:1px solid #2e2e2e',
    'border-radius:8px', 'padding:8px 14px', 'font-size:12px',
    'font-weight:600', 'cursor:pointer', 'letter-spacing:.04em',
    'transition:color .15s,border-color .15s', 'font-family:inherit',
  ].join(';');
  btn.onmouseenter = () => { btn.style.color = '#EF60A3'; btn.style.borderColor = '#EF60A3'; };
  btn.onmouseleave = () => { btn.style.color = '#888';    btn.style.borderColor = '#2e2e2e'; };
  btn.onclick = function () {
    if (!confirm('Reset the demo to its default state?\n\nAll local changes will be cleared.')) return;
    _clearDemoStorage();
    location.reload();
  };
  document.body.appendChild(btn);
});
