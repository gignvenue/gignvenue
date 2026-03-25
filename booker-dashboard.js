/* ============================================
   BOOKER DASHBOARD LOGIC — GigNVenue
   ============================================ */

'use strict';

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
// Set ENABLE_DATE_PASSED = true when deploying live so past-dated requests
// automatically move to the Cancelled tab with a "Date passed" badge.
const ENABLE_DATE_PASSED = true;

// Set ENABLE_AUTO_REPLY = false when live cross-dashboard messaging is active.
// When true, a simulated host reply appears 1.5 s after the artist sends a message.
const ENABLE_AUTO_REPLY = true;
// ─────────────────────────────────────────────────────────────────────────────

let user    = null;
let profile = null;
let _supabaseResolutions = []; // pending booking_resolutions rows for this artist
let _realtimeChannel    = null; // active Supabase Realtime channel for open message thread

function resolveNightlyRate(l, iso) {
  if (l.dateOverrides?.[iso] !== undefined) return l.dateOverrides[iso];
  if (l.weekdayRates) {
    const dow = new Date(iso + 'T00:00:00').getDay();
    if (l.weekdayRates[dow] !== undefined) return l.weekdayRates[dow];
  }
  return l.price;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

// All venues (mirrors main site listings for the calendar)
const _CP_30_7   = 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.';
const _CP_21_7   = 'Cancellations more than 21 days before the event date are eligible for a full deposit refund. Cancellations within 21 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.';
const _CP_60_14  = 'Cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event date will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.';

const ALL_VENUES = [
  { id:'l1',  title:'The Neon Stage',              location:'Hollywood, California',      img:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400&q=70', price:2100,  weekdayRates:{0:1800,1:1800,2:1800,3:1800,4:2100,5:2800,6:2400}, capacity:500,  lat:34.0928,  lng:-118.3287, cancellationPolicy: _CP_30_7  },
  { id:'l2',  title:'Velvet Lounge',               location:'Brooklyn, New York',         img:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70', price:1300,  weekdayRates:{0:1200,1:1100,2:1100,3:1100,4:1300,5:1800,6:1600}, capacity:200,  lat:40.7173,  lng:-73.9573,  cancellationPolicy: _CP_21_7  },
  { id:'l3',  title:'Rooftop Sessions',            location:'Manhattan, New York',        img:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70', price:3500,  capacity:120,  lat:40.7614,  lng:-73.9937,  cancellationPolicy: _CP_30_7  },
  { id:'l4',  title:'The Midnight Rooftop',        location:'Manhattan, New York',        img:'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=70', price:3600,  capacity:250,  lat:40.7505,  lng:-73.9934,  cancellationPolicy: _CP_30_7,  rating:4.88 },
  { id:'l5',  title:'Blue Note Underground',       location:'New Orleans, Louisiana',     img:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70', price:1400,  capacity:180,  lat:29.9511,  lng:-90.0715,  cancellationPolicy: _CP_21_7,  rating:4.95 },
  { id:'l6',  title:'Coachella Stage II Replica',  location:'Indio, California',          img:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=70', price:8500,  capacity:5000, lat:33.6823,  lng:-116.2370, cancellationPolicy: 'Cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event date will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. Due to the scale of production and infrastructure required, no exceptions can be made. The GigNVenue booking fee is non-refundable in all cases.', rating:4.91 },
  { id:'l7',  title:'The Chicago Shrine',          location:'Chicago, Illinois',          img:'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&q=70', price:3200,  capacity:1500, lat:41.8957,  lng:-87.6298,  cancellationPolicy: _CP_30_7,  rating:4.96 },
  { id:'l8',  title:'The Ryman Stage',             location:'Nashville, Tennessee',       img:'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=70', price:6800,  capacity:2362, lat:36.1612,  lng:-86.7765,  cancellationPolicy: 'Due to the historic and high-demand nature of this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.', rating:4.99 },
  { id:'l9',  title:'Red Rocks Amphitheatre',      location:'Morrison, Colorado',         img:'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=400&q=70', price:22000, capacity:9525, lat:39.6655,  lng:-105.2057, cancellationPolicy: 'Given the unique nature of this venue and the production commitments involved, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.', rating:4.94 },
  { id:'l10', title:'The Corner Dive',             location:'Austin, Texas',              img:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=70', price:800,   capacity:120,  lat:30.2672,  lng:-97.7431,  cancellationPolicy: _CP_21_7,  rating:4.82 },
  { id:'l11', title:'The Fox Theatre',             location:'Atlanta, Georgia',           img:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=70', price:18000, capacity:2679, lat:33.7725,  lng:-84.3857,  cancellationPolicy: 'Due to the historic significance and demand for this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.', rating:5.0  },
  { id:'l12', title:'Fillmore West Revival',       location:'San Francisco, California',  img:'https://images.unsplash.com/photo-1598387993441-a364f854cde0?w=400&q=70', price:3800,  capacity:1150, lat:37.7841,  lng:-122.4330, cancellationPolicy: _CP_30_7,  rating:4.90 },
  { id:'l13', title:'The Summit Arena',            location:'Houston, Texas',             img:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=70', price:28000, capacity:16000, lat:29.7490,  lng:-95.3677, cancellationPolicy: 'Due to the scale of production commitments at this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. No exceptions. The GigNVenue booking fee is non-refundable in all cases.', rating:4.87 },
];

// My saved venues — array of { id, title, location, img, price, capacity, rating }
// Backed by localStorage key 'bb_saved_venues'; seeded with demo defaults on first load
let SAVED_VENUES = [];
(function() {
  const stored = localStorage.getItem('bb_saved_venues');
  if (stored === null) {
    const defaults = ['l2','l5','l8'].map(id => ALL_VENUES.find(v => v.id === id)).filter(Boolean);
    SAVED_VENUES.push(...defaults);
    localStorage.setItem('bb_saved_venues', JSON.stringify(SAVED_VENUES));
  } else {
    try { SAVED_VENUES.push(...JSON.parse(stored)); } catch(e) {}
  }
})();

// ─── WAITLIST ─────────────────────────────────────────────────────────────────

let WAITLIST = [];
try { WAITLIST = JSON.parse(localStorage.getItem('bb_waitlist') || '[]'); } catch(e) {}
function saveWaitlist() { try { localStorage.setItem('bb_waitlist', JSON.stringify(WAITLIST)); } catch(e) {} }

function isOnWaitlist(reqId) { return WAITLIST.some(w => w.reqId === reqId); }

function toggleWaitlist(reqId, venueId, date) {
  if (isOnWaitlist(reqId)) {
    WAITLIST = WAITLIST.filter(w => w.reqId !== reqId);
    showDash('Removed from waitlist.');
  } else {
    WAITLIST.push({ reqId, venueId, date, addedAt: Date.now() });
    showDash('Added to waitlist — we\'ll let you know if this date opens up.');
  }
  saveWaitlist();
  renderRequests(requestFilter);
}

// ─── STRIKE SYSTEM ────────────────────────────────────────────────────────────

const _STRIKE_KEY = 'bb_strikes';

function getStrikeRecord() {
  try {
    const all = JSON.parse(localStorage.getItem(_STRIKE_KEY) || '{}');
    return all[user.id] || { count: 0, warned: false, freezeUntil: null, flagged: false };
  } catch(e) { return { count: 0, warned: false, freezeUntil: null, flagged: false }; }
}

function saveStrikeRecord(rec) {
  try {
    const all = JSON.parse(localStorage.getItem(_STRIKE_KEY) || '{}');
    all[user.id] = rec;
    localStorage.setItem(_STRIKE_KEY, JSON.stringify(all));
  } catch(e) {}
}

function isAccountFrozen() {
  const rec = getStrikeRecord();
  if (rec.flagged) return { frozen: true, reason: 'flagged' };
  if (rec.freezeUntil && Date.now() < rec.freezeUntil) return { frozen: true, reason: 'freeze', until: rec.freezeUntil };
  return { frozen: false };
}

function addStrike() {
  const rec = getStrikeRecord();
  rec.count = (rec.count || 0) + 1;
  if (rec.count === 1)      rec.warned     = true;
  else if (rec.count === 2) rec.freezeUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
  else if (rec.count >= 3)  rec.flagged    = true;
  saveStrikeRecord(rec);
  return rec;
}

function renderStrikeBanner() {
  const rec = getStrikeRecord();
  const el  = document.getElementById('strikeBanner');
  if (!el) return;
  if (!rec.count) { el.style.display = 'none'; return; }
  el.style.display = '';
  if (rec.flagged) {
    el.className = 'strike-banner strike-banner-flagged';
    el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Account under review</strong> — Your account has been flagged after ${rec.count} missed payment windows. <a href="contact.html" style="color:inherit;text-decoration:underline">Contact support</a> to restore booking access.</span>`;
  } else if (rec.freezeUntil && Date.now() < rec.freezeUntil) {
    const d = new Date(rec.freezeUntil).toLocaleDateString('en-US', { month:'long', day:'numeric' });
    el.className = 'strike-banner strike-banner-freeze';
    el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span><strong>Requests paused until ${d}</strong> — A second approval expired without payment or a voluntary decline. New booking requests are suspended for 7 days.</span>`;
  } else if (rec.warned) {
    el.className = 'strike-banner strike-banner-warn';
    el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span><strong>Heads up</strong> — A recent booking approval expired without payment. If this happens again, new requests will be paused for 7 days. <button class="strike-dismiss-btn" onclick="dismissStrikeWarning()">Got it</button></span>`;
  }
}

function dismissStrikeWarning() {
  const el = document.getElementById('strikeBanner');
  if (el) el.style.display = 'none';
}

function checkExpiredApprovals() {
  const now = Date.now();
  let changed = false;
  ALL_REQUESTS.filter(r => r.bookerId === user.id).forEach(r => {
    if (r.status === 'approved' && r.paymentStatus === 'unpaid' && r.paymentDeadline && r.paymentDeadline < now) {
      r.status       = 'cancelled';
      r.cancelledBy  = 'system';
      r.cancelReason = 'Payment window expired';
      changed = true;
      addStrike();
      incrementMyReliability(false);
      // Notify host
      try {
        const v = ALL_VENUES.find(vv => vv.id === r.venueId);
        const notifs = JSON.parse(localStorage.getItem('bb_host_notifications') || '[]');
        notifs.push({
          id: 'notif_exp_' + r.id,
          artistName: `${user.firstName} ${user.lastName}`.trim(),
          venueName:  v?.title || 'your venue',
          dates:      r.date,
          eventType:  r.eventType || 'event',
          reason:     'Payment window expired — booking automatically cancelled.',
          type:       'expired',
        });
        localStorage.setItem('bb_host_notifications', JSON.stringify(notifs));
      } catch(e) {}
    }
  });
  if (changed) { renderStrikeBanner(); renderOverview(); }
}

// ─── RELIABILITY ───────────────────────────────────────────────────────────────
// Artist side: tracks this user's own approval-to-payment ratio.
// Host side: seeded by name for demo display (see host-dashboard.js).

const _RELIABILITY_KEY = 'bb_reliability';

function getMyReliability() {
  try {
    const all = JSON.parse(localStorage.getItem(_RELIABILITY_KEY) || '{}');
    return all[user.id] || null;
  } catch(e) { return null; }
}

function incrementMyReliability(paid) {
  try {
    const all = JSON.parse(localStorage.getItem(_RELIABILITY_KEY) || '{}');
    if (!all[user.id]) all[user.id] = { approvals: 0, paid: 0 };
    all[user.id].approvals++;
    if (paid) all[user.id].paid++;
    localStorage.setItem(_RELIABILITY_KEY, JSON.stringify(all));
  } catch(e) {}
}

function seedReliabilityData() {
  try {
    const all = JSON.parse(localStorage.getItem(_RELIABILITY_KEY) || '{}');
    // Seed demo artist reliability visible on the host side (keyed by full name)
    const hostSeed = {
      'Emily Clarke':  { approvals: 8, paid: 8 },
      'Jake Morrison': { approvals: 6, paid: 4 },
      'Priya Nair':    { approvals: 2, paid: 2 },
      'Marcus Webb':   { approvals: 3, paid: 1 },
      'Leon Hayes':    { approvals: 4, paid: 4 },
      'Jade Rivera':   { approvals: 5, paid: 5 },
    };
    Object.entries(hostSeed).forEach(([name, val]) => {
      if (!all[name]) all[name] = val;
    });
    // Seed the logged-in demo artist with a clean 100% record if not set
    if (!all[user.id]) all[user.id] = { approvals: 3, paid: 3 };
    localStorage.setItem(_RELIABILITY_KEY, JSON.stringify(all));
  } catch(e) {}
}

// ─── DECLINE APPROVED BOOKING ─────────────────────────────────────────────────

let _pendingDeclineReqId = null;

function openDeclineModal(reqId) {
  _pendingDeclineReqId = reqId;
  document.getElementById('dmReason').value = '';
  document.getElementById('dmOverlay').classList.add('open');
  document.getElementById('dmModal').classList.add('open');
}

function closeDeclineModal() {
  _pendingDeclineReqId = null;
  document.getElementById('dmOverlay').classList.remove('open');
  document.getElementById('dmModal').classList.remove('open');
}

function submitDecline() {
  const reason = document.getElementById('dmReason').value;
  if (!reason) { showDash('Please select a reason before confirming.'); return; }
  const r = ALL_REQUESTS.find(x => x.id === _pendingDeclineReqId);
  if (!r) { closeDeclineModal(); return; }
  const v = ALL_VENUES.find(vv => vv.id === r.venueId);
  r.status      = 'cancelled';
  r.cancelledBy = 'artist';
  r.cancelReason = reason;
  // Count against reliability (approvals went up, paid did not) but NO strike
  incrementMyReliability(false);
  // Notify host
  try {
    const artistName = profile.artistName || `${user.firstName} ${user.lastName}`.trim();
    const notifs = JSON.parse(localStorage.getItem('bb_host_notifications') || '[]');
    notifs.push({
      id:         'notif_dec_' + r.id,
      artistName,
      venueName:  v?.title || 'your venue',
      dates:      r.date,
      eventType:  r.eventType || 'event',
      reason,
      type:       'artist_declined',
    });
    localStorage.setItem('bb_host_notifications', JSON.stringify(notifs));
  } catch(e) {}
  closeDeclineModal();
  renderRequests(requestFilter);
  renderOverview();
  showDash(`Booking declined — ${v?.title || 'the venue'} has been notified.`);
}

// All booking requests across all bookers (for demand calculation)
// Includes my requests (bookerId === user.id) and others (simulated)
// Each request covers exactly one date — sequential nights are separate requests with individual statuses.
const ALL_REQUESTS = [
  { id:'req_a1a', bookerId:'other1', venueId:'l1', date:'2026-04-12', status:'pending',  eventType:'Concert',        attendance:400 },
  { id:'req_a1b', bookerId:'other1', venueId:'l1', date:'2026-04-13', status:'pending',  eventType:'Concert',        attendance:400 },
  { id:'req_a2',  bookerId:'other2', venueId:'l1', date:'2026-04-12', status:'pending',  eventType:'Album launch',   attendance:200 },
  { id:'req_a3a', bookerId:'other3', venueId:'l1', date:'2026-04-19', status:'approved', eventType:'Concert',        attendance:3000 },
  { id:'req_a3b', bookerId:'other3', venueId:'l1', date:'2026-04-20', status:'approved', eventType:'Concert',        attendance:3000 },
  { id:'req_a4',  bookerId:'other1', venueId:'l1', date:'2026-04-26', status:'pending',  eventType:'Concert',        attendance:500 },
  { id:'req_b1',  bookerId:'other2', venueId:'l2', date:'2026-04-05', status:'pending',  eventType:'Club night',     attendance:150 },
  { id:'req_b2a', bookerId:'other3', venueId:'l2', date:'2026-04-05', status:'pending',  eventType:'Private event',  attendance:80 },
  { id:'req_b2b', bookerId:'other3', venueId:'l2', date:'2026-04-06', status:'pending',  eventType:'Private event',  attendance:80 },
  { id:'req_b3',  bookerId:'other4', venueId:'l2', date:'2026-04-12', status:'pending',  eventType:'Concert',        attendance:200 },
  { id:'req_c1a', bookerId:'other1', venueId:'l8', date:'2026-04-18', status:'approved', eventType:'Festival set',   attendance:2000 },
  { id:'req_c1b', bookerId:'other1', venueId:'l8', date:'2026-04-19', status:'approved', eventType:'Festival set',   attendance:2000 },
  { id:'req_c2',  bookerId:'other2', venueId:'l8', date:'2026-04-25', status:'pending',  eventType:'Concert',        attendance:800 },
  // My own requests — one date each, independent statuses
  { id:'req_mine1',  bookerId:user.id, venueId:'l2', date:'2026-04-15', status:'pending',  eventType:'Concert / live show', attendance:180, notes:'Indie rock quartet, 90-min set. Need full backline.',   sent:'2026-03-08' },
  { id:'req_mine2a', bookerId:user.id, venueId:'l5', date:'2026-04-22', status:'approved', eventType:'Album launch',         attendance:120, notes:'Album release party. PA system required.',            sent:'2026-03-01', paymentStatus:'unpaid', paymentDeadline: Date.now() + 47 * 3600 * 1000 },
  { id:'req_mine2b', bookerId:user.id, venueId:'l5', date:'2026-04-23', status:'declined', eventType:'Album launch',         attendance:120, notes:'Album release party. PA system required.',            sent:'2026-03-01' },
  { id:'req_mine3',  bookerId:user.id, venueId:'l1', date:'2026-05-10', status:'declined', eventType:'Concert / live show',  attendance:500, notes:'Large headline show. Need full production.',          sent:'2026-02-20' },
];

// My messages with venue hosts
const MY_MESSAGES = [
  { id:'cm1', from:'Velvet Lounge', fromImg:'https://api.dicebear.com/7.x/initials/svg?seed=VelvetLounge&backgroundColor=FF2D78&textColor=ffffff', venue:'Velvet Lounge', venueId:'l2', lastMsg:'Your request for Apr 15 looks great!', time:'Today', unread:true,
    thread:[
      { mine:false, text:'Hi! We received your booking request for April 15th.', time:'9:12 AM' },
      { mine:false, text:'Your request for Apr 15 looks great! We love hosting indie acts. Can you send over your tech rider?', time:'9:14 AM' },
      { mine:true,  text:"Hi Sarah! Amazing, thank you! I'll send the rider over shortly 🎸", time:'9:30 AM' },
    ]
  },
  { id:'cm2', from:'Blue Note Underground', fromImg:'https://api.dicebear.com/7.x/initials/svg?seed=BlueNoteUnderground&backgroundColor=3B82F6&textColor=ffffff', venue:'Blue Note Underground', venueId:'l5', lastMsg:'Confirmed! Apr 22 & 23 are yours 🎶', time:'Yesterday', unread:true,
    thread:[
      { mine:true,  text:'Hi James, so excited about the album launch at Blue Note. Do you have any decoration restrictions?', time:'Yesterday' },
      { mine:false, text:'Hey Alex! Welcome aboard. Confirmed — Apr 22 & 23 are yours 🎶', time:'Yesterday' },
      { mine:false, text:"No decoration restrictions at all. We'll have the space fully ready for you.", time:'Yesterday' },
    ]
  },
  { id:'cm3', from:'The Neon Stage', fromImg:'https://api.dicebear.com/7.x/initials/svg?seed=TheNeonStage&backgroundColor=8B5CF6&textColor=ffffff', venue:'The Neon Stage', venueId:'l1', lastMsg:'Unfortunately we have to decline for May 10.', time:'Feb 20', unread:false,
    thread:[
      { mine:true,  text:'Hi Maria, we would love to headline at The Neon on May 10th. Our show draws about 500+.', time:'Feb 20' },
      { mine:false, text:"Hi Alex! Thanks for reaching out. Unfortunately we have to decline for May 10 — we already have a booked act that night. Hope we can make it work another time!", time:'Feb 20' },
    ]
  },
];

// ─── SUPABASE MAPPING ─────────────────────────────────────────────────────────

function mapVenueForBookerDash(row) {
  return {
    id:                 row.id,
    title:              row.title,
    location:           [row.city, row.state].filter(Boolean).join(', '),
    img:                (row.photos && row.photos[0]) || '',
    price:              row.base_price,
    weekdayRates:       row.weekday_rates || null,
    capacity:           row.capacity,
    lat:                row.lat,
    lng:                row.lng,
    cancellationPolicy: row.cancellation_policy || '',
    hostId:             row.host_id || null,
  };
}

function mapRequestRow(row) {
  return {
    id:              row.id,
    bookerId:        row.artist_id,
    venueId:         row.venue_id,
    date:            row.show_date,
    status:          row.status,
    eventType:       'Concert / live show',
    attendance:      row.fan_count,
    notes:           row.notes || '',
    sent:            row.created_at ? row.created_at.slice(0, 10) : '',
    paymentStatus:   row.payment_status || 'unpaid',
    paymentDeadline: row.payment_due_at ? new Date(row.payment_due_at).getTime() : null,
  };
}

const _calInit = new Date();
let calYear = _calInit.getFullYear(), calMonth = _calInit.getMonth();
let calSelectedDate = null;
let calSelectedVenueId = ALL_VENUES[0].id;
let activeThread = null;
let requestFilter = 'pending';

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // ── Auth ────────────────────────────────────────────────────────────────────
  user = await BookerAuth.requireAuth('booker-login.html');
  if (!user) return;
  profile = user;

  // ── Load Supabase venues into ALL_VENUES ────────────────────────────────────
  try {
    const { data: venueRows } = await gnvClient
      .from('venues').select('*').eq('active', true).eq('archived', false)
      .order('created_at', { ascending: true });
    (venueRows || []).forEach(row => {
      if (!ALL_VENUES.find(v => v.id === row.id)) ALL_VENUES.push(mapVenueForBookerDash(row));
    });
  } catch(e) { console.warn('Could not load venues from Supabase:', e); }

  // ── Load Supabase booking requests into ALL_REQUESTS ────────────────────────
  try {
    const { data: reqRows, error } = await gnvClient
      .from('booking_requests')
      .select('id, venue_id, artist_id, show_date, status, fan_count, notes, nightly_rate, payment_status, payment_due_at, created_at')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false });
    if (error) console.warn('Could not load booking requests:', error.message);
    (reqRows || []).forEach(row => {
      if (!ALL_REQUESTS.find(x => x.id === row.id)) ALL_REQUESTS.push(mapRequestRow(row));
    });
  } catch(e) { console.warn('Could not load booking requests from Supabase:', e); }

  // ── Load pending booking resolutions from Supabase ──────────────────────────
  try {
    const { data: resRows } = await gnvClient
      .from('booking_resolutions')
      .select('id, booking_id, resolution_type, status, artist_refund, venue_release, host_note, new_date, auto_lapse_at, created_at, booking_requests(show_date, venues(title, host_id))')
      .eq('status', 'pending');
    _supabaseResolutions = resRows || [];
  } catch(e) { console.warn('Could not load resolutions:', e); }

  // ── Load message threads from Supabase ───────────────────────────────────────
  try {
    const uuidReqIds = ALL_REQUESTS
      .filter(r => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id))
      .map(r => r.id);
    if (uuidReqIds.length > 0) {
      const { data: msgRows } = await gnvClient
        .from('messages')
        .select('booking_id, sender_id, body, created_at')
        .in('booking_id', uuidReqIds)
        .order('created_at', { ascending: false });
      const seen = new Set();
      (msgRows || []).forEach(row => {
        if (seen.has(row.booking_id)) return;
        seen.add(row.booking_id);
        if (MY_MESSAGES.find(m => m.id === row.booking_id)) return;
        const req = ALL_REQUESTS.find(r => r.id === row.booking_id);
        if (!req) return;
        const venue = ALL_VENUES.find(v => v.id === req.venueId);
        const venueName = venue?.title || 'Venue';
        MY_MESSAGES.unshift({
          id:       row.booking_id,
          from:     venueName,
          fromImg:  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(venueName)}&backgroundColor=555555&textColor=ffffff`,
          venue:    venueName,
          venueId:  req.venueId,
          lastMsg:  row.body || '',
          time:     new Date(row.created_at).toLocaleDateString(),
          unread:   row.sender_id !== user.id,
          thread:   [],
        });
      });
    }
  } catch(e) { console.warn('Could not load message threads:', e); }

  // ── Load unread notification count ──────────────────────────────────────────
  try {
    const { count } = await gnvClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_type', 'artist')
      .eq('recipient_id', user.id)
      .is('read_at', null);
    if (count) {
      const badge = document.getElementById('topbarBadge');
      if (badge) { badge.textContent = count; badge.style.display = ''; }
    }
  } catch(e) { console.warn('Could not load notifications:', e); }

  seedReliabilityData();
  checkExpiredApprovals();
  renderStrikeBanner();
  populateSidebarUser();
  populateTopbarAvatar();
  populateVenueSelect();
  renderOverview();
  renderPendingActions();
  renderRequests('pending');
  renderMessages();
  renderCalendar();
  renderVenueSummary();
  renderSavedVenues();
  populateProfile();
  updateBadges();
  renderTourPlanner();

  // Live-update when resolution state changes in another tab
  window.addEventListener('storage', e => {
    if (e.key === 'gnv_pending_resolutions') { renderPendingActions(); if (requestFilter === 'completed') renderPendingActions('completedActionsArea'); updateBadges(); }
    if (e.key === 'bb_saved_venues') {
      // Heart toggled on browse page (possibly in another tab) — sync immediately
      try { SAVED_VENUES = JSON.parse(e.newValue || '[]'); } catch(err) {}
      renderSavedVenues();
      updateBadges();
    }
  });

  // Handle Stripe Checkout return
  const _sp = new URLSearchParams(window.location.search);
  const _paymentResult  = _sp.get('payment');
  const _paymentBooking = _sp.get('booking');
  if (_paymentResult === 'success' && _paymentBooking) {
    // Mark booking paid in local cache so UI reflects it immediately (webhook will also update DB)
    const r = ALL_REQUESTS.find(x => x.id === _paymentBooking);
    if (r) {
      r.paymentStatus = 'paid';
      incrementMyReliability(true);
      ALL_REQUESTS.filter(x =>
        x.id !== r.id && x.bookerId === user.id && x.date === r.date && x.status === 'pending'
      ).forEach(c => { c.status = 'cancelled'; c.cancelledBy = 'system'; });
    }
    navigate(null, 'bookings');
    setTimeout(() => {
      renderRequests('approved');
      renderOverview();
      updateBadges();
      showDash('Payment confirmed! Your booking is locked in.');
    }, 80);
    history.replaceState({}, '', window.location.pathname);
  } else if (_paymentResult === 'cancelled') {
    showDash('Payment cancelled — your booking is still reserved.');
    history.replaceState({}, '', window.location.pathname);
  }

  // Handle deep-link from public venue profile: ?msg=VenueName
  const msgVenue = new URLSearchParams(window.location.search).get('msg');
  if (msgVenue) {
    const decodedVenue = decodeURIComponent(msgVenue);
    let thread = MY_MESSAGES.find(m => m.venue === decodedVenue);
    if (!thread) {
      thread = {
        id: 'msg_' + Date.now(),
        from: decodedVenue,
        fromImg: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(decodedVenue)}&backgroundColor=555555&textColor=ffffff`,
        venue: decodedVenue,
        lastMsg: '',
        time: 'Just now',
        unread: false,
        preRequest: true,
        thread: [],
      };
      MY_MESSAGES.unshift(thread);
      renderMessages();
    }
    navigate(null, 'messages');
    setTimeout(() => openThread(thread.id), 80);
  }

  // Handle deep-link from venue profile: ?section=calendar&venue=l1[&year=2026&month=04]
  const params = new URLSearchParams(window.location.search);
  const pSection = params.get('section');
  const pVenue   = params.get('venue');
  const pYear    = params.get('year');
  const pMonth   = params.get('month'); // 1-based
  if (pSection === 'calendar') {
    const sel = document.getElementById('calVenueSelect');
    if (pVenue && sel && [...sel.options].some(o => o.value === pVenue)) {
      sel.value = pVenue;
    }
    calVenueChange();           // selects venue, scrolls to the right month, re-renders
    // If a specific month was requested (from clicking a date cell), override the auto-scroll
    if (pYear && pMonth) {
      calYear  = parseInt(pYear, 10);
      calMonth = parseInt(pMonth, 10) - 1; // convert to 0-based
      renderCalendar();
    }
    navigate(null, 'calendar'); // switches the visible section
  }

  // Seed the initial history entry so the back button stays inside the dashboard
  history.replaceState({ section: _currentSection }, '', `?section=${_currentSection}`);
});

// ─── USER UI ─────────────────────────────────────────────────────────────────

function populateSidebarUser() {
  const allProfiles = BookerAuth.getProfiles();
  document.getElementById('sidebarUser').innerHTML = `
    <img src="${profile.avatar}" alt="${user.firstName}" class="sidebar-user-avatar"
         onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&backgroundColor=FF2D78&textColor=ffffff'"/>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${profile.artistName || user.firstName + ' ' + user.lastName}</div>
      <div class="sidebar-user-email">${user.email}</div>
      ${allProfiles.length > 1 ? `<button class="sidebar-profile-chip" onclick="navigate(null,'profile')">Switch profile</button>` : ''}
    </div>`;
  document.getElementById('sidebarUser').style.cursor = 'pointer';
  document.getElementById('sidebarUser').onclick = () => navigate(null, 'profile');
}

function populateTopbarAvatar() {
  document.getElementById('topbarAvatar').innerHTML =
    `<img src="${profile.avatar}" alt="${user.firstName}" style="width:100%;height:100%;object-fit:cover"
      onerror="this.style.background='#FF2D78'"/>`;
}

function updateBadges() {
  const today   = new Date(); today.setHours(0,0,0,0);
  const myReqs  = ALL_REQUESTS.filter(r => r.bookerId === user.id);
  const activeReqs = ENABLE_DATE_PASSED
    ? myReqs.filter(r =>
        r.status !== 'cancelled' &&
        new Date(r.date + 'T00:00:00') >= today
      ).length
    : myReqs.filter(r => r.status !== 'cancelled').length;
  const unread  = MY_MESSAGES.filter(m => m.unread).length;
  const saved   = SAVED_VENUES.length;
  document.getElementById('reqBadge').textContent    = activeReqs || '';
  document.getElementById('msgBadge').textContent    = unread     || '';
  document.getElementById('savedBadge').textContent  = saved      || '';
  document.getElementById('topbarBadge').textContent = unread     || '';
  // Badge on Completed tab for pending resolution actions
  const completedBtn = document.getElementById('completedTabBtnBooker');
  if (completedBtn) {
    let pendingCount = 0;
    try { pendingCount = JSON.parse(localStorage.getItem('gnv_pending_resolutions') || '[]').length; } catch(e) {}
    const existing = completedBtn.querySelector('.confirm-tab-badge');
    if (existing) existing.remove();
    if (pendingCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'confirm-tab-badge';
      badge.textContent = pendingCount;
      completedBtn.appendChild(badge);
    }
  }
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

let _currentSection = 'overview';
let _poppingState   = false;

function navigate(e, section) {
  if (e) e.preventDefault();
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  const link = document.querySelector(`.sidebar-link[data-section="${section}"]`);
  if (link) link.classList.add('active');
  // Close calendar request panel when navigating away from the calendar
  if (section !== 'calendar') {
    document.getElementById('calReqPanel')?.classList.add('hidden');
  }
  closeSidebar();
  window.scrollTo(0, 0);
  if (!_poppingState && section !== _currentSection) {
    history.pushState({ section }, '', `?section=${section}`);
  }
  _currentSection = section;
}

window.addEventListener('popstate', e => {
  const sec = e.state?.section || 'overview';
  _poppingState = true;
  navigate(null, sec);
  _poppingState = false;
});

function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebarOverlay').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function renderOverview() {
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const greetName = profile.artistName || user.firstName;
  document.getElementById('overviewGreeting').textContent = `${greet}, ${greetName}!`;
  document.getElementById('overviewDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const myReqs      = ALL_REQUESTS.filter(r => r.bookerId === user.id);
  const todayOv     = new Date(); todayOv.setHours(0,0,0,0);
  const activeMyReqs = myReqs.filter(r => new Date(r.date + 'T00:00:00') >= todayOv);
  const approved    = activeMyReqs.filter(r => r.status === 'approved').length;
  const pending     = activeMyReqs.filter(r => r.status === 'pending').length;
  const unpaidReqs  = activeMyReqs.filter(r => r.status === 'approved' && r.paymentStatus === 'unpaid');

  // Payment action-required alert
  const alertEl = document.getElementById('paymentAlert');
  if (unpaidReqs.length && alertEl) {
    const names = unpaidReqs.map(r => ALL_VENUES.find(v => v.id === r.venueId)?.title || 'a venue').join(', ');
    alertEl.innerHTML = `
      <div class="payment-alert">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>Payment required</strong>
          <span>Your booking at <strong>${names}</strong> has been approved — complete payment within 48 hours to secure your date.</span>
        </div>
        <button class="payment-alert-btn" onclick="goToRequestsTab('approved')">Complete payment →</button>
      </div>`;
    alertEl.style.display = '';
  } else if (alertEl) {
    alertEl.style.display = 'none';
  }

  document.getElementById('statsGrid').innerHTML = [
    { icon:'🎟️', label:'Requests sent',    value:activeMyReqs.length, delta:'upcoming',                                             deltaClass:'delta-neutral', color:'#FF2D78', section:'requests', filter:'all'      },
    { icon:'✅', label:'Approved bookings', value:approved,            delta:approved?'▲ confirmed':'none yet',                      deltaClass:approved?'delta-up':'delta-neutral', color:'#10B981', section:'requests', filter:'approved' },
    { icon:'⏳', label:'Pending requests',  value:pending,             delta:pending?'awaiting reply':'all clear',                   deltaClass:pending?'delta-pending':'delta-neutral', color:'#F59E0B', section:'requests', filter:'pending'  },
    { icon:'❤️', label:'Saved venues',      value:SAVED_VENUES.length, delta:'bookmarked',                                           deltaClass:'delta-neutral', color:'#3B82F6', section:'saved',    filter:null       },
  ].map(s => `
    <div class="stat-card stat-card-link" onclick="${s.filter ? `goToRequestsTab('${s.filter}')` : `navigate(null,'${s.section}')`}">
      <div class="stat-card-accent" style="background:${s.color}"></div>
      <div class="stat-card-icon" style="background:${s.color}22">${s.icon}</div>
      <div class="stat-card-value">${s.value}</div>
      <div class="stat-card-label">${s.label}</div>
      <span class="stat-card-delta ${s.deltaClass}">${s.delta}</span>
    </div>`).join('');

  // Recent requests preview
  document.getElementById('overviewRequests').innerHTML = myReqs.slice(0,3).map(r => {
    const v = ALL_VENUES.find(v => v.id === r.venueId);
    return `
      <div class="action-item" onclick="navigate(null,'requests')">
        <div class="action-icon ${r.status==='approved'?'green':r.status==='declined'?'red':'orange'}">
          ${r.status==='approved'?'✅':r.status==='declined'?'❌':'⏳'}
        </div>
        <div class="action-body">
          <strong>${v?.title || 'Venue'}</strong>
          <span>${new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}${v?.location ? ' · ' + v.location : ''} · ${r.eventType}</span>
        </div>
        <span class="req-badge req-${r.status}">${capitalize(r.status)}</span>
      </div>`;
  }).join('') || '<p style="color:var(--text-muted);font-size:14px;padding:20px 0">No requests yet. <a href="index.html" style="color:var(--red)">Browse venues →</a></p>';

  // Messages preview
  document.getElementById('overviewMessages').innerHTML = MY_MESSAGES.slice(0,3).map(m => `
    <div class="msg-thread${m.unread?' msg-thread-unread':''}" onclick="navigate(null,'messages');setTimeout(()=>openThread('${m.id}'),50)"
         style="border-radius:8px;border:none;padding:12px 4px">
      <img src="${m.fromImg}" alt="" class="msg-thread-avatar" onerror="this.style.background='#1C1C1C'"/>
      <div class="msg-thread-body">
        <div class="msg-thread-top">
          <span class="msg-thread-name">${m.venue}</span>
          <span class="msg-thread-time">${m.time}</span>
        </div>
        <div class="msg-thread-preview">${m.lastMsg}</div>
      </div>
      ${m.unread?'<span class="msg-unread-dot"></span>':''}
    </div>`).join('');

  // Featured nights action card
  let featuredNights = [];
  try { featuredNights = JSON.parse(localStorage.getItem('bb_featured_nights') || '[]'); } catch(e) {}
  const now14 = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const savedIds = SAVED_VENUES.map(v => v.id);
  const activeFn = featuredNights.filter(fn => fn.postedAt > now14 && savedIds.includes(fn.venueId));
  const fnEl = document.getElementById('overviewFeaturedNights');
  if (fnEl) {
    if (activeFn.length) {
      const fnNames = [...new Set(activeFn.map(fn => ALL_VENUES.find(v => v.id === fn.venueId)?.title).filter(Boolean))].join(', ');
      fnEl.innerHTML = `
        <div class="action-item" onclick="window.location.href='index.html'" style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px 16px;cursor:pointer">
          <div class="action-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;font-size:18px">★</div>
          <div class="action-body"><strong>${activeFn.length === 1 ? 'Featured Night' : activeFn.length + ' Featured Nights'} from a saved venue${activeFn.length>1?'s':''}</strong><span>${fnNames} — special rate available, browse and request now</span></div>
          <span class="action-chevron">›</span>
        </div>`;
      fnEl.style.display = '';
    } else {
      fnEl.style.display = 'none';
    }
  }

  // Rating prompts
  const ratingPrompts = checkCompletedRatingPrompts();
  const rpEl = document.getElementById('overviewRatingPrompts');
  if (rpEl) {
    rpEl.innerHTML = ratingPrompts.map(r => {
      const v = ALL_VENUES.find(vv => vv.id === r.venueId);
      return `
        <div class="action-item" onclick="openArtistRatingModal('${r.id}')" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:14px 16px;cursor:pointer;margin-bottom:8px">
          <div class="action-icon" style="background:rgba(16,185,129,0.15);color:#34d399;font-size:18px">★</div>
          <div class="action-body"><strong>Rate your experience at ${v?.title || 'the venue'}</strong><span>How was your show? Share a quick rating to help other artists.</span></div>
          <span class="action-chevron">›</span>
        </div>`;
    }).join('');
    rpEl.style.display = ratingPrompts.length ? '' : 'none';
  }
}

// ─── REQUESTS ─────────────────────────────────────────────────────────────────

function goToCalendarDate(venueId, iso) {
  const d = new Date(iso + 'T00:00:00');
  calSelectedVenueId = venueId;
  calSelectedDate    = iso;
  calYear  = d.getFullYear();
  calMonth = d.getMonth();
  navigate(null, 'calendar');
  setTimeout(() => {
    const sel = document.getElementById('calVenueSelect');
    if (sel && [...sel.options].some(o => o.value === venueId)) sel.value = venueId;
    renderCalendar();
  }, 50);
}

function goToRequestsTab(filter) {
  navigate(null, 'requests');
  requestFilter = filter;
  document.querySelectorAll('#section-requests .filter-tab').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('onclick').includes(`'${filter}'`)) t.classList.add('active');
  });
  renderRequests(filter);
}

function filterRequests(e, status) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  requestFilter = status;
  renderRequests(status);
}

// Returns true only for pending requests whose date has passed — the only case
// where "date passed" is the reason for cancellation rather than a separate resolution.
function datePassed(r) {
  if (r.status !== 'pending') return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(r.date + 'T00:00:00') < today;
}

function renderRequests(filter) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let reqs = ALL_REQUESTS.filter(r => r.bookerId === user.id);

  // Completed actions area — show pending resolution cards only on completed tab
  const completedArea = document.getElementById('completedActionsArea');
  if (completedArea) {
    if (filter === 'completed') {
      completedArea.style.display = '';
      renderPendingActions('completedActionsArea');
      // Mark resolution notifications as read for any pending resolutions
      _supabaseResolutions.forEach(r => { if (r.booking_id) _markNotificationsRead(r.booking_id); });
    } else {
      completedArea.style.display = 'none';
      completedArea.innerHTML = '';
    }
  }

  if (filter === 'pending') {
    reqs = reqs.filter(r => r.status === 'pending' && !datePassed(r));
  } else if (filter === 'approved') {
    // Upcoming approved shows only (date >= today)
    reqs = reqs.filter(r => r.status === 'approved' && new Date(r.date + 'T00:00:00') >= today);
  } else if (filter === 'completed') {
    // Past-date approved shows (show has happened or should have)
    reqs = reqs.filter(r => r.status === 'approved' && new Date(r.date + 'T00:00:00') < today);
  } else if (filter === 'cancelled') {
    // Cancelled + declined + date-passed pending
    reqs = reqs.filter(r => r.status === 'cancelled' || r.status === 'declined' || datePassed(r));
  }

  const canArchive = filter === 'cancelled';
  const active   = canArchive ? reqs.filter(r => !r.archived) : reqs;
  const archived = canArchive ? reqs.filter(r =>  r.archived) : [];

  const tbody = document.getElementById('requestsTableBody');
  if (!active.length && !archived.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:48px;color:var(--text-muted)">
      No ${filter === 'all' ? '' : filter} requests. <a href="index.html" style="color:var(--red)">Browse venues →</a></td></tr>`;
    return;
  }

  const makeRow = (r, isArchived = false) => {
    const v          = ALL_VENUES.find(vv => vv.id === r.venueId);
    const passed     = ENABLE_DATE_PASSED && datePassed(r);
    const isBooked   = r.status === 'approved' && r.paymentStatus === 'paid';
    const isCompleted = filter === 'completed';
    const dispStatus = passed ? 'date_passed' : r.status;
    return `<tr${isArchived ? ' class="archived-entry"' : ''}>
      <td>
        <a href="index.html?venue=${v?.id || ''}" class="req-venue-cell req-venue-link">
          <img src="${v?.img || ''}" alt="" onerror="this.style.background='#1C1C1C'"/>
          <div>
            <div style="font-weight:600;color:var(--text)">${v?.title || '—'}</div>
            <div style="font-size:12px;color:var(--text-muted)">${v?.location || ''}</div>
          </div>
        </a>
      </td>
      <td><span style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted;color:inherit" onclick="goToCalendarDate('${r.venueId}','${r.date}')" title="View on calendar">${fmtDate(r.date)}</span></td>
      <td>${r.eventType}</td>
      <td>${v?.capacity ? v.capacity.toLocaleString() : '—'}</td>
      <td>${r.attendance ? Number(r.attendance).toLocaleString() : '—'}</td>
      <td style="font-weight:600;color:var(--text)">${v?.price ? '$' + v.price.toLocaleString() : '—'}</td>
      <td>
        ${isCompleted
          ? isBooked
            ? `<span class="req-badge req-approved" style="background:rgba(16,185,129,0.12);color:#34d399;border-color:rgba(16,185,129,0.3)">Booked</span>
               <div style="font-size:11px;color:var(--text-muted);margin-top:3px">Show date passed</div>`
            : `<span class="req-badge req-approved">Approved</span>
               <div style="font-size:11px;color:#EF4444;margin-top:3px">Never paid · Show date passed</div>`
          : passed
          ? `<span class="req-badge req-date_passed">Date passed</span>`
          : isBooked
          ? `<span class="req-badge req-approved" style="background:rgba(16,185,129,0.12);color:#34d399;border-color:rgba(16,185,129,0.3)">Booked</span>`
          : `<span class="req-badge req-${dispStatus}">${capitalize(r.status)}</span>`}
        ${!isCompleted && !passed && r.status === 'approved' && r.paymentStatus === 'unpaid' ? (() => {
          const remaining = r.paymentDeadline ? r.paymentDeadline - Date.now() : null;
          let countdownHtml = '';
          if (remaining !== null) {
            if (remaining <= 0) {
              countdownHtml = '<div style="font-size:11px;color:#EF4444;margin-top:3px">⚠ Window expired — booking may be cancelled</div>';
            } else {
              const hrs  = Math.floor(remaining / 3600000);
              const mins = Math.floor((remaining % 3600000) / 60000);
              const urgentColor = remaining < 3600000 ? '#EF4444' : '#F59E0B';
              countdownHtml = `<div style="font-size:11px;color:${urgentColor};margin-top:3px">⏱ ${hrs}h ${mins}m to complete payment</div>`;
            }
          }
          return `<span class="req-badge req-payment-due">Payment due</span>${countdownHtml}`;
        })() : ''}
        ${r.status === 'cancelled' && r.cancelReason === 'Another booking confirmed for this date'
          ? `<span class="req-badge req-date-conflict" title="You confirmed a booking at another venue for this date">Date conflict</span>`
          : r.status === 'cancelled' && r.cancelledBy
          ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">by ${r.cancelledBy}</div>`
          : ''}
        ${v && !passed && !isCompleted && r.status !== 'cancelled' ? (() => { const dep=Math.round(v.price*0.20); const fee=Math.round(v.price*0.05); return `<div style="font-size:11px;color:var(--text-muted);margin-top:5px">Deposit $${dep.toLocaleString()} · Fee $${fee.toLocaleString()} · <strong style="color:var(--text)">Total $${(dep+fee).toLocaleString()}</strong></div>`; })() : ''}
      </td>
      <td style="font-size:12px;color:var(--text-muted)">${r.sent ? fmtDate(r.sent) : '—'}</td>
      <td>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
          ${!passed && r.status === 'pending'
            ? `<button class="res-action-btn" onclick="cancelRequest('${r.id}')">Cancel</button>`
            : !passed && r.status === 'approved' && r.paymentStatus === 'unpaid'
            ? `<button class="res-action-btn res-action-btn-pay" onclick="openPaymentModal('${r.id}')">Complete payment</button>
               <button class="res-action-btn-decline" onclick="openDeclineModal('${r.id}')">Decline this booking</button>`
            : !passed && isBooked && !isCompleted
            ? `<button class="res-action-btn" onclick="openBookerAgreement('${r.id}')" style="color:#34d399">📄 Agreement</button>
               <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Coordinate directly with the venue</div>`
            : isCompleted && isBooked
            ? `<button class="res-action-btn" onclick="openBookerAgreement('${r.id}')" style="color:#34d399">📄 Agreement</button>`
            : isCompleted
            ? `<a class="res-action-btn req-rebook-btn" href="index.html?venue=${r.venueId}">Rebook →</a>`
            : r.status === 'declined' && !isArchived
            ? `<button class="res-action-btn req-archive-btn" onclick="archiveRequest('${r.id}')">Archive</button>
               <button class="res-action-btn req-waitlist-btn${isOnWaitlist(r.id) ? ' wl-active' : ''}" onclick="toggleWaitlist('${r.id}','${r.venueId}','${r.date}')">${isOnWaitlist(r.id) ? '✓ On waitlist' : 'Join waitlist'}</button>`
            : r.status === 'cancelled' && !isArchived
            ? `<button class="res-action-btn req-archive-btn" onclick="archiveRequest('${r.id}')">Archive</button>
               <a class="res-action-btn req-rebook-btn" href="index.html?venue=${r.venueId}">Rebook a date →</a>`
            : isArchived
            ? `<button class="res-action-btn req-archive-btn" onclick="unarchiveRequest('${r.id}')">Unarchive</button>`
            : `<button class="res-action-btn" onclick="showDash('${v?.title || 'Venue'} · ${r.date}')">View</button>`}
        </div>
      </td>
    </tr>`;
  };

  let html = active.map(r => makeRow(r, false)).join('');
  if (archived.length) {
    html += `
      <tr class="archived-toggle-row">
        <td colspan="9">
          <button class="archived-toggle-btn" id="archivedToggleBtn" onclick="toggleArchivedRows()">
            ▸ Archived (${archived.length})
          </button>
        </td>
      </tr>
      ${archived.map(r => makeRow(r, true)).join('')}`;
  }
  tbody.innerHTML = html;
  document.querySelectorAll('.archived-entry').forEach(r => r.style.display = 'none');
}

function archiveRequest(id) {
  const r = ALL_REQUESTS.find(x => x.id === id);
  if (r) { r.archived = true;  renderRequests(requestFilter); }
}
function unarchiveRequest(id) {
  const r = ALL_REQUESTS.find(x => x.id === id);
  if (r) { r.archived = false; renderRequests(requestFilter); }
}
function toggleArchivedRows() {
  const rows = document.querySelectorAll('.archived-entry');
  const btn  = document.getElementById('archivedToggleBtn');
  const showing = rows[0]?.style.display !== 'none';
  rows.forEach(r => r.style.display = showing ? 'none' : '');
  if (btn) btn.textContent = (showing ? '▸' : '▾') + ` Archived (${rows.length})`;
}

// ─── PAYMENT MODAL ────────────────────────────────────────────────────────────

let _pmCountdownTimer = null;
let _pmCurrentReqId   = null;

async function initiateStripeCheckout() {
  const r = ALL_REQUESTS.find(x => x.id === _pmCurrentReqId);
  if (!r) return;
  const btn = document.getElementById('pmStripeBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Redirecting to Stripe…'; }
  try {
    const { data: { session: authSession } } = await gnvClient.auth.getSession();
    const resp = await fetch(
      `${gnvClient.supabaseUrl}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession?.access_token}`,
          'apikey': gnvClient.supabaseKey,
        },
        body: JSON.stringify({ bookingId: r.id }),
      }
    );
    const json = await resp.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      throw new Error(json.error || 'No redirect URL returned');
    }
  } catch (err) {
    console.error('Stripe checkout error:', err);
    showDash('Could not start payment. Please try again.');
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg viewBox="0 0 60 25" width="38" height="16" fill="currentColor"><path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.26 10.26 0 0 1-4.56.95c-4.01 0-6.83-2.53-6.83-7.07 0-4.01 2.48-7.06 6.31-7.06 3.92 0 5.96 2.91 5.96 6.62 0 .6-.04 1.17-.07 1.64zm-5.92-5.77c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V6.43h3.64l.15 1.01c.56-.7 1.62-1.22 3-1.22 2.86 0 5.51 2.53 5.51 7.04 0 4.43-2.55 7.04-5.26 7.04zm-.87-10.57c-.84 0-1.48.31-1.93.79l.02 5.51c.42.46 1.05.79 1.91.79 1.51 0 2.54-1.56 2.54-3.54 0-2.02-1.05-3.55-2.54-3.55zM28.24 5.07c1.36 0 2.18-1.01 2.18-2.27C30.42.99 29.6 0 28.24 0c-1.36 0-2.21 1-2.21 2.8 0 1.26.85 2.27 2.21 2.27zm2.07 15.22h-4.14V6.43h4.14v13.86zM22.22 7.43l-.26-1h-3.56v13.85h4.12v-9.6c.97-1.27 2.62-1.04 3.13-.87V6.43c-.52-.19-2.4-.52-3.43 1zm-8.94-.61c-1.44 0-2.6.52-3.34 1.5l-.16-1.89H6.27C6.33 7.5 6.4 9.3 6.4 11.07v9.21h4.14v-8.96c0-.35.03-.68.12-.93.26-.72.87-1.45 1.87-1.45 1.32 0 1.87.9 1.87 2.22v9.12h4.12v-9.55c0-3.72-1.93-5.91-5.24-5.91z"/></svg> Pay with Stripe'; }
  }
}

function completePaymentDemo() {
  const r = ALL_REQUESTS.find(x => x.id === _pmCurrentReqId);
  if (!r) return;
  const v = ALL_VENUES.find(vv => vv.id === r.venueId);
  r.paymentStatus = 'paid';
  // Track reliability: this approval was paid
  incrementMyReliability(true);
  // Auto-cancel other pending requests for the same date (artist is now locked in)
  ALL_REQUESTS.filter(x =>
    x.id !== r.id && x.bookerId === user.id && x.date === r.date && x.status === 'pending'
  ).forEach(c => {
    c.status      = 'cancelled';
    c.cancelledBy = 'system';
    c.cancelReason = 'Another booking confirmed for this date';
  });
  closePaymentModal();
  renderRequests(requestFilter);
  renderOverview();
  updateBadges();
  showDash(`Payment confirmed! Your booking at ${v?.title || 'the venue'} is locked in. 🎉`);
}

function openPaymentModal(id) {
  const r = ALL_REQUESTS.find(x => x.id === id);
  const v = r ? ALL_VENUES.find(x => x.id === r.venueId) : null;
  if (!r || !v) return;
  _pmCurrentReqId = id;

  const deposit    = Math.round(v.price * 0.20);
  const bookingFee = Math.round(v.price * 0.05);
  const total      = deposit + bookingFee;

  document.getElementById('pmVenueImg').src    = v.img;
  document.getElementById('pmVenueName').textContent = v.title;
  document.getElementById('pmVenueMeta').textContent =
    `${r.eventType}  ·  ${new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`;
  document.getElementById('pmDepositAmt').textContent  = '$' + deposit.toLocaleString();
  document.getElementById('pmFeeAmt').textContent      = '$' + bookingFee.toLocaleString();
  document.getElementById('pmTotalAmt').textContent    = '$' + total.toLocaleString();

  // Countdown
  clearInterval(_pmCountdownTimer);
  function updateCountdown() {
    const ms   = (r.paymentDeadline || 0) - Date.now();
    if (ms <= 0) { document.getElementById('pmCountdown').textContent = 'Expired'; return; }
    const h    = Math.floor(ms / 3600000);
    const m    = Math.floor((ms % 3600000) / 60000);
    const s    = Math.floor((ms % 60000) / 1000);
    document.getElementById('pmCountdown').textContent =
      `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  updateCountdown();
  _pmCountdownTimer = setInterval(updateCountdown, 1000);

  // Same-date conflict notice
  const conflicts = ALL_REQUESTS.filter(x => x.id !== id && x.date === r.date && x.status === 'pending');
  const notice = document.getElementById('pmConflictNotice');
  if (conflicts.length) {
    const names = conflicts.map(x => ALL_VENUES.find(vv => vv.id === x.venueId)?.title || 'another venue').join(', ');
    document.getElementById('pmConflictVenues').textContent = names;
    notice.classList.remove('hidden');
  } else {
    notice.classList.add('hidden');
  }

  // Show Stripe button for real bookings, demo button for demo/legacy
  const isSupabase = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const stripeBtn = document.getElementById('pmStripeBtn');
  const demoBtn   = document.getElementById('pmDemoBtn');
  if (stripeBtn) { stripeBtn.style.display = isSupabase ? '' : 'none'; stripeBtn.disabled = false; }
  if (demoBtn)   { demoBtn.style.display   = isSupabase ? 'none' : ''; }

  document.getElementById('pmOverlay').classList.add('open');
  document.getElementById('pmModal').classList.add('open');
}

function closePaymentModal() {
  clearInterval(_pmCountdownTimer);
  document.getElementById('pmOverlay').classList.remove('open');
  document.getElementById('pmModal').classList.remove('open');
}

function cancelRequest(id) {
  const r = ALL_REQUESTS.find(x => x.id === id);
  if (!r) return;
  const cancellerName = profile.artistName || `${user.firstName} ${user.lastName}`.trim();
  r.status      = 'cancelled';
  r.cancelledBy = cancellerName;
  r.cancelledAt = Date.now();

  // Queue a notification for the host to pick up when they load their dashboard
  const venue = ALL_VENUES.find(v => v.id === r.venueId);
  const notifDate = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
  try {
    const pending = JSON.parse(localStorage.getItem('bb_host_notifications') || '[]');
    pending.push({
      id:         'notif_' + Date.now(),
      artistName: cancellerName,
      venueName:  venue?.title || 'Unknown venue',
      dates:      notifDate,
      eventType:  r.eventType,
      ts:         Date.now(),
    });
    localStorage.setItem('bb_host_notifications', JSON.stringify(pending));
  } catch(e) {}

  renderRequests(requestFilter);
  updateBadges();
  showDash('Request cancelled. The venue host has been notified.');
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

function renderMessages() {
  document.getElementById('msgThreadList').innerHTML = MY_MESSAGES.map(m => `
    <div class="msg-thread${m.unread?' msg-thread-unread':''}" id="thread-${m.id}" onclick="openThread('${m.id}')">
      <img src="${m.fromImg}" alt="${m.venue}" class="msg-thread-avatar" onerror="this.style.background='#1C1C1C'"/>
      <div class="msg-thread-body">
        <div class="msg-thread-top">
          <div class="msg-thread-name-wrap">
            <span class="msg-thread-name">${m.venue}</span>
            ${m.preRequest ? '<span class="msg-prerequest-badge">Pre-request</span>' : ''}
          </div>
          <span class="msg-thread-time">${m.time}</span>
        </div>
        <div class="msg-thread-preview">${m.lastMsg || 'Start the conversation'}</div>
      </div>
      ${m.unread ? '<span class="msg-unread-dot"></span>' : ''}
    </div>`).join('');
}

function openThread(id) {
  const m = MY_MESSAGES.find(x => x.id === id);
  if (!m) return;
  activeThread = m;
  m.unread = false;
  document.querySelectorAll('.msg-thread').forEach(t => t.classList.remove('active'));
  const threadEl = document.getElementById(`thread-${id}`);
  threadEl.classList.add('active');
  threadEl.querySelector('.msg-unread-dot')?.remove();
  threadEl.classList.remove('msg-thread-unread');

  const _venueProfileLink = `href="${m.venueId ? `index.html?venue=${m.venueId}` : 'index.html'}" title="Browse ${m.venue} on GigNVenue"`;
  document.getElementById('msgChat').innerHTML = `
    <div class="msg-chat-header">
      <a ${_venueProfileLink} style="display:inline-block;flex-shrink:0">
        <img src="${m.fromImg}" alt="" class="msg-thread-avatar" style="width:40px;height:40px" onerror="this.style.background='#1C1C1C'"/>
      </a>
      <div class="msg-chat-header-info">
        <div class="msg-chat-header-top">
          <a ${_venueProfileLink} style="color:inherit;text-decoration:none;font-weight:700">${m.venue}</a>
          ${m.preRequest ? '<span class="msg-prerequest-badge">Pre-request</span>' : ''}
        </div>
        <div class="msg-chat-header-sub"><span>Venue</span></div>
      </div>
    </div>
    <div class="msg-chat-messages" id="chatMessages">
      ${m.thread.map(msg => `
        <div><div class="msg-bubble ${msg.mine?'mine':'theirs'}">${msg.text}<div class="msg-bubble-time">${msg.time}</div></div></div>`).join('')}
    </div>
    <div class="msg-chat-input">
      <input type="file" id="msgFileInput" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="attachMsgFile(this)"/>
      <button class="msg-attach-btn" onclick="document.getElementById('msgFileInput').click()" title="Attach file">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <textarea id="msgInput" placeholder="Message ${m.venue}…" rows="1" onkeydown="sendOnEnter(event)"></textarea>
      <button class="msg-send-btn" onclick="sendMessage()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>`;

  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
  updateBadges();

  // For Supabase booking threads: fetch history + subscribe Realtime
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    _loadSupabaseThread(id);
  }
}

async function _loadSupabaseThread(bookingId) {
  if (_realtimeChannel) { gnvClient.removeChannel(_realtimeChannel); _realtimeChannel = null; }

  const { data: rows } = await gnvClient
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  const chatEl = document.getElementById('chatMessages');
  if (!chatEl) return;
  chatEl.innerHTML = (rows || []).map(row => {
    const mine = row.sender_id === user.id;
    const t = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `<div><div class="msg-bubble ${mine?'mine':'theirs'}">${row.body}<div class="msg-bubble-time">${t}</div></div></div>`;
  }).join('');
  chatEl.scrollTop = chatEl.scrollHeight;

  if (activeThread?.id === bookingId) {
    activeThread.thread = (rows || []).map(row => ({
      mine: row.sender_id === user.id,
      text: row.body,
      time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  }

  _realtimeChannel = gnvClient
    .channel(`artist-messages:${bookingId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` }, payload => {
      const row = payload.new;
      if (activeThread?.id !== bookingId || row.sender_id === user.id) return;
      const el = document.getElementById('chatMessages');
      if (!el) return;
      const t = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const b = document.createElement('div');
      b.innerHTML = `<div class="msg-bubble theirs">${row.body}<div class="msg-bubble-time">${t}</div></div>`;
      el.appendChild(b);
      el.scrollTop = el.scrollHeight;
    })
    .subscribe();
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  if (!input?.value.trim() || !activeThread) return;
  const text = input.value.trim();
  input.value = '';
  const msgs = document.getElementById('chatMessages');
  const b = document.createElement('div');
  b.innerHTML = `<div class="msg-bubble mine">${text}<div class="msg-bubble-time">Just now</div></div>`;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeThread.id)) {
    // Supabase thread — persist message; Realtime delivers it to the other party
    activeThread.thread.push({ mine: true, text, time: 'Just now' });
    activeThread.lastMsg = text;
    gnvClient.from('messages').insert({
      booking_id:  activeThread.id,
      sender_type: 'artist',
      sender_id:   user.id,
      body:        text,
      event:       'message',
    }).then(({ error }) => { if (error) console.warn('Message send failed:', error.message); });
  } else if (ENABLE_AUTO_REPLY) {
    // Demo thread — in-memory + simulated reply
    activeThread.thread.push({ mine: true, text, time: 'Just now' });
    activeThread.lastMsg = text;
    setTimeout(() => {
      const replies = ["Thanks for the message! I'll get back to you shortly.", "Got it, will confirm soon!", "Thanks! Let me check and reply."];
      const reply = replies[Math.floor(Math.random()*replies.length)];
      activeThread.thread.push({ mine: false, text: reply, time: 'Just now' });
      const rb = document.createElement('div');
      rb.innerHTML = `<div class="msg-bubble theirs">${reply}<div class="msg-bubble-time">Just now</div></div>`;
      msgs.appendChild(rb);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1500);
  } else {
    activeThread.thread.push({ mine: true, text, time: 'Just now' });
    activeThread.lastMsg = text;
  }
}

function sendOnEnter(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

function attachMsgFile(input) {
  const file = input.files[0];
  if (!file || !activeThread) { input.value = ''; return; }
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const icon = file.type.startsWith('image/') ? '🖼️' : '📎';
  const text = `${icon} ${file.name}`;
  activeThread.thread.push({ mine: true, text, time: 'Just now' });
  activeThread.lastMsg = text;
  const b = document.createElement('div');
  b.innerHTML = `<div class="msg-bubble mine">${text}<div class="msg-bubble-time">Just now</div></div>`;
  msgs.appendChild(b);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

function cityState(location) {
  if (!location) return '';
  const parts = location.split(',').map(s => s.trim());
  if (parts.length < 2) return location;
  const city  = parts[parts.length - 2];
  const state = parts[parts.length - 1].split(' ')[0];
  return `${city}, ${state}`;
}

function populateVenueSelect() {
  const sel = document.getElementById('calVenueSelect');

  // Collect venue IDs the artist has ever requested
  const requestedIds = new Set(
    ALL_REQUESTS.filter(r => r.bookerId === user.id).map(r => r.venueId)
  );
  // Collect saved venue IDs
  const savedIds = new Set(SAVED_VENUES.map(v => String(v.id)));

  // Show union: requested + saved, in ALL_VENUES order
  const calVenues = ALL_VENUES.filter(v => requestedIds.has(v.id) || savedIds.has(String(v.id)));

  // Fall back to all venues if the artist has no history yet
  const venueList = calVenues.length ? calVenues : ALL_VENUES;

  venueList.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.title} — ${cityState(v.location)} · ${v.capacity ? v.capacity.toLocaleString() + ' cap' : ''}`;
    sel.appendChild(opt);
  });

  // Keep previously selected venue if it's still in the list, else default to first
  if ([...sel.options].some(o => o.value === calSelectedVenueId)) {
    sel.value = calSelectedVenueId;
  } else if (sel.options.length > 1) {
    calSelectedVenueId = sel.options[1].value;
    sel.value = calSelectedVenueId;
  }
}

function calVenueChange() {
  calSelectedVenueId = document.getElementById('calVenueSelect').value;

  // Jump to the month containing the artist's earliest upcoming request for this venue,
  // falling back to the most recent past request, then today if no requests exist.
  const myReqs = ALL_REQUESTS.filter(r => r.bookerId === user.id && r.venueId === calSelectedVenueId);
  if (myReqs.length) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allDates = myReqs.map(r => new Date(r.date + 'T00:00:00')).sort((a, b) => a - b);
    const upcoming = allDates.filter(d => d >= today);
    const target   = upcoming.length ? upcoming[0] : allDates[allDates.length - 1];
    calYear  = target.getFullYear();
    calMonth = target.getMonth();
  }

  renderCalendar();
  renderVenueSummary();
}

function renderVenueSummary() {
  const el = document.getElementById('calVenueSummary');
  if (!el) return;
  const myReqs = ALL_REQUESTS.filter(r => r.bookerId === user.id && r.venueId === calSelectedVenueId);
  if (!myReqs.length) { el.innerHTML = ''; return; }

  const counts = { pending:0, approved:0, declined:0, cancelled:0 };
  myReqs.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  const pills = [
    { key:'pending',   label:'Pending',   cls:'req-pending'   },
    { key:'approved',  label:'Approved',  cls:'req-approved'  },
    { key:'declined',  label:'Declined',  cls:'req-declined'  },
    { key:'cancelled', label:'Cancelled', cls:'req-cancelled' },
  ]
  .filter(p => counts[p.key] > 0)
  .map(p => `<span class="req-badge ${p.cls}" style="cursor:pointer" onclick="goToRequestsTab('${p.key}')">${counts[p.key]} ${p.label}</span>`)
  .join('');

  el.innerHTML = `
    <div class="cal-venue-summary">
      <span class="cal-venue-summary-label">${myReqs.length} request${myReqs.length > 1 ? 's' : ''} at this venue</span>
      <div class="cal-venue-summary-pills">${pills}</div>
    </div>`;
}

// Reads the host-published public calendar status for a venue date.
// Returns 'booked' | 'pending' | null — no private host info is exposed.
function getHostCalStatus(venueId, iso) {
  try {
    const cal = JSON.parse(localStorage.getItem(`bb_pub_cal_${venueId}`) || 'null');
    return cal ? (cal[iso] || null) : null;
  } catch(e) { return null; }
}

function getRequestsForDate(venueId, iso) {
  return ALL_REQUESTS.filter(r => r.venueId === venueId && r.date === iso && r.status !== 'cancelled');
}

function isMyRequest(venueId, iso) {
  return ALL_REQUESTS.some(r => r.bookerId === user.id && r.venueId === venueId && r.date === iso && r.status !== 'cancelled');
}

function isBooked(venueId, iso) {
  return getHostCalStatus(venueId, iso) === 'booked';
}

function renderCalendar() {
  calSelectedVenueId = document.getElementById('calVenueSelect').value;
  const label = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', {month:'long', year:'numeric'});
  document.getElementById('calMonthLabel').textContent = label;

  const firstDay   = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth= new Date(calYear, calMonth+1, 0).getDate();
  const prevDays   = new Date(calYear, calMonth, 0).getDate();
  const today      = new Date();

  let html = `<div class="big-cal-header">`;
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    html += `<div class="big-cal-dayname">${d}</div>`;
  });
  html += `</div><div class="big-cal-grid">`;

  // Prev month
  for (let i = firstDay-1; i >= 0; i--) {
    html += `<div class="big-cal-cell other-month"><div class="big-cal-num" style="opacity:.25">${prevDays-i}</div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday    = today.getDate()===d && today.getMonth()===calMonth && today.getFullYear()===calYear;
    const hostStatus = getHostCalStatus(calSelectedVenueId, iso);
    const booked     = hostStatus === 'booked';
    const hostPending= hostStatus === 'pending';
    const myReqObj   = ALL_REQUESTS.find(r => r.bookerId === user.id && r.venueId === calSelectedVenueId && r.date === iso);
    const myReq      = !!myReqObj && myReqObj.status !== 'cancelled';
    const allReqs    = getRequestsForDate(calSelectedVenueId, iso);
    const reqCount   = allReqs.length;
    const otherReqs  = allReqs.filter(r => r.bookerId !== user.id).length;

    // Status colour map for artist's own request pill
    const statusStyle = {
      pending:  'rgba(245,158,11,0.25);color:#fbbf24',
      approved: 'rgba(16,185,129,0.25);color:#34d399',
      declined: 'rgba(239,68,68,0.25);color:#f87171',
    };

    const cellDate  = new Date(calYear, calMonth, d);
    const isPast    = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Background tint by demand
    let bg = '';
    let demandHtml = '';
    if (booked) {
      bg = '';
      demandHtml = `<span class="req-count-badge" style="background:rgba(255,45,120,0.3);color:#FF85C0">Unavailable</span>`;
    } else if (myReq) {
      // Artist has a request on this date — show their status + other count if any
      const st = myReqObj.status;
      let pillText, pillStyle;
      if (isPast) {
        pillText  = st === 'pending' ? 'Pending · Date passed' : `${capitalize(st)} · Date passed`;
        pillStyle = st === 'pending'  ? 'rgba(71,85,105,0.2);color:#94a3b8'
                  : st === 'approved' ? 'rgba(16,185,129,0.2);color:#34d399'
                  :                     'rgba(239,68,68,0.2);color:#f87171';
      } else {
        pillText  = `Your req · ${capitalize(st)}`;
        pillStyle = statusStyle[st] || 'rgba(255,255,255,0.1);color:#fff';
      }
      const myPill = `<span class="req-count-badge" style="background:${pillStyle}">${pillText}</span>`;
      const otherPill = !isPast && otherReqs > 0
        ? `<span class="req-count-badge" style="background:rgba(245,158,11,0.2);color:#fbbf24;margin-top:2px">+${otherReqs} other${otherReqs>1?'s':''}</span>`
        : '';
      bg = isPast ? '' :
           st === 'approved' ? 'background:rgba(16,185,129,0.06)' :
           st === 'declined' ? 'background:rgba(239,68,68,0.06)' :
           'background:rgba(245,158,11,0.06)';
      demandHtml = myPill + otherPill;
    } else if (hostPending) {
      bg = 'background:rgba(245,158,11,0.06)';
      demandHtml = `<span class="req-count-badge" style="background:rgba(245,158,11,0.2);color:#fbbf24">Pending</span>`;
    } else if (reqCount > 0) {
      bg = reqCount >= 3 ? 'background:rgba(239,68,68,0.08)' : 'background:rgba(245,158,11,0.06)';
      const color = reqCount >= 3 ? 'rgba(239,68,68,0.25);color:#f87171' : 'rgba(245,158,11,0.2);color:#fbbf24';
      demandHtml = `<span class="req-count-badge" style="background:${color}">${reqCount} request${reqCount>1?'s':''}</span>`;
    }

    const myOutline = myReq ? 'outline:2px solid rgba(255,45,120,0.6);outline-offset:-2px;border-radius:2px' : '';
    const clickable = !booked && !isPast ? `onclick="calDayClick('${iso}')"` : '';
    const cursor    = (booked || isPast) ? 'cursor:not-allowed' : 'cursor:pointer';
    const pastOpacity = isPast ? 'opacity:0.35;' : '';

    html += `
      <div class="big-cal-cell${isToday?' today':''}${booked?' cal-cell-booked':''}${isPast?' cal-cell-past':''}" style="${bg};${myOutline};${cursor};${pastOpacity}" ${clickable}>
        <div class="big-cal-num"><span class="big-cal-day-digit">${d}</span>${isToday ? '<span class="big-cal-today-label">Today</span>' : ''}</div>
        ${demandHtml}
      </div>`;
  }

  // Padding
  const total = firstDay + daysInMonth;
  const rem   = total%7===0 ? 0 : 7-(total%7);
  for (let d = 1; d <= rem; d++) {
    html += `<div class="big-cal-cell other-month"><div class="big-cal-num" style="opacity:.25">${d}</div></div>`;
  }
  html += `</div>`;
  document.getElementById('bigCalendar').innerHTML = html;
}

function calDayClick(iso) {
  calSelectedDate = iso;
  const venue = ALL_VENUES.find(v => v.id === calSelectedVenueId);
  const allReqs = getRequestsForDate(calSelectedVenueId, iso);
  const mine    = isMyRequest(calSelectedVenueId, iso);

  const d = new Date(iso + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' });

  document.getElementById('calReqPanelTitle').textContent = `📅 ${label} — ${venue?.title || ''}`;

  if (mine) {
    const myReq = ALL_REQUESTS.find(r => r.bookerId === user.id && r.venueId === calSelectedVenueId && r.date === iso && r.status !== 'cancelled');
    goToRequestsTab(myReq?.status || 'all');
    return;
  }

  const panel = document.getElementById('calReqPanel');
  panel.classList.remove('hidden');

  const attendanceInput = document.getElementById('reqAttendance');
  if (attendanceInput && venue && venue.capacity) {
    attendanceInput.placeholder = `Up to ${venue.capacity.toLocaleString()}`;
  }

  // Reset agreement checkbox and submit button
  const calCheck = document.getElementById('calCancelCheck');
  const calSubmitBtn = document.getElementById('calReqSubmitBtn');
  if (calCheck) calCheck.checked = false;
  if (calSubmitBtn) calSubmitBtn.disabled = true;

  // Cancellation policy
  const policyBox  = document.getElementById('calCancelPolicyBox');
  const policyText = document.getElementById('calCancelPolicyText');
  const policyRef  = document.getElementById('calCancelCheckPolicyRef');
  if (policyBox && policyText) {
    if (venue?.cancellationPolicy) {
      policyText.textContent = venue.cancellationPolicy;
      policyBox.style.display = '';
      if (policyRef) policyRef.style.display = '';
    } else {
      policyBox.style.display = 'none';
      if (policyRef) policyRef.style.display = 'none';
    }
  }

  // Fee breakdown
  const feeBreakdown = document.getElementById('calFeeBreakdown');
  if (feeBreakdown && venue?.price) {
    const nightlyRate = resolveNightlyRate(venue, calSelectedDate);
    const deposit    = Math.round(nightlyRate * 0.20);
    const bookingFee = Math.round(nightlyRate * 0.05);
    feeBreakdown.innerHTML = `
      <div class="booking-fee-row"><span>Venue fee</span><span>$${nightlyRate.toLocaleString()} / night</span></div>
      <div class="booking-fee-row"><span>Deposit <span class="fee-note">(20% · held; released post-show)</span></span><span>$${deposit.toLocaleString()}</span></div>
      <div class="booking-fee-row"><span>Artist booking fee <span class="fee-note">(5% · non-refundable)</span></span><span>$${bookingFee.toLocaleString()}</span></div>
      <div class="booking-fee-total"><span>Due on approval</span><span>$${(deposit + bookingFee).toLocaleString()}</span></div>
      <p class="booking-no-charge">No payment required to submit a request. Venue pays a separate 5% fee from their deposit release.</p>`;
    feeBreakdown.style.display = '';
  } else if (feeBreakdown) {
    feeBreakdown.style.display = 'none';
  }

  if (allReqs.length > 0) {
    showDash(`${allReqs.length} other request${allReqs.length>1?'s':''} for this date — you can still submit yours.`);
  }
}

function closeReqPanel() {
  document.getElementById('calReqPanel').classList.add('hidden');
  calSelectedDate = null;
  const rf = document.getElementById('reqRiderFile');
  if (rf) { rf.value = ''; document.getElementById('reqRiderFileName').textContent = ''; }
  const calCheck = document.getElementById('calCancelCheck');
  const calSubmitBtn = document.getElementById('calReqSubmitBtn');
  if (calCheck) calCheck.checked = false;
  if (calSubmitBtn) calSubmitBtn.disabled = true;
}

function onRiderFileChange(e) {
  const f = e.target.files[0];
  document.getElementById('reqRiderFileName').textContent = f ? '📎 ' + f.name : '';
}

function submitCalRequest() {
  if (!calSelectedDate) return;
  const eventType  = document.getElementById('reqEventType').value;
  const attendance = parseInt(document.getElementById('reqAttendance').value) || 0;
  const notes      = document.getElementById('reqNotes').value.trim();
  const venue      = ALL_VENUES.find(v => v.id === calSelectedVenueId);
  const riderFile  = document.getElementById('reqRiderFile');
  const riderName  = riderFile && riderFile.files[0] ? riderFile.files[0].name : '';

  if (!document.getElementById('calCancelCheck')?.checked) {
    showDash('Please agree to the cancellation terms before submitting.');
    return;
  }
  if (!attendance) { showDash('Please enter expected attendance.'); return; }

  // Warn (but don't block) if artist already has a request on this date at a different venue
  const _existingDateReq = ALL_REQUESTS.find(r =>
    r.bookerId === user.id &&
    r.venueId  !== calSelectedVenueId &&
    r.date     === calSelectedDate &&
    (r.status === 'pending' || r.status === 'approved' || r.status === 'confirmed')
  );
  if (_existingDateReq && !submitCalRequest._conflictArmed) {
    submitCalRequest._conflictArmed = calSelectedDate;
    showDash('⚠️ You already have a booking request on this date. Submit again to proceed anyway — if that booking is confirmed, this one will be auto-cancelled.');
    return;
  }
  if (submitCalRequest._conflictArmed !== calSelectedDate) submitCalRequest._conflictArmed = null;

  const newReq = {
    id: 'req_' + Date.now(),
    bookerId: user.id,
    venueId: calSelectedVenueId,
    date: calSelectedDate,
    status: 'pending',
    eventType,
    attendance,
    notes,
    riderName,
    sent: new Date().toISOString().slice(0,10),
  };
  ALL_REQUESTS.push(newReq);

  // Sync to Browse Venues calendar indicator
  try {
    const mine = JSON.parse(localStorage.getItem('bb_my_requests') || '[]');
    mine.push({ id: newReq.id, bookerId: newReq.bookerId, venueId: newReq.venueId, date: newReq.date, status: newReq.status });
    localStorage.setItem('bb_my_requests', JSON.stringify(mine));
  } catch(e) {}

  // Queue for the host dashboard to pick up
  try {
    const queue = JSON.parse(localStorage.getItem('bb_host_pending_requests') || '[]');
    if (!queue.find(q => q.id === newReq.id)) {
      queue.push({
        id:          newReq.id,
        guest:       `${user.firstName} ${user.lastName}`.trim(),
        bandName:    profile.artistName || '',
        guestImg:    profile.avatar || '',
        property:    venue?.title || '',
        propertyImg: venue?.img   || '',
        checkin:     calSelectedDate,
        checkout:    calSelectedDate,
        guests:      attendance,
        total:       venue?.price || 0,
        submittedAt: newReq.sent,
        eventType:   eventType,
        notes:       notes,
        riderName:   riderName,
      });
      localStorage.setItem('bb_host_pending_requests', JSON.stringify(queue));
    }
  } catch(e) {}

  closeReqPanel();
  renderCalendar();
  renderRequests(requestFilter);
  updateBadges();
  showDash(`Request sent to ${venue?.title || 'venue'} for ${fmtDate(calSelectedDate)}! 🎸`);
}

function prevCalMonth() { calMonth--; if (calMonth<0) { calMonth=11; calYear--; } renderCalendar(); }
function nextCalMonth() { calMonth++; if (calMonth>11) { calMonth=0;  calYear++; } renderCalendar(); }

// ─── SAVED VENUES ─────────────────────────────────────────────────────────────

function renderSavedVenues() {
  // Always re-read from localStorage so changes from the browse page are reflected
  try { SAVED_VENUES = JSON.parse(localStorage.getItem('bb_saved_venues') || '[]'); } catch(e) {}
  const grid = document.getElementById('savedGrid');
  const saved = SAVED_VENUES;
  if (!saved.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">❤️</div>
      <h3>No saved venues yet</h3>
      <p>Browse venues and save your favourites to quickly access them here.</p>
      <a href="index.html" class="btn-save" style="display:inline-block;text-decoration:none">Browse venues</a>
    </div>`;
    return;
  }
  grid.innerHTML = saved.map(v => `
    <div class="saved-card">
      <a href="index.html?venue=${v.id}" class="saved-card-link">
        <img src="${v.img}" alt="${v.title}" class="saved-card-img" onerror="this.style.background='#1C1C1C'"/>
        <div class="saved-card-body">
          <div class="saved-card-title">${v.title}</div>
          <div class="saved-card-loc">${v.location} · Cap. ${v.capacity.toLocaleString()}</div>
          <div class="saved-card-meta">
            <span class="saved-card-price">$${v.price.toLocaleString()} <span>/ night</span></span>
          </div>
        </div>
      </a>
      <div class="saved-card-actions">
        <button class="lma-btn" onclick="requestFromSaved('${v.id}')">🎸 Request</button>
        <button class="lma-btn danger" onclick="unsaveVenue('${v.id}')">Remove</button>
      </div>
    </div>`).join('');
}

function requestFromSaved(venueId) {
  navigate(null, 'calendar');
  setTimeout(() => {
    const sel = document.getElementById('calVenueSelect');
    if ([...sel.options].some(o => o.value === String(venueId))) {
      calSelectedVenueId = String(venueId);
      sel.value = calSelectedVenueId;
      renderCalendar();
      renderVenueSummary();
    }
  }, 50);
}

function unsaveVenue(id) {
  const idx = SAVED_VENUES.findIndex(v => String(v.id) === String(id));
  if (idx > -1) SAVED_VENUES.splice(idx, 1);
  try { localStorage.setItem('bb_saved_venues', JSON.stringify(SAVED_VENUES)); } catch(e) {}
  renderSavedVenues();
  updateBadges();
  showDash('Venue removed from saved.');
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

// ─── SAVED SEARCHES ───────────────────────────────────────────────────────────

let SAVED_SEARCHES = [];
try { SAVED_SEARCHES = JSON.parse(localStorage.getItem('bb_saved_searches') || '[]'); } catch(e) {}
function saveSavedSearches() { try { localStorage.setItem('bb_saved_searches', JSON.stringify(SAVED_SEARCHES)); } catch(e) {} }

function deleteSavedSearch(idx) {
  SAVED_SEARCHES.splice(idx, 1);
  saveSavedSearches();
  renderSavedSearches();
}

function renderSavedSearches() {
  const el = document.getElementById('savedSearchesList');
  if (!el) return;
  if (!SAVED_SEARCHES.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin:0">No saved searches yet. Use filters on the browse page and click "Save this search."</p>';
    return;
  }
  el.innerHTML = SAVED_SEARCHES.map((s, i) => {
    const parts = [];
    if (s.location) parts.push(s.location);
    if (s.category && s.category !== 'all') parts.push(s.category);
    if (s.priceMax && s.priceMax < 25000) parts.push(`Up to $${s.priceMax.toLocaleString()}/night`);
    if (s.capacityMin && s.capacityMin > 0) parts.push(`${s.capacityMin.toLocaleString()}+ capacity`);
    if (s.amenities && s.amenities.length) parts.push(`${s.amenities.length} amenity filter${s.amenities.length > 1 ? 's' : ''}`);
    const label = parts.length ? parts.join(' · ') : 'All venues';
    return `<div class="saved-search-row">
      <a class="saved-search-label" href="index.html?ss=${encodeURIComponent(JSON.stringify(s))}">${label}</a>
      <button class="saved-search-delete" onclick="deleteSavedSearch(${i})" title="Remove">✕</button>
    </div>`;
  }).join('');
}

function populateProfile() {
  renderProfileCards();
  renderSavedSearches();
  const profileAvatarEl = document.getElementById('profileAvatar');
  profileAvatarEl.src     = profile.avatar || '';
  profileAvatarEl.onerror = () => {
    profileAvatarEl.onerror = null;
    profileAvatarEl.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&backgroundColor=FF2D78&textColor=ffffff`;
  };
  // Account fields (shared across all profiles)
  document.getElementById('pfFirst').value          = user.firstName    || '';
  document.getElementById('pfLast').value           = user.lastName     || '';
  document.getElementById('pfEmail').value          = user.email        || '';
  document.getElementById('pfPhone').value          = user.phone        || '';
  // Profile fields (specific to the active band profile)
  document.getElementById('pfArtist').value         = profile.artistName   || '';
  document.getElementById('pfActType').value        = profile.actType      || '';
  document.getElementById('pfGenre').value          = profile.genre        || '';
  document.getElementById('pfHomeCity').value       = profile.homeCity     || '';
  document.getElementById('pfPerformers').value     = profile.performers   || '';
  document.getElementById('pfYearsActive').value    = profile.yearsActive  || '';
  document.getElementById('pfSetLength').value      = profile.setLength    || '';
  document.getElementById('pfTravel').value         = profile.travel       || '';
  document.getElementById('pfEvents').value         = profile.eventTypes   || '';
  document.getElementById('pfAudienceSize').value   = profile.audienceSize || '';
  document.getElementById('pfSound').value          = profile.sound        || '';
  document.getElementById('pfStageSize').value      = profile.stageSize    || '';
  document.getElementById('pfRider').value          = profile.rider        || '';
  document.getElementById('pfBio').value            = profile.bio          || '';
  document.getElementById('pfWebsite').value        = profile.website      || '';
  document.getElementById('pfEpk').value            = profile.epk          || '';
  document.getElementById('pfInstagram').value      = profile.instagram    || '';
  document.getElementById('pfFacebook').value       = profile.facebook     || '';
  document.getElementById('pfTiktok').value         = profile.tiktok       || '';
  document.getElementById('pfYoutube').value        = profile.youtube      || '';
  document.getElementById('pfSpotify').value        = profile.spotify      || '';
  document.getElementById('pfSoundcloud').value     = profile.soundcloud   || '';
  document.getElementById('pfSpotifyEmbed').checked    = profile.spotifyEmbed    !== false;
  document.getElementById('pfSoundcloudEmbed').checked = profile.soundcloudEmbed !== false;
}

function saveProfile(e) {
  e.preventDefault();
  const updates = {
    firstName:    document.getElementById('pfFirst').value.trim(),
    lastName:     document.getElementById('pfLast').value.trim(),
    email:        document.getElementById('pfEmail').value.trim(),
    phone:        document.getElementById('pfPhone').value.trim(),
    artistName:   document.getElementById('pfArtist').value.trim(),
    actType:      document.getElementById('pfActType').value,
    genre:        document.getElementById('pfGenre').value.trim(),
    homeCity:     document.getElementById('pfHomeCity').value.trim(),
    performers:   document.getElementById('pfPerformers').value.trim(),
    yearsActive:  document.getElementById('pfYearsActive').value.trim(),
    setLength:    document.getElementById('pfSetLength').value.trim(),
    travel:       document.getElementById('pfTravel').value,
    eventTypes:   document.getElementById('pfEvents').value.trim(),
    audienceSize: document.getElementById('pfAudienceSize').value.trim(),
    sound:        document.getElementById('pfSound').value,
    stageSize:    document.getElementById('pfStageSize').value.trim(),
    rider:        document.getElementById('pfRider').value.trim(),
    bio:          document.getElementById('pfBio').value.trim(),
    website:      document.getElementById('pfWebsite').value.trim(),
    epk:          document.getElementById('pfEpk').value.trim(),
    instagram:    document.getElementById('pfInstagram').value.trim(),
    facebook:     document.getElementById('pfFacebook').value.trim(),
    tiktok:       document.getElementById('pfTiktok').value.trim(),
    youtube:      document.getElementById('pfYoutube').value.trim(),
    spotify:         document.getElementById('pfSpotify').value.trim(),
    soundcloud:      document.getElementById('pfSoundcloud').value.trim(),
    spotifyEmbed:    document.getElementById('pfSpotifyEmbed').checked,
    soundcloudEmbed: document.getElementById('pfSoundcloudEmbed').checked,
  };
  const newPw = document.getElementById('pfNewPw').value;
  const conf  = document.getElementById('pfConfirmPw').value;
  if (newPw) {
    if (newPw !== conf) { showDash('Passwords do not match.'); return; }
    updates.password = newPw;
  }
  BookerAuth.updateProfile(updates);
  // Refresh in-memory user (account fields) and profile (profile fields)
  Object.assign(user, { firstName: updates.firstName, lastName: updates.lastName, email: updates.email, phone: updates.phone });
  Object.assign(profile, updates);
  populateSidebarUser();
  // Refresh greeting in case name changed
  const greetEl = document.getElementById('overviewGreeting');
  if (greetEl) {
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    greetEl.textContent = `${greet}, ${profile.artistName || user.firstName}!`;
  }
  const msg = document.getElementById('profileSaveMsg');
  msg.textContent = '✓ Changes saved';
  setTimeout(() => msg.textContent = '', 3000);
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('profileAvatar').src = ev.target.result;
    BookerAuth.updateProfile({ avatar: ev.target.result });
    profile.avatar = ev.target.result;
    populateSidebarUser();
    populateTopbarAvatar();
    showDash('Profile photo updated!');
  };
  reader.readAsDataURL(file);
}

// ─── PROFILE SWITCHER ─────────────────────────────────────────────────────────

function renderProfileCards() {
  const container = document.getElementById('profileCardsWrap');
  if (!container) return;
  const all = BookerAuth.getProfiles();
  container.innerHTML = all.map(p => `
    <div class="profile-card${p.id === profile.id ? ' profile-card-active' : ''}">
      <img class="profile-card-avatar" src="${p.avatar || ''}"
           onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.artistName||'A')}&backgroundColor=FF2D78&textColor=ffffff'"/>
      <div class="profile-card-info">
        <div class="profile-card-name">${p.artistName || 'Unnamed profile'}</div>
        <div class="profile-card-genre">${p.genre || ''}</div>
      </div>
      <div class="profile-card-actions">
        ${p.id === profile.id
          ? `<span class="profile-card-active-badge">Active</span>`
          : `<button class="profile-card-btn" onclick="switchToProfile('${p.id}')">Switch</button>`}
        ${all.length > 1 ? `<button class="profile-card-delete" onclick="confirmDeleteProfile('${p.id}')" title="Delete profile">✕</button>` : ''}
      </div>
    </div>`).join('') +
    `<button class="profile-card-add" onclick="openNewProfileModal()">+ Add profile</button>`;
}

function switchToProfile(profileId) {
  BookerAuth.setActiveProfile(profileId);
  profile = BookerAuth.currentProfile();
  populateProfile();
  populateSidebarUser();
  populateTopbarAvatar();
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.getElementById('overviewGreeting');
  if (greetEl) greetEl.textContent = `${greet}, ${profile.artistName || user.firstName}!`;
  showDash(`Switched to ${profile.artistName || 'profile'}.`);
}

function confirmDeleteProfile(profileId) {
  const p = BookerAuth.getProfiles().find(x => x.id === profileId);
  if (!p) return;
  if (!confirm(`Delete the profile "${p.artistName || 'Unnamed'}"? This cannot be undone.`)) return;
  const ok = BookerAuth.deleteProfile(profileId);
  if (!ok) { showDash('You must keep at least one profile.'); return; }
  profile = BookerAuth.currentProfile();
  populateProfile();
  populateSidebarUser();
  populateTopbarAvatar();
}

function openNewProfileModal() {
  document.getElementById('newProfileModal').classList.add('open');
  document.getElementById('npArtistName').value = '';
  document.getElementById('npGenre').value = '';
  setTimeout(() => document.getElementById('npArtistName').focus(), 50);
}

function closeNewProfileModal() {
  document.getElementById('newProfileModal').classList.remove('open');
}

function saveNewProfile() {
  const artistName = document.getElementById('npArtistName').value.trim();
  if (!artistName) { document.getElementById('npArtistName').focus(); return; }
  const genre = document.getElementById('npGenre').value.trim();
  const newProf = BookerAuth.createProfile({
    artistName, genre,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(artistName)}&backgroundColor=FF2D78&textColor=ffffff`,
  });
  profile = newProf;
  closeNewProfileModal();
  populateProfile();
  populateSidebarUser();
  populateTopbarAvatar();
  showDash(`Profile "${artistName}" created and activated.`);
}

// ─── PERFORMANCE AGREEMENT ────────────────────────────────────────────────────

function openBookerAgreement(id) {
  const r = ALL_REQUESTS.find(x => x.id === id);
  const v = r ? ALL_VENUES.find(vv => vv.id === r.venueId) : null;
  if (!r || !v) return;

  const deposit    = Math.round(v.price * 0.20);
  const bookingFee = Math.round(v.price * 0.05);
  const remaining  = v.price - deposit;
  const artistName = profile.artistName || (user.firstName + ' ' + user.lastName);
  const dateStr    = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const issuedStr  = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Performance Agreement — ${artistName} @ ${v.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; background: #fff; padding: 60px 80px; max-width: 860px; margin: 0 auto; font-size: 14px; line-height: 1.65; }
    h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #555; margin-bottom: 32px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 14px; }
    .row { display: flex; gap: 16px; margin-bottom: 7px; }
    .row .label { min-width: 180px; color: #555; font-style: italic; }
    .row .val { font-weight: 600; color: #111; }
    .clause { margin-bottom: 12px; }
    .clause-num { font-weight: 700; margin-right: 6px; }
    .fin-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .fin-table th, .fin-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
    .fin-table th { font-weight: 700; background: #f7f7f7; }
    .fin-table .total-row td { font-weight: 700; border-top: 2px solid #ccc; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 16px; }
    .sig-line { margin-top: 28px; border-top: 1px solid #ccc; font-size: 11px; color: #999; padding-top: 4px; }
    .watermark { text-align: center; font-size: 11px; color: #bbb; margin-top: 48px; letter-spacing: 0.5px; }
    @media print { body { padding: 40px; } button { display: none !important; } }
  </style>
</head>
<body>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:32px">
    <div>
      <h1>Performance Agreement</h1>
      <div class="subtitle">Booking ID: ${r.id} &nbsp;·&nbsp; Issued: ${issuedStr}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700;color:#FF2D78;letter-spacing:-0.5px">GigNVenue</div>
      <div style="font-size:11px;color:#999;margin-top:2px">gignvenue.com</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Parties</div>
    <div class="row"><span class="label">Venue (Host)</span><span class="val">${v.title} — ${v.location}</span></div>
    <div class="row"><span class="label">Performer</span><span class="val">${artistName}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Event details</div>
    <div class="row"><span class="label">Performance date</span><span class="val">${dateStr}</span></div>
    <div class="row"><span class="label">Event type</span><span class="val">${r.eventType}</span></div>
    <div class="row"><span class="label">Expected attendance</span><span class="val">${r.attendance ? Number(r.attendance).toLocaleString() : '—'}</span></div>
    <div class="row"><span class="label">Venue capacity</span><span class="val">${v.capacity.toLocaleString()}</span></div>
    ${r.riderName ? `<div class="row"><span class="label">Technical rider on file</span><span class="val">${r.riderName}</span></div>` : ''}
    ${r.notes ? `<div class="row"><span class="label">Performance notes</span><span class="val" style="max-width:360px">${r.notes}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Financial terms</div>
    <table class="fin-table">
      <thead><tr><th>Item</th><th>Amount</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Nightly rate</td><td>$${v.price.toLocaleString()}</td><td>Agreed venue fee</td></tr>
        <tr><td>Deposit (20%)</td><td>$${deposit.toLocaleString()}</td><td>Held by GigNVenue; released to venue (minus 5% venue fee) within 24 hrs of show completion</td></tr>
        <tr><td>Artist booking fee (5%)</td><td>$${bookingFee.toLocaleString()}</td><td>GigNVenue platform fee — non-refundable</td></tr>
        <tr><td>Remaining balance</td><td>$${remaining.toLocaleString()}</td><td>Settled directly with venue in terms agreed between venue and artist</td></tr>
        <tr class="total-row"><td>Paid at confirmation</td><td>$${(deposit + bookingFee).toLocaleString()}</td><td>Deposit + artist booking fee</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Terms &amp; conditions</div>
    <div class="clause"><span class="clause-num">1.</span> The Performer agrees to appear at the Venue on the date and time specified and to perform for the agreed duration.</div>
    <div class="clause"><span class="clause-num">2.</span> The Venue agrees to provide the agreed space, technical facilities, and any amenities confirmed via the GigNVenue platform.</div>
    <div class="clause"><span class="clause-num">3.</span> The deposit of 20% of the nightly rate is held in escrow by GigNVenue and released to the Venue within 24 hours of the Venue confirming that the show has played off successfully, net of the Venue's 5% booking fee retained by GigNVenue at that time.</div>
    <div class="clause"><span class="clause-num">4.</span> Cancellation by the Performer within 14 days of the event date will result in forfeiture of the deposit. Cancellation by the Venue will result in a full refund of all amounts paid by the Performer.</div>
    <div class="clause"><span class="clause-num">5.</span> Both parties agree to conduct themselves professionally and in good faith, and to resolve any disputes first through GigNVenue's resolution process before pursuing external legal remedies.</div>
    <div class="clause"><span class="clause-num">6.</span> This agreement is facilitated by GigNVenue and is governed by the laws of the State of California. GigNVenue acts as platform intermediary and assumes no liability for acts or omissions of either party.</div>
  </div>

  <div class="section">
    <div class="section-title">Signatures</div>
    <div class="sig-grid">
      <div>
        <div style="font-weight:700">${artistName}</div>
        <div style="font-size:12px;color:#777">Performer</div>
        <div class="sig-line">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
      </div>
      <div>
        <div style="font-weight:700">${v.title}</div>
        <div style="font-size:12px;color:#777">Venue / Host</div>
        <div class="sig-line">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
      </div>
    </div>
  </div>

  <div class="watermark">Generated by GigNVenue · gignvenue.com · This document is for reference purposes only and does not constitute legal advice.</div>

  <div style="margin-top:32px;text-align:center;display:none" id="printBtnWrap">
    <button onclick="window.print()" style="padding:10px 28px;font-size:14px;background:#FF2D78;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:sans-serif">🖨 Print / Save as PDF</button>
  </div>
  <script>document.getElementById('printBtnWrap').style.display='block';<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { showDash('Please allow pop-ups to download the agreement.'); return; }
  win.document.write(html);
  win.document.close();
}

// ─── WISHLIST (bb_favorites) ──────────────────────────────────────────────────
// Distinct from bb_saved_venues — tracks heart-button favorites from the browse page.


// ─── TOUR PLANNER ─────────────────────────────────────────────────────────────

let TOUR_STOPS = [{ city: '', date: '' }]; // up to 10 stops
let TOUR_SELECTED = {}; // { venueId_date: true } — venues selected for submission

let _optimizedStops = null;
const _geocodeCache = {};

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function geocodeCity(city) {
  const key = city.toLowerCase().trim();
  if (_geocodeCache[key]) return _geocodeCache[key];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&countrycodes=us`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigNVenue/1.0' } });
    const data = await res.json();
    if (data && data[0]) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      _geocodeCache[key] = result;
      return result;
    }
  } catch(e) {}
  return null;
}

function routeDistance(stops) {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i-1].lat && stops[i].lat) total += haversine(stops[i-1].lat, stops[i-1].lng, stops[i].lat, stops[i].lng);
  }
  return Math.round(total);
}

function optimizeRoute(stops) {
  if (stops.length <= 2) return [...stops];
  const remaining = [...stops];
  const result = [remaining.splice(0, 1)[0]];
  while (remaining.length) {
    const last = result[result.length - 1];
    let minDist = Infinity, minIdx = 0;
    remaining.forEach((s, i) => {
      if (!last.lat || !s.lat) return;
      const d = haversine(last.lat, last.lng, s.lat, s.lng);
      if (d < minDist) { minDist = d; minIdx = i; }
    });
    result.push(remaining.splice(minIdx, 1)[0]);
  }
  return result;
}

function showRouteOptimizationBanner(original, optimized, origDist, optDist) {
  _optimizedStops = optimized;
  const savings = origDist - optDist;
  const banner = document.getElementById('tourRouteBanner');
  const savingsEl = document.getElementById('tourRouteSavings');
  const origEl = document.getElementById('tourRouteOrig');
  const optEl = document.getElementById('tourRouteOpt');
  if (!banner) return;
  if (savingsEl) savingsEl.textContent = savings;
  if (origEl) origEl.textContent = original.map(s => s.city.split(',')[0]).join(' → ');
  if (optEl) optEl.textContent = optimized.map(s => s.city.split(',')[0]).join(' → ');
  banner.style.display = '';
}

function acceptOptimizedRoute() {
  if (!_optimizedStops) return;
  // Reassign dates in original chronological order to the new city sequence
  const sortedDates = TOUR_STOPS.map(s => s.date).sort();
  TOUR_STOPS = _optimizedStops.map((s, i) => ({ city: s.city, date: sortedDates[i] || s.date, lat: s.lat, lng: s.lng }));
  _optimizedStops = null;
  document.getElementById('tourRouteBanner').style.display = 'none';
  renderTourPlanner();
  searchTourVenues();
}

function dismissRouteBanner() {
  _optimizedStops = null;
  const banner = document.getElementById('tourRouteBanner');
  if (banner) banner.style.display = 'none';
}

function onTourRiderFileChange(event) {
  const file = event.target.files[0];
  const nameEl = document.getElementById('tourRiderFileName');
  if (nameEl) nameEl.textContent = file ? `📎 ${file.name}` : '';
}

function renderTourPlanner() {
  const list = document.getElementById('tourStopsList');
  if (!list) return;
  list.innerHTML = TOUR_STOPS.map((stop, i) => `
    <div class="tour-stop-row" data-idx="${i}">
      <input type="text" class="tour-city-input" value="${stop.city}"
        placeholder="City, State (e.g. Nashville, TN)"
        oninput="TOUR_STOPS[${i}].city=this.value"
        style="border:1px solid var(--border);border-radius:8px;padding:9px 14px;font-size:14px;background:var(--bg-input);color:var(--text);outline:none;width:100%"/>
      <input type="date" class="tour-date-input" value="${stop.date}"
        oninput="TOUR_STOPS[${i}].date=this.value"
        style="border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:14px;background:var(--bg-input);color:var(--text);outline:none;width:100%"/>
      <button onclick="removeTourStop(${i})" title="Remove stop"
        style="background:none;border:1px solid var(--border);border-radius:8px;color:var(--text-muted);font-size:15px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"
        ${TOUR_STOPS.length <= 1 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>✕</button>
    </div>`).join('');
  // Reset results when stops change
  const hint = document.getElementById('tourStopsHint');
  if (hint) hint.textContent = TOUR_STOPS.length < 10 ? 'Add at least one city and date to search.' : 'Maximum 10 stops reached.';
}

function addTourStop() {
  if (TOUR_STOPS.length >= 10) { showDash('Maximum 10 tour stops.'); return; }
  TOUR_STOPS.push({ city: '', date: '' });
  renderTourPlanner();
}

function removeTourStop(idx) {
  if (TOUR_STOPS.length <= 1) return;
  TOUR_STOPS.splice(idx, 1);
  renderTourPlanner();
}

// ─── TOUR MAP ─────────────────────────────────────────────────────────────────

let _tourMap = null;
let _tourMapLayers = [];

function initTourMap() {
  if (_tourMap) return;
  const el = document.getElementById('tourMap');
  if (!el || !window.L) return;
  _tourMap = L.map('tourMap', { zoomControl: true });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(_tourMap);
}

function updateTourMap(stops, venueGroups) {
  if (!window.L) return;
  const wrap = document.getElementById('tourMapWrap');
  if (!wrap) return;

  const geocoded = stops.filter(s => s.lat && s.lng);
  if (!geocoded.length) { wrap.style.display = 'none'; return; }

  wrap.style.display = '';
  if (!_tourMap) initTourMap();
  if (!_tourMap) return;

  // Clear previous layers
  _tourMapLayers.forEach(l => l.remove());
  _tourMapLayers = [];

  // Route polyline
  if (geocoded.length > 1) {
    const line = L.polyline(geocoded.map(s => [s.lat, s.lng]), {
      color: '#FF2D78', weight: 2, opacity: 0.7, dashArray: '6 8'
    }).addTo(_tourMap);
    _tourMapLayers.push(line);
  }

  // Numbered stop markers
  geocoded.forEach((stop, i) => {
    const el = document.createElement('div');
    el.style.cssText = 'background:#FF2D78;color:#fff;font-size:12px;font-weight:700;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.6)';
    el.textContent = i + 1;
    const marker = L.marker([stop.lat, stop.lng], {
      icon: L.divIcon({ className: '', html: el, iconSize: [28, 28], iconAnchor: [14, 14] })
    }).bindTooltip(`<strong>${stop.city}</strong><br>${new Date(stop.date + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}`, { direction: 'top' });
    marker.addTo(_tourMap);
    _tourMapLayers.push(marker);
  });

  // Venue pins near each stop
  venueGroups.forEach(({ venues }) => {
    venues.forEach(v => {
      if (!v.lat || !v.lng) return;
      const el = document.createElement('div');
      el.style.cssText = 'background:#1a1a1a;color:#fff;font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px;border:1px solid rgba(255,45,120,0.5);white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.5)';
      el.textContent = v.title;
      const marker = L.marker([v.lat, v.lng], {
        icon: L.divIcon({ className: '', html: el, iconSize: [null, null] })
      }).bindTooltip(`<strong>${v.title}</strong><br>${v.location}<br>$${v.price.toLocaleString()}/night · Cap. ${v.capacity.toLocaleString()}`, { direction: 'top' });
      marker.addTo(_tourMap);
      _tourMapLayers.push(marker);
    });
  });

  // Fit all points in view
  const allPoints = [
    ...geocoded.map(s => [s.lat, s.lng]),
    ...venueGroups.flatMap(({ venues }) => venues.filter(v => v.lat && v.lng).map(v => [v.lat, v.lng]))
  ];
  if (allPoints.length) _tourMap.fitBounds(allPoints, { padding: [40, 40] });
  setTimeout(() => _tourMap && _tourMap.invalidateSize(), 100);
}

async function searchTourVenues() {
  document.querySelectorAll('.tour-stop-row').forEach((row, i) => {
    const cityEl = row.querySelector('.tour-city-input');
    const dateEl = row.querySelector('.tour-date-input');
    if (cityEl && TOUR_STOPS[i]) TOUR_STOPS[i].city = cityEl.value.trim();
    if (dateEl && TOUR_STOPS[i]) TOUR_STOPS[i].date = dateEl.value;
  });

  const validStops = TOUR_STOPS.filter(s => s.city.trim() && s.date);
  if (!validStops.length) { showDash('Please enter at least one city and date.'); return; }

  TOUR_SELECTED = {};
  const resultsSection = document.getElementById('tourResultsSection');
  const resultsBody    = document.getElementById('tourResultsBody');
  const routeBanner    = document.getElementById('tourRouteBanner');
  const hint           = document.getElementById('tourStopsHint');
  if (!resultsSection || !resultsBody) return;
  if (routeBanner) routeBanner.style.display = 'none';

  if (hint) hint.textContent = 'Locating cities…';

  // Geocode all stops with rate-limit spacing
  for (const stop of validStops) {
    const geo = await geocodeCity(stop.city);
    stop.lat = geo?.lat || null;
    stop.lng = geo?.lng || null;
    await new Promise(r => setTimeout(r, 350));
  }

  // Route optimization — only if 3+ geocoded stops
  const geocoded = validStops.filter(s => s.lat && s.lng);
  if (geocoded.length >= 3) {
    const origDist = routeDistance(geocoded);
    const optimized = optimizeRoute(geocoded);
    const optDist   = routeDistance(optimized);
    if (origDist > 0 && optDist < origDist * 0.9 && (origDist - optDist) >= 50) {
      showRouteOptimizationBanner(geocoded, optimized, origDist, optDist);
    }
  }

  // Date conflict detection
  const myBookedDates = new Set(
    ALL_REQUESTS.filter(r => r.bookerId === user.id && ['pending','approved'].includes(r.status))
      .map(r => r.date)
  );

  let html = '';
  let anyFound = false;
  const _tourVenueGroups = [];

  validStops.forEach(stop => {
    const conflicted = myBookedDates.has(stop.date);
    let matches = [];

    if (stop.lat && stop.lng) {
      matches = ALL_VENUES
        .filter(v => v.lat && v.lng && haversine(stop.lat, stop.lng, v.lat, v.lng) <= 75)
        .map(v => ({ ...v, _dist: Math.round(haversine(stop.lat, stop.lng, v.lat, v.lng)) }))
        .sort((a, b) => a._dist - b._dist);
    } else {
      const q = stop.city.toLowerCase();
      matches = ALL_VENUES.filter(v => v.location.toLowerCase().includes(q)).map(v => ({ ...v, _dist: null }));
    }
    _tourVenueGroups.push({ stop, venues: matches });

    const dateStr = new Date(stop.date + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

    html += `<div class="tour-stop-group">
      <div class="tour-stop-group-title">
        📍 ${stop.city} — ${dateStr}
        ${conflicted ? `<span class="tour-conflict-badge">⚠️ You already have a request on this date</span>` : ''}
      </div>`;

    if (!matches.length) {
      html += `<p style="font-size:13px;color:var(--text-muted);padding:8px 0">No venues found within 75 miles. <button class="res-action-btn" onclick="openSuggestVenueModal()" style="font-size:13px">Suggest one →</button></p>`;
    } else {
      anyFound = true;
      matches.forEach(v => {
        const key = `${v.id}_${stop.date}`;
        const alreadyRequested = ALL_REQUESTS.some(r => r.bookerId === user.id && r.venueId === v.id && r.date === stop.date);
        html += `<div class="tour-venue-row">
          <input type="checkbox" id="tv_${key}" ${alreadyRequested ? 'disabled' : ''}
            data-venue-id="${v.id}" data-date="${stop.date}" data-city="${stop.city.replace(/"/g,'&quot;')}"
            onchange="onTourVenueCheck(this)"
            style="width:16px;height:16px;flex-shrink:0;cursor:${alreadyRequested?'not-allowed':'pointer'}"/>
          <img class="tour-venue-img" src="${v.img}" alt="" onerror="this.style.background='var(--border)'"/>
          <div class="tour-venue-info">
            <div class="tour-venue-title">${v.title}</div>
            <div class="tour-venue-loc">${v.location} · $${v.price.toLocaleString()}/night · Cap. ${v.capacity.toLocaleString()}${v._dist !== null ? ` · <strong style="color:var(--text)">${v._dist} mi</strong>` : ''}</div>
            ${alreadyRequested ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">Request already sent for this date</div>' : ''}
          </div>
          <label for="tv_${key}" style="font-size:12px;color:${alreadyRequested?'var(--text-muted)':'var(--red)'};font-weight:600;cursor:${alreadyRequested?'default':'pointer'};flex-shrink:0">
            ${alreadyRequested ? 'Sent' : 'Select'}
          </label>
        </div>`;
      });
    }
    html += '</div>';
  });

  resultsBody.innerHTML = html;
  resultsSection.style.display = '';
  updateTourDetailsPanel();
  updateTourMap(validStops, _tourVenueGroups);
  if (hint) hint.textContent = TOUR_STOPS.length < 10 ? 'Add at least one city and date to search.' : 'Maximum 10 stops reached.';
}

function onTourVenueCheck(checkbox) {
  const venueId = checkbox.dataset.venueId;
  const date    = checkbox.dataset.date;
  const city    = checkbox.dataset.city;
  const key     = `${venueId}_${date}`;
  if (checkbox.checked) {
    TOUR_SELECTED[key] = { venueId, date, city };
  } else {
    delete TOUR_SELECTED[key];
  }
  updateTourDetailsPanel();
}

function updateTourDetailsPanel() {
  const count  = Object.keys(TOUR_SELECTED).length;
  const panel  = document.getElementById('tourDetailsPanel');
  const btn    = document.getElementById('tourSubmitBtn');
  if (panel) panel.style.display = count > 0 ? '' : 'none';
  if (btn) btn.textContent = count > 0
    ? `📨 Send ${count} tour request${count > 1 ? 's' : ''}`
    : '📨 Send tour requests';
}

function submitTourRequests() {
  const freeze = isAccountFrozen();
  if (freeze.frozen) {
    if (freeze.reason === 'flagged') {
      showDash('Your account is currently under review. Please contact support to restore booking access.');
    } else {
      const d = new Date(freeze.until).toLocaleDateString('en-US', { month:'long', day:'numeric' });
      showDash(`New requests are paused until ${d} due to a missed payment window.`);
    }
    return;
  }
  const selected = Object.values(TOUR_SELECTED);
  if (!selected.length) { showDash('Select at least one venue first.'); return; }

  const eventType  = document.getElementById('tourEventType').value;
  const attendance = parseInt(document.getElementById('tourAttendance').value) || 0;
  const notes      = document.getElementById('tourNotes').value.trim();
  const riderFile  = document.getElementById('tourRiderFile');
  const riderName  = riderFile && riderFile.files[0] ? riderFile.files[0].name : '';

  if (!attendance) { showDash('Please enter expected attendance.'); return; }

  // Load bb_my_requests once — used for duplicate check and to write back
  let myReqs = [];
  try { myReqs = JSON.parse(localStorage.getItem('bb_my_requests') || '[]'); } catch(e) {}

  const newReqs = [];
  const skipped = [];
  selected.forEach(sel => {
    const v = ALL_VENUES.find(vv => vv.id === sel.venueId);
    if (!v) return;

    // Hard duplicate guard: same booker, same venue, same date, non-cancelled
    const duplicate = ALL_REQUESTS.find(r =>
      r.bookerId === user.id && r.venueId === v.id && r.date === sel.date && r.status !== 'cancelled'
    ) || myReqs.find(r =>
      r.bookerId === user.id && r.venueId === v.id && r.date === sel.date && r.status !== 'cancelled'
    );
    if (duplicate) { skipped.push(`${v.title} (${sel.date})`); return; }

    const req = {
      id:         'req_tour_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      bookerId:   user.id,
      venueId:    v.id,
      date:       sel.date,
      status:     'pending',
      eventType,
      attendance,
      notes:      notes || `Tour stop: ${sel.city}`,
      riderName,
      sent:       new Date().toISOString().slice(0, 10),
      isTourReq:  true,
    };
    ALL_REQUESTS.push(req);
    newReqs.push(req);

    try {
      const hostKey = `bb_host_pending_requests_${v.id}`;
      const pending = JSON.parse(localStorage.getItem(hostKey) || '[]');
      pending.push({ ...req, venueName: v.title });
      localStorage.setItem(hostKey, JSON.stringify(pending));
    } catch(e) {}
  });

  try {
    const existing = JSON.parse(localStorage.getItem('bb_site_requests') || '[]');
    newReqs.forEach(r => existing.push(r));
    localStorage.setItem('bb_site_requests', JSON.stringify(existing));
  } catch(e) {}

  // Write to bb_my_requests so the public site's duplicate check sees tour requests too
  try {
    newReqs.forEach(r => myReqs.push({ id: r.id, bookerId: r.bookerId, venueId: r.venueId, date: r.date, status: r.status }));
    localStorage.setItem('bb_my_requests', JSON.stringify(myReqs));
  } catch(e) {}

  if (skipped.length) showDash(`Skipped ${skipped.length} duplicate request${skipped.length > 1 ? 's' : ''}: ${skipped.join(', ')}`);

  TOUR_SELECTED = {};
  renderOverview();
  renderRequests(requestFilter);
  updateBadges();
  searchTourVenues(); // refresh results to show "sent" state
  if (newReqs.length) showDash(`${newReqs.length} tour request${newReqs.length > 1 ? 's' : ''} sent!`);
}

// ── Suggest a venue modal ──

function openSuggestVenueModal() {
  ['svName','svCity','svWebsite','svNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('suggestVenueOverlay').classList.add('open');
  document.getElementById('suggestVenueModal').classList.add('open');
  setTimeout(() => document.getElementById('svName')?.focus(), 50);
}

function closeSuggestVenueModal() {
  document.getElementById('suggestVenueOverlay').classList.remove('open');
  document.getElementById('suggestVenueModal').classList.remove('open');
}

function submitVenueSuggestion() {
  const name    = document.getElementById('svName')?.value.trim();
  const city    = document.getElementById('svCity')?.value.trim();
  const website = document.getElementById('svWebsite')?.value.trim();
  const note    = document.getElementById('svNote')?.value.trim().slice(0, 300);
  if (!name) { document.getElementById('svName')?.focus(); showDash('Please enter a venue name.'); return; }
  if (!city) { document.getElementById('svCity')?.focus(); showDash('Please enter a city.'); return; }
  const suggestion = {
    id:          'sug_' + Date.now(),
    submittedBy: user.id,
    artistName:  profile.artistName || user.firstName,
    name, city, website, note,
    submittedAt: Date.now(),
  };
  try {
    const existing = JSON.parse(localStorage.getItem('bb_venue_suggestions') || '[]');
    existing.push(suggestion);
    localStorage.setItem('bb_venue_suggestions', JSON.stringify(existing));
  } catch(e) {}
  closeSuggestVenueModal();
  showDash('Suggestion submitted — thank you!');
}

// ─── RATINGS ─────────────────────────────────────────────────────────────────

let BB_RATINGS = [];
(function() {
  try { BB_RATINGS = JSON.parse(localStorage.getItem('bb_ratings') || '[]'); } catch(e) {}
})();

function saveRatings() {
  try { localStorage.setItem('bb_ratings', JSON.stringify(BB_RATINGS)); } catch(e) {}
}

let _artistRatingBookingId = null;

function openArtistRatingModal(bookingId) {
  _artistRatingBookingId = bookingId;
  const r   = ALL_REQUESTS.find(x => x.id === bookingId);
  const v   = r ? ALL_VENUES.find(vv => vv.id === r.venueId) : null;
  const sub = document.getElementById('artistRatingSubtitle');
  if (sub) sub.textContent = `How was your experience at ${v?.title || 'the venue'}?`;
  ['arQ1','arQ2','arQ3'].forEach(n => {
    document.querySelectorAll(`input[name="${n}"]`).forEach(i => i.checked = false);
  });
  const noteEl = document.getElementById('arNote');
  if (noteEl) noteEl.value = '';
  document.getElementById('artistRatingOverlay').classList.add('open');
  document.getElementById('artistRatingModal').classList.add('open');
}

function closeArtistRatingModal() {
  document.getElementById('artistRatingOverlay').classList.remove('open');
  document.getElementById('artistRatingModal').classList.remove('open');
  _artistRatingBookingId = null;
}

function submitArtistRating() {
  if (!_artistRatingBookingId) return;
  const r  = ALL_REQUESTS.find(x => x.id === _artistRatingBookingId);
  const q1 = parseInt(document.querySelector('input[name="arQ1"]:checked')?.value || '0');
  const q2 = parseInt(document.querySelector('input[name="arQ2"]:checked')?.value || '0');
  const q3 = parseInt(document.querySelector('input[name="arQ3"]:checked')?.value || '0');
  if (!q1 || !q2 || !q3) { showDash('Please answer all three questions.'); return; }
  const note = (document.getElementById('arNote')?.value || '').trim().slice(0, 200);
  const rating = {
    id: 'rat_' + Date.now(),
    bookingId: _artistRatingBookingId,
    raterType: 'artist',
    raterId: user.id,
    ratedId: r?.venueId || '',
    venueId: r?.venueId || '',
    scores: { asDescribed: q1, professional: q2, wouldBookAgain: q3 },
    note,
    submittedAt: Date.now(),
    response: null,
    responseAt: null,
    locked: false,
  };
  BB_RATINGS.push(rating);
  saveRatings();
  closeArtistRatingModal();
  renderOverview();
  showDash('Rating submitted — thank you!');
}

function checkCompletedRatingPrompts() {
  // Returns requests that are completed/approved+paid but not yet rated by this artist
  const completed = ALL_REQUESTS.filter(r =>
    r.bookerId === user.id &&
    r.status === 'approved' &&
    r.paymentStatus === 'paid'
  );
  return completed.filter(r => !BB_RATINGS.some(rt => rt.raterType === 'artist' && rt.bookingId === r.id));
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function _insertNotification({ recipientType, recipientId, type, title, body, bookingId = null, actionUrl = null }) {
  if (!recipientId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipientId)) return;
  gnvClient.from('notifications').insert({
    recipient_type: recipientType,
    recipient_id:   recipientId,
    type,
    title,
    body,
    booking_id:     bookingId,
    action_url:     actionUrl,
  }).then(({ error }) => { if (error) console.warn('Notification insert failed:', error.message); });
}

function _markNotificationsRead(bookingId) {
  if (!bookingId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId)) return;
  gnvClient.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_type', 'artist').eq('recipient_id', user.id)
    .eq('booking_id', bookingId).is('read_at', null)
    .then();
}

// ─── PENDING RESOLUTIONS (artist-side) ───────────────────────────────────────

function renderPendingActions(targetId = 'pendingActionsWrap') {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;

  let pending = [];
  try {
    pending = JSON.parse(localStorage.getItem('gnv_pending_resolutions') || '[]');
  } catch(e) {}

  // Merge Supabase resolutions (mapped to same shape renderPendingActions expects)
  _supabaseResolutions.forEach(res => {
    if (pending.find(p => p.id === res.id)) return; // already present
    const bk = res.booking_requests || {};
    pending.push({
      id:             res.id,
      venueTitle:     bk.venues?.title || '—',
      artistName:     user?.display_name || '',
      showDate:       bk.show_date || '',
      resolution:     res.resolution_type,
      resolutionSetAt: new Date(res.created_at).getTime(),
      lapseHours:     res.auto_lapse_at ? Math.round((new Date(res.auto_lapse_at) - Date.now()) / 3600000) : null,
      venueRelease:   res.venue_release || 0,
      artistRefund:   res.artist_refund || 0,
      pendingNewDate: res.new_date || null,
      hostNote:       res.host_note || null,
      _isSupabase:    true,
    });
  });

  if (!pending.length) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }

  const resLabels = {
    'played':        'Show played as planned',
    'host-cancel':   'Host canceled this booking',
    'artist-cancel': 'Artist-initiated cancellation',
    'mutual':        'Mutual cancellation',
    'postponed':     'New show date proposed',
  };

  const html = pending.map(p => {
    // For 'played' resolution — combined confirm + review prompt
    if (p.resolution === 'played') {
      return `
      <div class="pending-action-card" id="pac-${p.id}">
        <div class="pending-action-header">
          <span class="pending-action-icon">🎤</span>
          <div class="pending-action-title-block">
            <div class="pending-action-label">How was your show?</div>
            <div class="pending-action-sub">${p.venueTitle} · ${fmtDate(p.showDate)}</div>
          </div>
          <span class="pending-action-badge">Response needed</span>
        </div>
        <div class="pending-action-body">Your host confirmed this show played as planned and your deposit is set to be released. If that's right, leave your review below — submitting it confirms the show happened. Something's not right? Dispute it instead.</div>
        <div class="pac-review-wrap" id="pac-review-${p.id}">
          <div class="pac-stars" id="pac-stars-${p.id}">
            ${[1,2,3,4,5].map(n => `<button class="pac-star" data-val="${n}" onclick="setPacStar('${p.id}',${n})" title="${n} star${n>1?'s':''}">★</button>`).join('')}
          </div>
          <textarea class="pending-dispute-textarea" id="pac-review-text-${p.id}" placeholder="Tell other artists about this venue… (optional)" rows="2" style="margin-top:10px"></textarea>
          <div class="pending-action-footer" style="margin-top:10px">
            <button class="pending-action-btn pending-action-btn--confirm" id="pac-submit-${p.id}" onclick="submitPlayedOffReview('${p.id}')" disabled>Submit review &amp; confirm show</button>
            <button class="pending-action-btn pending-action-btn--dispute" onclick="openDisputeForm('${p.id}')">Something's wrong — Dispute</button>
          </div>
        </div>
        <div class="pending-dispute-form" id="pac-dispute-${p.id}" style="display:none">
          <textarea class="pending-dispute-textarea" id="pac-dispute-notes-${p.id}" placeholder="Describe the issue…" rows="3"></textarea>
          <div class="pending-dispute-actions">
            <button class="pending-action-btn pending-action-btn--dispute" onclick="submitDispute('${p.id}')">Submit dispute</button>
            <button class="pending-action-btn pending-action-btn--cancel" onclick="document.getElementById('pac-dispute-${p.id}').style.display='none';document.getElementById('pac-review-${p.id}').style.display=''">Cancel</button>
          </div>
        </div>
      </div>`;
    }

    // All other resolution types — simple confirm / dispute
    let bodyText = '';
    if (p.resolution === 'host-cancel') {
      bodyText = `Your host canceled this booking. Your full $${Math.round(p.artistRefund || 0).toLocaleString()} — deposit plus booking fee — will be returned. Confirm to acknowledge.`;
    } else if (p.resolution === 'artist-cancel') {
      bodyText = `Your host recorded an artist-initiated cancellation. A refund of $${Math.round(p.artistRefund || 0).toLocaleString()} will be returned per your agreed terms. Confirm if accurate.`;
    } else if (p.resolution === 'mutual') {
      bodyText = `Your host recorded a mutually agreed cancellation. A refund of $${Math.round(p.artistRefund || 0).toLocaleString()} will be returned per your agreed terms. Confirm if accurate.`;
    } else if (p.resolution === 'postponed') {
      bodyText = `Your host has proposed moving this show to <strong>${fmtDate(p.pendingNewDate)}</strong>. The deposit stays held. You must actively confirm the new date — it won't auto-confirm.`;
    }
    return `
      <div class="pending-action-card" id="pac-${p.id}">
        <div class="pending-action-header">
          <span class="pending-action-icon">⏳</span>
          <div class="pending-action-title-block">
            <div class="pending-action-label">${resLabels[p.resolution] || 'Action required'}</div>
            <div class="pending-action-sub">${p.venueTitle} · ${fmtDate(p.showDate)}</div>
          </div>
          <span class="pending-action-badge">Response needed</span>
        </div>
        <div class="pending-action-body">${bodyText}</div>
        <div class="pending-action-footer" id="pac-footer-${p.id}">
          <button class="pending-action-btn pending-action-btn--confirm" onclick="confirmResolution('${p.id}')">✓ Confirm</button>
          <button class="pending-action-btn pending-action-btn--dispute" onclick="openDisputeForm('${p.id}')">Dispute</button>
        </div>
        <div class="pending-dispute-form" id="pac-dispute-${p.id}" style="display:none">
          <textarea class="pending-dispute-textarea" id="pac-dispute-notes-${p.id}" placeholder="Describe the issue…" rows="3"></textarea>
          <div class="pending-dispute-actions">
            <button class="pending-action-btn pending-action-btn--dispute" onclick="submitDispute('${p.id}')">Submit dispute</button>
            <button class="pending-action-btn pending-action-btn--cancel" onclick="document.getElementById('pac-dispute-${p.id}').style.display='none';document.getElementById('pac-footer-${p.id}').style.display=''">Cancel</button>
          </div>
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = html;
  wrap.style.display = 'block';
}

function confirmResolution(id) {
  try {
    const responses = JSON.parse(localStorage.getItem('gnv_resolution_responses') || '[]');
    responses.push({ id, action: 'confirmed', notes: '', respondedAt: Date.now(), bookerId: user.id });
    localStorage.setItem('gnv_resolution_responses', JSON.stringify(responses));
    const pending = JSON.parse(localStorage.getItem('gnv_pending_resolutions') || '[]');
    localStorage.setItem('gnv_pending_resolutions', JSON.stringify(pending.filter(p => p.id !== id)));
  } catch(e) {}
  // Supabase path for real resolution rows
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    gnvClient.from('booking_resolutions').update({ status: 'confirmed' }).eq('id', id)
      .then(({ error }) => { if (error) console.warn('Resolution confirm failed:', error.message); });
    const res = _supabaseResolutions.find(r => r.id === id);
    if (res) {
      const hostId = res.booking_requests?.venues?.host_id;
      _insertNotification({
        recipientType: 'host', recipientId: hostId,
        type: 'resolution_confirmed', title: 'Artist confirmed your resolution',
        body: `The artist confirmed the resolution for ${res.booking_requests?.venues?.title || 'your venue'} · ${res.booking_requests?.show_date || ''}.`,
        bookingId: res.booking_id, actionUrl: 'host-dashboard.html',
      });
      _markNotificationsRead(res.booking_id);
    }
    _supabaseResolutions = _supabaseResolutions.filter(r => r.id !== id);
  }
  showDash('Response sent — the host has been notified.');
  renderPendingActions();
  if (requestFilter === 'completed') renderPendingActions('completedActionsArea');
  renderRequests(requestFilter);
  updateBadges();
  renderOverview();
}

function submitDispute(id) {
  const notes = (document.getElementById(`pac-dispute-notes-${id}`)?.value || '').trim();
  try {
    const responses = JSON.parse(localStorage.getItem('gnv_resolution_responses') || '[]');
    responses.push({ id, action: 'disputed', notes, respondedAt: Date.now(), bookerId: user.id });
    localStorage.setItem('gnv_resolution_responses', JSON.stringify(responses));
    const pending = JSON.parse(localStorage.getItem('gnv_pending_resolutions') || '[]');
    localStorage.setItem('gnv_pending_resolutions', JSON.stringify(pending.filter(p => p.id !== id)));
  } catch(e) {}
  // Supabase path for real resolution rows
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    gnvClient.from('booking_resolutions').update({ status: 'disputed', artist_note: notes || null }).eq('id', id)
      .then(({ error }) => { if (error) console.warn('Resolution dispute failed:', error.message); });
    const res = _supabaseResolutions.find(r => r.id === id);
    if (res) {
      const hostId = res.booking_requests?.venues?.host_id;
      _insertNotification({
        recipientType: 'host', recipientId: hostId,
        type: 'resolution_disputed', title: 'Artist disputed your resolution',
        body: `The artist disputed the resolution for ${res.booking_requests?.venues?.title || 'your venue'} · ${res.booking_requests?.show_date || ''}. GigNVenue will review.`,
        bookingId: res.booking_id, actionUrl: 'host-dashboard.html',
      });
      _markNotificationsRead(res.booking_id);
    }
    _supabaseResolutions = _supabaseResolutions.filter(r => r.id !== id);
  }
  showDash('Dispute submitted — GigNVenue will review and follow up within 24 hours.');
  renderPendingActions();
  if (requestFilter === 'completed') renderPendingActions('completedActionsArea');
  renderRequests(requestFilter);
  updateBadges();
  renderOverview();
}

const _pacStarSelections = {};   // { [pendingId]: starValue }

function setPacStar(id, val) {
  _pacStarSelections[id] = val;
  document.querySelectorAll(`#pac-stars-${id} .pac-star`).forEach(btn => {
    btn.classList.toggle('pac-star--active', parseInt(btn.dataset.val) <= val);
  });
  const submitBtn = document.getElementById(`pac-submit-${id}`);
  if (submitBtn) submitBtn.disabled = false;
}

function submitPlayedOffReview(id) {
  const stars  = _pacStarSelections[id];
  if (!stars)  { showDash('Please select a star rating before submitting.'); return; }
  const review = (document.getElementById(`pac-review-text-${id}`)?.value || '').trim();
  // Save artist-side rating to bb_ratings
  try {
    const pending = JSON.parse(localStorage.getItem('gnv_pending_resolutions') || '[]');
    const p       = pending.find(x => x.id === id);
    const ratings = JSON.parse(localStorage.getItem('bb_ratings') || '[]');
    ratings.push({
      id:          'rat_' + Date.now(),
      bookingId:   id,
      raterType:   'artist',
      raterId:     user?.id || 'artist',
      ratedId:     p?.venueTitle || '',
      stars,
      review,
      submittedAt: Date.now(),
    });
    localStorage.setItem('bb_ratings', JSON.stringify(ratings));
  } catch(e) {}
  // Confirm the resolution (releases deposit to venue)
  confirmResolution(id);
  showDash('Review submitted — thank you! Your deposit confirmation has been sent to the venue.');
}

function openDisputeForm(id) {
  const footer = document.getElementById(`pac-footer-${id}`);
  const review = document.getElementById(`pac-review-${id}`);
  const form   = document.getElementById(`pac-dispute-${id}`);
  if (footer) footer.style.display = 'none';
  if (review) review.style.display = 'none';
  if (form)   form.style.display   = '';
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

let toastTimer;
function showDash(msg) {
  let t = document.getElementById('_dash_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_dash_toast';
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1C1C1C;border:1px solid #333;color:#fff;padding:12px 24px;border-radius:999px;font-size:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.6);transition:opacity 0.3s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.opacity = '0', 3200);
}
