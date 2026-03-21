/* ============================================
   HOST DASHBOARD LOGIC — GigNVenue
   ============================================ */

'use strict';

// Guard: must be logged in
Auth.requireAuth('host-login.html');

const user = Auth.currentUser();

// ─── ARTIST RELIABILITY ───────────────────────────────────────────────────────
// Read the same 'bb_reliability' store seeded by the artist dashboard.
// Keyed by artist full name for demo display (Supabase will use userId).

function getArtistReliability(guestName) {
  try {
    const all = JSON.parse(localStorage.getItem('bb_reliability') || '{}');
    return all[guestName] || null;
  } catch(e) { return null; }
}

function renderReliabilityBadge(guestName) {
  const rel = getArtistReliability(guestName);
  if (!rel || !rel.approvals) return '<span class="reliability-badge reliability-good" style="opacity:0.6">New artist</span>';
  const pct = Math.round((rel.paid / rel.approvals) * 100);
  if (pct >= 80) return `<span class="reliability-badge reliability-good">✓ ${pct}% pay rate</span>`;
  if (pct >= 50) return `<span class="reliability-badge reliability-warn">⚠ ${pct}% pay rate</span>`;
  return `<span class="reliability-badge reliability-poor">! ${pct}% pay rate</span>`;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const RESERVATIONS = [
  { id:'r1', guest:'Emily Clarke',  bandName:'The Midnight Echoes', guestImg:'https://randomuser.me/api/portraits/women/12.jpg', property:'The Neon Stage',    propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-04-18', checkout:'2026-04-18', guests:320, total:8400, status:'confirmed', confirmedAt: Date.now() - 18 * 60 * 60 * 1000, submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, eventType:'Concert / live show', notes:'Indie-folk headliner, 90-min set. Full backline needed — drums, bass amp, guitar cab. We travel with our own FOH engineer.', paymentStatus:'paid', paidAt: Date.now() - 12 * 60 * 60 * 1000 },
  { id:'r2', guest:'Jake Morrison',  bandName:'Velvet Storm',        guestImg:'https://randomuser.me/api/portraits/men/35.jpg',  property:'Velvet Lounge',     propertyImg:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=60', checkin:'2026-05-10', checkout:'2026-05-10', guests:180, total:6500, status:'confirmed', confirmedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, submittedAt: Date.now() - 8 * 24 * 60 * 60 * 1000, eventType:'Album launch', notes:'Album release show. Looking for an intimate vibe — seated or standing is fine. Will need a projector for visuals behind the stage.' },
  { id:'r3', guest:'Priya Nair',                                     guestImg:'https://randomuser.me/api/portraits/women/54.jpg',property:'Rooftop Sessions',   propertyImg:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=60', checkin:'2026-04-28', checkout:'2026-04-28', guests:100, total:3200, status:'pending',   submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, eventType:'Acoustic set', notes:'Solo acoustic performance. Minimal setup — just a vocal mic and DI for guitar. Very low production requirements.' },
  { id:'r7', guest:'Marcus Webb',                                    guestImg:'https://randomuser.me/api/portraits/men/44.jpg',  property:'The Neon Stage',    propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-06-05', checkout:'2026-06-05', guests:280, total:7200, status:'pending',   submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, eventType:'Concert / live show', notes:'' },
  { id:'r9', guest:'Leon Hayes',     bandName:'Static Frequency',   guestImg:'https://randomuser.me/api/portraits/men/52.jpg',  property:'The Neon Stage',    propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-06-05', checkout:'2026-06-05', guests:260, total:6800, status:'pending',   submittedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, eventType:'Concert / live show', notes:'Electronic rock — we run backing tracks from Ableton. Need 2 IEM sends and a reliable monitor mix.' },
  { id:'r8', guest:'Jade Rivera',    bandName:'Solar Drift',         guestImg:'https://randomuser.me/api/portraits/women/33.jpg', property:'The Neon Stage',   propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-06-06', checkout:'2026-06-06', guests:310, total:7800, status:'pending',   submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, eventType:'Festival set', notes:'4-piece band, high energy. Full backline required. We have our own lighting director — will need a DMX port.' },
  { id:'r4', guest:'David Kim',      bandName:'Iron Circuit',        guestImg:'https://randomuser.me/api/portraits/men/21.jpg',  property:'The Neon Stage',    propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2025-11-10', checkout:'2025-11-10', guests:450, total:9800, status:'completed', submittedAt: new Date('2025-10-28').getTime() },
  { id:'r5', guest:'Sofia Morales',                                  guestImg:'https://randomuser.me/api/portraits/women/77.jpg',property:'Velvet Lounge',     propertyImg:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=60', checkin:'2025-12-20', checkout:'2025-12-20', guests:200, total:5200, status:'completed', submittedAt: new Date('2025-12-05').getTime() },
  { id:'r6',  guest:'Tom Bradley',          guestImg:'https://randomuser.me/api/portraits/men/68.jpg',   property:'Rooftop Sessions', propertyImg:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=120&q=60', checkin:'2026-02-28', checkout:'2026-02-28', guests:80,  total:2400, status:'cancelled', submittedAt: new Date('2026-02-10').getTime() },
  // Self-managed (host-generated) historical shows for earnings tracking
  { id:'hg1', guest:'The Wailers Revival',  guestImg:'', property:'The Neon Stage',   propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-01-15', checkout:'2026-01-15', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg2', guest:'Private Event',        guestImg:'', property:'Velvet Lounge',    propertyImg:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=60', checkin:'2026-01-28', checkout:'2026-01-28', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg3', guest:'Stereo Jungle',        guestImg:'', property:'The Neon Stage',   propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-02-10', checkout:'2026-02-10', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg4', guest:'Club Night',           guestImg:'', property:'The Neon Stage',   propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2026-02-22', checkout:'2026-02-22', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg5', guest:'Jazz Night',           guestImg:'', property:'Velvet Lounge',    propertyImg:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=60', checkin:'2026-03-08', checkout:'2026-03-08', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg6', guest:'DJ Catalyst',          guestImg:'', property:'The Neon Stage',   propertyImg:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=120&q=60', checkin:'2025-09-20', checkout:'2025-09-20', guests:0, total:0, status:'completed', hostGenerated:true },
  { id:'hg7', guest:'Acoustic Evening',     guestImg:'', property:'Velvet Lounge',    propertyImg:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=60', checkin:'2025-11-05', checkout:'2025-11-05', guests:0, total:0, status:'completed', hostGenerated:true },
];

const HOST_LISTINGS = [
  { id:'l1', title:'The Neon Stage',    location:'6801 Hollywood Blvd, Hollywood, CA 90028', img:'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400&q=70', price:2100, active:true,  capacity:500,  type:'clubs',    desc:'Iconic Hollywood venue with state-of-the-art sound and lights. A boutique 500-capacity club with impeccable acoustics, professional stage, full backline, and a dedicated green room.', amenities:['pro_sound','stage','stage_lights','bar','vip_area','green_room'] },
  { id:'l2', title:'Velvet Lounge',     location:'218 Bedford Ave, Brooklyn, NY 11249',       img:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70', price:1300, active:true,  capacity:200,  type:'jazz',     desc:'Intimate jazz club with incredible acoustics and cozy vibes. A beloved Brooklyn institution with a 200-capacity room, baby grand piano, and warm atmosphere.', amenities:['pro_sound','piano','bar','seated','accessibility'] },
  { id:'l3', title:'Rooftop Sessions',  location:'432 W 45th St, New York, NY 10036',          img:'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=70', price:3500, active:false, capacity:120,  type:'rooftops', desc:'Open-air rooftop with stunning skyline views and premium sound. A boutique 120-cap rooftop above Midtown Manhattan — perfect for album launches and private showcases.', amenities:['pro_sound','outdoor','rooftop','bar','vip_area','security'] },
];

// ─── SEEN-REQUEST TRACKING ────────────────────────────────────────────────────

let seenReqs;
try {
  seenReqs = new Set(JSON.parse(localStorage.getItem('bb_host_seen_reqs') || '[]'));
} catch(e) { seenReqs = new Set(); }

function markResSeen(id) {
  if (seenReqs.has(id)) return;
  seenReqs.add(id);
  try { localStorage.setItem('bb_host_seen_reqs', JSON.stringify([...seenReqs])); } catch(e) {}
  const badge = document.getElementById(`new-badge-${id}`);
  if (badge) badge.style.display = 'none';
  const sub = document.getElementById(`submitted-at-${id}`);
  if (sub) sub.style.display = '';
  document.getElementById(`res-row-${id}`)?.classList.remove('res-row-new');
}

const MESSAGES = [
  { id:'m1', from:'Emily Clarke',  fromImg:'https://randomuser.me/api/portraits/women/12.jpg', property:'The Neon Stage', lastMsg:'Can we do sound check from 4pm?', time:'10:23 AM', unread:true,
    thread:[
      { mine:false, text:'Hi! We are so excited for our show at The Neon Stage. Is it possible to start sound check earlier?', time:'10:20 AM' },
      { mine:false, text:'We would love to get in from 4pm if that works for you.', time:'10:21 AM' },
      { mine:true,  text:"Hi Emily! Let me check and get back to you shortly 🎸", time:'10:23 AM' },
    ]
  },
  { id:'m2', from:'Jake Morrison', fromImg:'https://randomuser.me/api/portraits/men/35.jpg', property:'Velvet Lounge', lastMsg:'Do you have a house grand piano?', time:'Yesterday', unread:true,
    thread:[
      { mine:false, text:'Hello! We are a jazz quartet and would love to know if there is a house grand piano available.', time:'Yesterday' },
    ]
  },
  { id:'m3', from:'Priya Nair',    fromImg:'https://randomuser.me/api/portraits/women/54.jpg', property:'Rooftop Sessions', lastMsg:'Looks amazing! Can we add an extra night?', time:'Mon', unread:true,
    thread:[
      { mine:false, text:'The rooftop looks absolutely incredible in the photos!', time:'Mon' },
      { mine:false, text:'We would love to add an extra night if there is availability on April 5th?', time:'Mon' },
    ]
  },
  { id:'m4', from:'David Kim',     fromImg:'https://randomuser.me/api/portraits/men/21.jpg', property:'The Neon Stage', lastMsg:'Best venue we have ever played. Thank you!', time:'Feb 14', unread:false,
    thread:[
      { mine:false, text:'Just wanted to say thank you for an incredible show night at The Neon Stage!', time:'Feb 14' },
      { mine:true,  text:"It was our pleasure David! You guys absolutely killed it 🤘", time:'Feb 14' },
    ]
  },
];

const REVIEWS_DATA = [
  { guest:'Emily Clarke', guestImg:'https://randomuser.me/api/portraits/women/12.jpg', rating:5, date:'February 2025', text:'The Neon Stage is everything we dreamed of. The sound system is world-class and the lighting rig is just stunning. Sarah was an amazing host — so responsive and professional.', property:'The Neon Stage', replied:false },
  { guest:'Jake Morrison', guestImg:'https://randomuser.me/api/portraits/men/35.jpg', rating:5, date:'January 2025', text:'Velvet Lounge is the perfect jazz club. The piano is in impeccable condition and the acoustics are incredible. Our audience was blown away by the intimacy of the space.', property:'Velvet Lounge', replied:true, reply:"Thank you Jake! Your quartet was phenomenal — hope to host you again soon! 🎷" },
  { guest:'Sofia Morales', guestImg:'https://randomuser.me/api/portraits/women/77.jpg', rating:4, date:'January 2025', text:'Great venue overall. Very professional setup and the views from the rooftop are incredible. WiFi dropped a couple of times during streaming but otherwise perfect.', property:'Rooftop Sessions', replied:true, reply:"Thank you Sofia! I have since upgraded the internet connection — should be solid now." },
  { guest:'David Kim', guestImg:'https://randomuser.me/api/portraits/men/21.jpg', rating:5, date:'February 2025', text:'One of the best venues we have ever performed at. The Neon Stage exceeded every expectation. Pristine, spacious, and the production quality is second to none. Highly recommend!', property:'The Neon Stage', replied:false },
];

// DATE_STATUSES: per-venue map  { venueId: { 'YYYY-MM-DD': 'pending' | 'booked' } }
// Always rebuilt from RESERVATIONS — never persisted.
let DATE_STATUSES = {};

// MANUAL_CAL_ENTRIES: host-set overrides with optional band name.
// Shape: { venueId: { 'YYYY-MM-DD': { status: 'pending'|'booked', bandName: '' } } }
// Persisted to localStorage separately from RESERVATIONS data.
let MANUAL_CAL_ENTRIES = {};

// Currently displayed venue in the calendar
let calVenueId = '';   // set in DOMContentLoaded once HOST_LISTINGS is available

// Tracks the status selected inside the open day popup
let _cdpStatus = null;

function loadDateStatuses() {
  localStorage.removeItem('gnv_calendar_v2'); // clear legacy data
  try {
    const saved = localStorage.getItem('gnv_manual_entries');
    if (saved) MANUAL_CAL_ENTRIES = JSON.parse(saved);
  } catch(e) {}
}

function saveDateStatuses() { /* DATE_STATUSES is rebuilt each load — no persistence needed */ }

function saveManualEntries() {
  localStorage.setItem('gnv_manual_entries', JSON.stringify(MANUAL_CAL_ENTRIES));
}

// Returns merged status map: RESERVATIONS take priority over manual overrides.
// Manual entries that have a backing reservation are excluded — DATE_STATUSES handles those.
// Blocked status always wins.
function getVenueStatuses() {
  const manual = {};
  Object.entries(MANUAL_CAL_ENTRIES[calVenueId] || {}).forEach(([iso, e]) => {
    if (!e.reservationId) manual[iso] = e.status;
  });
  const merged = { ...manual, ...(DATE_STATUSES[calVenueId] || {}) };
  // Blocked overrides everything
  Object.entries(MANUAL_CAL_ENTRIES[calVenueId] || {}).forEach(([iso, e]) => {
    if (e.status === 'blocked') merged[iso] = 'blocked';
  });
  return merged;
}

// Iterate every date in [checkin, checkout] inclusive and call fn(iso)
// Dates are parsed as LOCAL dates (not UTC) to avoid timezone off-by-one shifts.
function eachDateInRange(checkin, checkout, fn) {
  const [ey, em, ed] = checkout.split('-').map(Number);
  const end = new Date(ey, em - 1, ed);
  const [sy, sm, sd] = checkin.split('-').map(Number);
  for (let d = new Date(sy, sm - 1, sd); ; d.setDate(d.getDate() + 1)) {
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    fn(iso);
    if (d >= end) break;
  }
}

// Rebuild DATE_STATUSES per venue from RESERVATIONS.
// Mapping: r.property (title string) → HOST_LISTINGS id
//   confirmed / completed  →  booked   (highest priority)
//   pending                →  pending  (only if not already booked for that venue)
//   cancelled              →  available (not stored)
function syncCalendarFromBookings() {
  // Build title → id lookup
  const titleToId = {};
  HOST_LISTINGS.forEach(l => { titleToId[l.title] = l.id; });

  // Start with an empty map for every known venue
  const next = {};
  HOST_LISTINGS.forEach(l => { next[l.id] = {}; });

  RESERVATIONS.forEach(r => {
    if (r.status === 'confirmed' || r.status === 'completed') {
      const vid = titleToId[r.property];
      if (!vid) return;
      eachDateInRange(r.checkin, r.checkout, iso => { next[vid][iso] = 'booked'; });
    }
  });
  RESERVATIONS.forEach(r => {
    if (r.status === 'pending') {
      const vid = titleToId[r.property];
      if (!vid) return;
      eachDateInRange(r.checkin, r.checkout, iso => {
        if (!next[vid][iso]) next[vid][iso] = 'pending';
      });
    }
  });

  DATE_STATUSES = next;
  saveDateStatuses();
  publishPublicCalendars();
}

// Publishes a stripped-down { iso: 'booked'|'pending' } map for each venue
// to localStorage so the Artist Dashboard and Browse Venues can read it
// without exposing any private host data.
function publishPublicCalendars() {
  HOST_LISTINGS.forEach(l => {
    const manual = {};
    Object.entries(MANUAL_CAL_ENTRIES[l.id] || {}).forEach(([iso, e]) => {
      if (!e.reservationId) {
        // If host opted to show the act name publicly, publish an object; otherwise just the status string
        manual[iso] = (e.publicAct && e.bandName) ? { status: e.status, actName: e.bandName } : e.status;
      }
    });
    const merged = { ...manual, ...(DATE_STATUSES[l.id] || {}) };
    try {
      localStorage.setItem(`bb_pub_cal_${l.id}`, JSON.stringify(merged));
    } catch(e) {}
  });
}

const _firstUpcoming = RESERVATIONS
  .filter(r => r.status === 'pending' || r.status === 'confirmed')
  .map(r => r.checkin).sort()[0];
const _calInit = _firstUpcoming ? new Date(_firstUpcoming + 'T00:00:00') : new Date();
let calYear = _calInit.getFullYear(), calMonth = _calInit.getMonth();

// ─── CALENDAR VENUE TABS ──────────────────────────────────────────────────────

function renderCalVenueTabs() {
  const el = document.getElementById('calVenueTabs');
  if (!el) return;
  el.innerHTML = HOST_LISTINGS.map(l => `
    <button class="cal-venue-tab${l.id === calVenueId ? ' active' : ''}"
            onclick="switchCalVenue('${l.id}')">
      <span class="cal-venue-tab-name">${l.title}</span>
      ${!l.active ? '<span class="cal-venue-unlisted">Unlisted</span>' : ''}
    </button>`).join('');
}

function switchCalVenue(id) {
  calVenueId = id;
  renderCalVenueTabs();
  renderCalendar();
}

function openVenueCalendar(id) {
  calVenueId = id;
  navigate(null, 'calendar');
  renderCalVenueTabs();
  renderCalendar();
}

function goToCalendarDate(rid) {
  const r = RESERVATIONS.find(x => x.id === rid);
  if (!r) return;
  const venue = HOST_LISTINGS.find(l => l.title === r.property);
  if (!venue) return;
  const [y, m] = r.checkin.split('-').map(Number);
  calVenueId = venue.id;
  calYear  = y;
  calMonth = m - 1;
  navigate(null, 'calendar');
  renderCalVenueTabs();
  renderCalendar();
}

// ─── AUTO-COMPLETE RESERVATIONS ───────────────────────────────────────────────

function autoCompleteReservations() {
  // Confirmed bookings no longer auto-complete on date. Hosts explicitly mark
  // them as played off via the "Mark as played off" button, which triggers the
  // 24-hour deposit release. Only bookings already marked (playedOffAt set) are
  // considered complete.
}

// ─── PUBLIC LISTING SYNC ──────────────────────────────────────────────────────

// Writes HOST_LISTINGS to localStorage so the public Browse Venues page can read
// and reflect any price, capacity, description, or active-status changes in real time.
function saveHostListings() {
  try {
    const hostUser = Auth.currentUser();
    const hostName      = hostUser ? `${hostUser.firstName} ${hostUser.lastName}`.trim() : '';
    const hostImg       = hostUser ? (hostUser.avatar     || '') : '';
    const hostEmail     = hostUser ? (hostUser.email      || '') : '';
    const hostPhone     = hostUser ? (hostUser.phone      || '') : '';
    const hostShowEmail = hostUser ? !!hostUser.showEmail : false;
    const hostShowPhone = hostUser ? !!hostUser.showPhone : false;
    const data = HOST_LISTINGS.map(l => ({ ...l, hostName, hostImg, hostEmail, hostPhone, hostShowEmail, hostShowPhone }));
    localStorage.setItem('bb_host_listings', JSON.stringify(data));
  } catch(e) {}
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Restore persisted venue listed/unlisted states
  try {
    const saved = localStorage.getItem('gnv_venue_active');
    if (saved) {
      const map = JSON.parse(saved);
      HOST_LISTINGS.forEach(l => { if (map[l.id] !== undefined) l.active = map[l.id]; });
    }
  } catch(e) {}

  // Ingest artist-submitted booking requests from the queue
  try {
    const rawQueue = JSON.parse(localStorage.getItem('bb_host_pending_requests') || '[]');
    // Deduplicate the queue itself: keep only the first entry per guest+property+date
    const seen = new Set();
    const queue = rawQueue.filter(n => {
      const key = `${n.guest}|${n.property}|${n.checkin}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (queue.length !== rawQueue.length) {
      try { localStorage.setItem('bb_host_pending_requests', JSON.stringify(queue)); } catch(e) {}
    }
    queue.forEach(n => {
      if (RESERVATIONS.find(r => r.id === n.id)) return; // already present by id
      // Skip if a non-cancelled entry already exists for same guest + property + date
      const dupExists = RESERVATIONS.find(r =>
        r.guest    === n.guest    &&
        r.property === n.property &&
        r.checkin  === n.checkin  &&
        r.status   !== 'cancelled'
      );
      if (dupExists) return;
      RESERVATIONS.push({
        id:          n.id,
        guest:       n.guest,
        bandName:    n.bandName || '',
        guestImg:    n.guestImg || 'https://api.dicebear.com/7.x/initials/svg?seed=Artist&backgroundColor=FF2D78&textColor=ffffff',
        property:    n.property,
        propertyImg: n.propertyImg,
        checkin:     n.checkin,
        checkout:    n.checkout,
        guests:      n.guests || 0,
        total:       n.total  || 0,
        status:      'pending',
        isNew:       true,
        submittedAt: n.submittedAt,
        eventType:   n.eventType || '',
        notes:       n.notes    || '',
      });
    });
  } catch(e) {}

  // Inject any cancellation notifications sent by artists
  try {
    const notifs = JSON.parse(localStorage.getItem('bb_host_notifications') || '[]');
    notifs.forEach(n => {
      if (MESSAGES.find(m => m.id === n.id)) return;
      MESSAGES.unshift({
        id:       n.id,
        from:     n.artistName,
        fromImg:  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(n.artistName)}&backgroundColor=555555&textColor=ffffff`,
        venue:    n.venueName,
        lastMsg:  `Cancelled booking request for ${n.dates} (${n.eventType})`,
        time:     'Just now',
        unread:   true,
        thread:   [{ mine:false, text:`Hi, I'm writing to let you know that I've cancelled my booking request for ${n.dates} (${n.eventType}) at ${n.venueName}. Sorry for any inconvenience.`, time:'Just now' }],
      });
    });
    localStorage.removeItem('bb_host_notifications');
  } catch(e) {}

  saveHostListings(); // publish venues to the public Browse Venues page
  calVenueId = HOST_LISTINGS[0]?.id || '';
  loadDateStatuses();
  seedManualEarnings();
  autoCompleteReservations();
  syncCalendarFromBookings();
  populateSidebarUser();
  populateTopbarAvatar();
  renderOverview();
  renderReservations('pending');
  renderListingsManager();
  renderCalVenueTabs();
  renderCalendar();
  renderMessages();
  const _initUnread = MESSAGES.filter(m => m.unread).length;
  document.getElementById('topbarMsgBadge').textContent = _initUnread || '';
  renderEarnings();
  renderReviews();
  populateProfile();
  checkPlayedOffNotifications();
  // Seed the initial history entry so the back button stays inside the dashboard
  history.replaceState({ section: _currentSection }, '', `?section=${_currentSection}`);
});

// ─── HELP MENU ────────────────────────────────────────────────────────────────

function toggleHelpMenu(e) {
  e.stopPropagation();
  document.getElementById('helpDropdown').classList.toggle('hidden');
}
document.addEventListener('click', () => {
  document.getElementById('helpDropdown')?.classList.add('hidden');
});

// ─── USER UI ─────────────────────────────────────────────────────────────────

function populateSidebarUser() {
  document.getElementById('sidebarUser').innerHTML = `
    <img src="${user.avatar}" alt="${user.firstName}" class="sidebar-user-avatar"
         onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}${user.lastName}'"/>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${user.firstName} ${user.lastName}</div>
      <div class="sidebar-user-email">${user.email}</div>
    </div>
  `;
}

function populateTopbarAvatar() {
  const wrap = document.getElementById('topbarAvatar');
  wrap.innerHTML = `<img src="${user.avatar}" alt="${user.firstName}"
    onerror="this.style.background='#FF2D78'" style="width:100%;height:100%;object-fit:cover"/>`;
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

let _currentSection = 'overview';
let _poppingState   = false;

function navigate(e, section) {
  if (e) { e.preventDefault(); }
  closeResDrawer();
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  const link = document.querySelector(`.sidebar-link[data-section="${section}"]`);
  if (link) link.classList.add('active');
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

function updateConfirmedTabBadge() {
  const btn = document.getElementById('confirmedTabBtn');
  if (!btn) return;
  const now = new Date(); now.setHours(0,0,0,0);
  const count = RESERVATIONS.filter(r => r.status === 'confirmed' && !r.hostGenerated && new Date(r.checkin + 'T00:00:00') < now).length;
  const existing = btn.querySelector('.confirm-tab-badge');
  if (existing) existing.remove();
  if (count > 0) {
    const badge = document.createElement('span');
    badge.className = 'confirm-tab-badge';
    badge.textContent = count;
    btn.appendChild(badge);
  }
}

function renderOverview() {
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('overviewGreeting').textContent = `${greet}, ${user.firstName}!`;
  document.getElementById('overviewDate').textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  updateConfirmedTabBadge();
  renderActionItems();

  document.getElementById('checkinList').innerHTML = RESERVATIONS.filter(r => r.status === 'confirmed').slice(0,3).map(r => {
    const d = new Date(r.checkin);
    const label = d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return `
      <div class="checkin-item">
        <img src="${r.propertyImg}" alt="" class="checkin-img" onerror="this.style.background='#1C1C1C'"/>
        <div class="checkin-info"><strong>${r.guest}</strong><span>${r.property} · ${r.guests.toLocaleString()} guests</span></div>
        <div class="checkin-date">${label}<small>Check-in</small></div>
      </div>`;
  }).join('');

  renderEarningsChart('earningsChart');
  renderVenueConfirmedCards();
  const _pendingUniqueDates = new Set(RESERVATIONS.filter(r=>r.status==='pending').map(r=>r.checkin)).size;
  document.getElementById('resBadge').textContent = _pendingUniqueDates || '';
}

function goToConfirmedTab() {
  navigate(null, 'reservations');
  document.querySelectorAll('#resTabs .filter-tab').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('onclick').includes("'confirmed'")) t.classList.add('active');
  });
  currentResFilter = 'confirmed';
  renderReservations('confirmed');
}

function renderVenueConfirmedCards() {
  const now    = Date.now();
  const cutoff = 48 * 60 * 60 * 1000;
  const activeCount = HOST_LISTINGS.filter(l => l.active).length;

  const venueCards = HOST_LISTINGS.map(l => {
    const venueConfirmed = RESERVATIONS.filter(r => r.status === 'confirmed' && r.property === l.title);
    const newCount = venueConfirmed.filter(r => r.confirmedAt && (now - r.confirmedAt) < cutoff).length;
    return `
      <div class="venue-confirmed-card stat-card-link" onclick="goToConfirmedTab()">
        <div class="venue-confirmed-name">${l.title}</div>
        <div class="venue-confirmed-count">${venueConfirmed.length}</div>
        <div class="venue-confirmed-label">Confirmed bookings${newCount ? ` <span class="venue-confirmed-badge venue-confirmed-new">${newCount} New</span>` : ''}</div>
      </div>`;
  }).join('');

  const activeCard = `
    <div class="venue-confirmed-card stat-card-link" onclick="navigate(null,'listings')">
      <div class="venue-confirmed-name">Active Venues</div>
      <div class="venue-confirmed-count" id="statActiveVenues">${activeCount}</div>
      <div class="venue-confirmed-label">Listed venues <span class="venue-confirmed-badge venue-confirmed-total" id="statActiveVenueDelta">of ${HOST_LISTINGS.length} total</span></div>
    </div>`;

  document.getElementById('venueConfirmedCards').innerHTML = venueCards + activeCard;
}

function renderActionItems() {
  const unlisted    = HOST_LISTINGS.filter(l => !l.active);
  const unreadMsgs  = MESSAGES.filter(m => m.unread).length;
  const pendingCount = RESERVATIONS.filter(r => r.status === 'pending').length;
  const now = new Date(); now.setHours(0,0,0,0);
  const playedOffDue = RESERVATIONS.filter(r =>
    r.status === 'confirmed' && !r.hostGenerated && new Date(r.checkin + 'T00:00:00') < now
  );
  const items = [
    ...(unreadMsgs > 0 ? [{ icon:'📥', cls:'orange', title:`${unreadMsgs} new message${unreadMsgs !== 1 ? 's' : ''}`, sub:'Respond within 24 hours to maintain your response rate', onclick:`navigate(null,'messages')` }] : []),
    ...unlisted.map(l => {
      const activeBookings = RESERVATIONS.filter(r => r.property === l.title && (r.status === 'pending' || r.status === 'confirmed')).length;
      return { icon:'🔇', cls:'red', title:`${l.title} is unlisted`, sub: activeBookings ? `Hidden from new searches — ${activeBookings} active booking${activeBookings!==1?'s':''} unaffected` : 'Hidden from new searches — no active bookings', onclick:`navigate(null,'listings')` };
    }),
    ...(pendingCount > 0 ? [{ icon:'✅', cls:'blue', title:`${pendingCount} booking request${pendingCount !== 1 ? 's' : ''}`, sub:'Awaiting your approval in the Bookings tab', onclick:`goToBooking(null,'pending')` }] : []),
    ...playedOffDue.map(r => ({ icon:'🎤', cls:'green', title:`Confirm show played: ${r.bandName || r.guest} at ${r.property}`, sub:`Tap to release your $${Math.round(r.total*0.20).toLocaleString()} deposit — funds transfer within 24 hours`, onclick:`markPlayedOff('${r.id}')` })),
  ];
  document.getElementById('actionItems').innerHTML = items.map(a => `
    <div class="action-item" onclick="${a.onclick}">
      <div class="action-icon ${a.cls}">${a.icon}</div>
      <div class="action-body"><strong>${a.title}</strong><span>${a.sub}</span></div>
      <span class="action-chevron">›</span>
    </div>
  `).join('');
}

function renderEarningsChart(canvasId) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const vals = [6300,9000,1800,0,0,0,0,0,0,0,0,0]; // Jan–Mar 2026 actuals
  const max = Math.max(...vals.filter(v=>v>0)) || 1;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const wrap = document.createElement('div');
  wrap.className = 'chart-bars';
  months.forEach((m,i) => {
    const pct = vals[i] ? (vals[i]/max)*100 : 4;
    const future = vals[i] === 0;
    const bw = document.createElement('div');
    bw.className = 'chart-bar-wrap';
    bw.innerHTML = `
      <div class="chart-bar" style="height:${pct}%;background:${future?'rgba(255,255,255,0.05)':'rgba(255,45,120,0.25)'}"
           title="${future?'No data':'$'+vals[i].toLocaleString()}"></div>
      <div class="chart-bar-label">${m}</div>`;
    bw.querySelector('.chart-bar').addEventListener('mouseenter', function(){
      if(!future) this.style.background='#FF2D78';
    });
    bw.querySelector('.chart-bar').addEventListener('mouseleave', function(){
      if(!future) this.style.background='rgba(255,45,120,0.25)';
    });
    wrap.appendChild(bw);
  });
  canvas.parentNode.replaceChild(wrap, canvas);
}

function updateChart() { /* placeholder */ }

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────

let currentResFilter = 'pending';

// Per-venue priority order for pending bookings.
// Shape: { 'Venue Name': ['r1', 'r3', ...], ... }
// Rankings are independent per venue — cross-venue reordering is not allowed.
let pendingOrder = {};

function initPendingOrder() {
  const pending = RESERVATIONS.filter(r => r.status === 'pending');
  const venues  = [...new Set(pending.map(r => r.property))];

  // Remove venues with no pending bookings
  Object.keys(pendingOrder).forEach(v => { if (!venues.includes(v)) delete pendingOrder[v]; });

  venues.forEach(venue => {
    const ids = pending.filter(r => r.property === venue).map(r => r.id);
    if (!pendingOrder[venue]) pendingOrder[venue] = [];
    // Preserve existing order; append any new IDs not yet ranked
    pendingOrder[venue] = pendingOrder[venue].filter(id => ids.includes(id));
    ids.forEach(id => { if (!pendingOrder[venue].includes(id)) pendingOrder[venue].push(id); });
  });
}

// Returns 1-based rank of id within its venue group, or null
function getPendingRank(id) {
  for (const ids of Object.values(pendingOrder)) {
    const i = ids.indexOf(id);
    if (i !== -1) return i + 1;
  }
  return null;
}

// Returns the ordered ID list for a venue
function getVenueOrder(venue) { return pendingOrder[venue] || []; }

// Returns true if r overlaps dates with any other pending booking at the same venue
function hasPendingConflict(r) {
  return RESERVATIONS.some(x =>
    x.id !== r.id &&
    x.status === 'pending' &&
    x.property === r.property &&
    r.checkin <= x.checkout &&
    x.checkin <= r.checkout
  );
}

// Drag-and-drop state — drags are only valid within the same venue group
let _dragId   = null;
let _dragOver = null;

function _venueOfId(id) {
  return Object.keys(pendingOrder).find(v => pendingOrder[v].includes(id)) || null;
}

function _dateOfId(id) {
  return RESERVATIONS.find(x => x.id === id)?.checkin || null;
}

function resDragStart(e, id) {
  _dragId = id;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    const el = document.getElementById(`res-row-${id}`);
    if (el) el.classList.add('res-row-dragging');
  }, 0);
}

function resDragOver(e, id) {
  e.preventDefault();
  // Only allow drop if same venue and same date
  if (_venueOfId(id) !== _venueOfId(_dragId) || _dateOfId(id) !== _dateOfId(_dragId)) {
    e.dataTransfer.dropEffect = 'none';
    return;
  }
  e.dataTransfer.dropEffect = 'move';
  if (_dragOver !== id) {
    document.querySelectorAll('.res-row-drag-over').forEach(el => el.classList.remove('res-row-drag-over'));
    _dragOver = id;
    const el = document.getElementById(`res-row-${id}`);
    if (el && id !== _dragId) el.classList.add('res-row-drag-over');
  }
}

function resDrop(e, targetId) {
  e.preventDefault();
  if (!_dragId || _dragId === targetId) return;
  const venue = _venueOfId(_dragId);
  if (!venue || venue !== _venueOfId(targetId)) return; // cross-venue drop blocked
  if (_dateOfId(_dragId) !== _dateOfId(targetId)) return; // cross-date drop blocked
  const ids  = pendingOrder[venue];
  const from = ids.indexOf(_dragId);
  const to   = ids.indexOf(targetId);
  if (from === -1 || to === -1) return;
  ids.splice(from, 1);
  ids.splice(to, 0, _dragId);
  resDragEnd();
  renderReservations('pending');
}

function resDragEnd() {
  document.querySelectorAll('.res-row-dragging, .res-row-drag-over')
    .forEach(el => el.classList.remove('res-row-dragging', 'res-row-drag-over'));
  _dragId   = null;
  _dragOver = null;
}

// Move a booking up (-1) or down (+1) within its same-date conflict group
function movePendingRank(id, dir) {
  const venue = _venueOfId(id);
  if (!venue) return;
  const r = RESERVATIONS.find(x => x.id === id);
  if (!r) return;
  const ids = pendingOrder[venue];
  // Only consider IDs sharing the same date
  const dateGroup = ids.filter(oid => {
    const x = RESERVATIONS.find(rx => rx.id === oid);
    return x && x.checkin === r.checkin;
  });
  const groupIdx = dateGroup.indexOf(id);
  const newGroupIdx = groupIdx + dir;
  if (newGroupIdx < 0 || newGroupIdx >= dateGroup.length) return;
  // Swap in the full pendingOrder array
  const fullI = ids.indexOf(id);
  const fullJ = ids.indexOf(dateGroup[newGroupIdx]);
  [ids[fullI], ids[fullJ]] = [ids[fullJ], ids[fullI]];
  renderReservations('pending');
}

function filterRes(e, status) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  currentResFilter = status;
  renderReservations(status);
}

// ─── BOOKING NOTES (private to host) ──────────────────────────────────────────

const _NOTES_KEY = 'gnv_booking_notes';

function getBookingNote(resId) {
  try { return (JSON.parse(localStorage.getItem(_NOTES_KEY) || '{}'))[resId] || null; } catch(e) { return null; }
}

function saveBookingNote(resId, text, tags) {
  try {
    const all = JSON.parse(localStorage.getItem(_NOTES_KEY) || '{}');
    if (!text && (!tags || !tags.length)) { delete all[resId]; }
    else { all[resId] = { text: text.trim(), tags: tags || [], updatedAt: Date.now() }; }
    localStorage.setItem(_NOTES_KEY, JSON.stringify(all));
  } catch(e) {}
}

let _noteResId = null;
const NOTE_TAGS = ['★ Rebook','👍 Great show','⚠️ Avoid','🔧 PA issue','⏰ Late','🎵 Crowd loved it','📋 Contract issue'];

function openNoteModal(resId) {
  _noteResId = resId;
  const r    = RESERVATIONS.find(x => x.id === resId);
  const note = getBookingNote(resId);
  document.getElementById('noteModalSubtitle').textContent =
    r ? `${r.guest}${r.bandName?' / '+r.bandName:''} · ${fmt(r.checkin)} · ${r.property}` : '';
  document.getElementById('noteModalText').value = note?.text || '';
  const tagContainer = document.getElementById('noteModalTags');
  tagContainer.innerHTML = NOTE_TAGS.map(tag => `
    <button type="button" class="note-tag-btn${note?.tags?.includes(tag) ? ' note-tag-active' : ''}"
            onclick="this.classList.toggle('note-tag-active')">${tag}</button>`).join('');
  document.getElementById('noteModalOverlay').classList.remove('hidden');
  document.getElementById('noteModal').classList.remove('hidden');
}

function closeNoteModal() {
  document.getElementById('noteModalOverlay').classList.add('hidden');
  document.getElementById('noteModal').classList.add('hidden');
  _noteResId = null;
}

function saveNoteModal() {
  const text = document.getElementById('noteModalText').value;
  const tags = [...document.querySelectorAll('.note-tag-btn.note-tag-active')].map(b => b.textContent.trim());
  saveBookingNote(_noteResId, text, tags);
  closeNoteModal();
  renderReservations(currentResFilter);
  showDash('Note saved.');
}

function clearNoteModal() {
  saveBookingNote(_noteResId, '', []);
  closeNoteModal();
  renderReservations(currentResFilter);
  showDash('Note cleared.');
}

function renderReservations(status) {
  const isPending = status === 'pending';
  const cols = isPending ? 9 : 7;
  const thead = document.querySelector('#resTable thead tr');
  if (thead) {
    thead.innerHTML = isPending
      ? `<th class="rank-th">Hold Priority</th><th>Contact</th><th>Act</th><th>Date</th><th>Fans</th><th>Total</th><th>Status</th><th></th>`
      : `<th>Contact</th><th>Act</th><th>Date</th><th>Fans</th><th>Total</th><th>Status</th><th></th>`;
  }

  const tbody = document.getElementById('resTableBody');

  if (!isPending) {
    // ── Non-pending tabs: grouped by venue, dates descending ─────────────────
    const allRows      = RESERVATIONS.filter(r => r.status === status);
    const rows         = status === 'cancelled' ? allRows.filter(r => !r.archived) : allRows;
    const archivedRows = status === 'cancelled' ? allRows.filter(r =>  r.archived) : [];
    if (!rows.length && !archivedRows.length) {
      tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:40px;color:var(--text-muted)">No ${status} bookings</td></tr>`;
      return;
    }

    // Group by venue, preserving HOST_LISTINGS order
    const venueOrder = HOST_LISTINGS.map(l => l.title);
    const groups = {};
    rows.forEach(r => {
      if (!groups[r.property]) groups[r.property] = [];
      groups[r.property].push(r);
    });
    // Sort each group by checkin descending
    Object.values(groups).forEach(g => g.sort((a, b) => a.checkin.localeCompare(b.checkin)));

    const orderedVenues = venueOrder.filter(v => groups[v]).concat(
      Object.keys(groups).filter(v => !venueOrder.includes(v))
    );

    let html = '';
    orderedVenues.forEach(venue => {
      const venueRows = groups[venue];
      const label = status === 'confirmed' ? 'confirmed booking' : status === 'completed' ? 'completed booking' : 'cancelled booking';
      html += `
        <tr class="venue-group-header">
          <td colspan="${cols}">
            <div class="venue-group-header-inner">
              <span class="venue-group-name">${venue}</span>
              <span class="venue-group-count">${venueRows.length} ${label}${venueRows.length > 1 ? 's' : ''}</span>
            </div>
          </td>
        </tr>`;
      venueRows.forEach(r => { html += resRow(r, false); });
    });

    tbody.innerHTML = html;
    if (archivedRows.length) {
      tbody.innerHTML += `
        <tr class="archived-toggle-row">
          <td colspan="${cols}">
            <button class="archived-toggle-btn" id="archivedToggleBtn" onclick="toggleArchivedResRows()">
              ▸ Archived (${archivedRows.length})
            </button>
          </td>
        </tr>
        ${archivedRows.map(r => resRow(r, false)).join('')}`;
      document.querySelectorAll('.archived-entry').forEach(r => r.style.display = 'none');
    }
    return;
  }

  // ── Pending tab: grouped by venue, ranked independently per venue ─────────
  initPendingOrder();
  const venues = Object.keys(pendingOrder).filter(v => pendingOrder[v].length > 0);

  if (!venues.length) {
    tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:40px;color:var(--text-muted)">No pending bookings</td></tr>`;
    return;
  }

  let html = '';
  venues.forEach(venue => {
    const ids      = pendingOrder[venue];
    const venueRows = ids.map(id => RESERVATIONS.find(r => r.id === id)).filter(Boolean);
    const venueHasConflict = venueRows.some(r => hasPendingConflict(r));

    // Venue group header
    html += `
      <tr class="venue-group-header">
        <td colspan="${cols}">
          <div class="venue-group-header-inner">
            <span class="venue-group-name">${venue}</span>
            ${venueHasConflict ? `<span class="venue-priority-note">Drag or use arrows to set priority</span>` : ''}
            <span class="venue-group-count">${venueRows.length} pending request${venueRows.length>1?'s':''}</span>
          </div>
        </td>
      </tr>`;

    // Group rows by date descending, preserving pendingOrder within each date
    const byDate = {};
    venueRows.forEach(r => {
      if (!byDate[r.checkin]) byDate[r.checkin] = [];
      byDate[r.checkin].push(r);
    });
    const sortedDates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));
    sortedDates.forEach(date => {
      const dateRows = byDate[date];
      const isConflictGroup = dateRows.length > 1;
      dateRows.forEach((r, idx) => {
        const rank    = isConflictGroup ? idx + 1 : null;
        const isFirst = idx === 0;
        const isLast  = idx === dateRows.length - 1;
        html += resRow(r, true, rank, isFirst, isLast, isConflictGroup, isConflictGroup);
      });
    });
  });

  tbody.innerHTML = html;
}

// Builds a single <tr> string for a reservation row
function resRow(r, isPending, rank, isFirst, isLast, conflict, showDragHandle, isArchived = false) {
  const isNew = !seenReqs.has(r.id) && r.status === 'pending';
  const rankCell = isPending ? `
    <td class="rank-td">
      ${showDragHandle ? `
      <div class="rank-badge rank-${Math.min(rank,4)}">${rank}</div>
      <div class="rank-arrows">
        <button class="rank-arrow" onclick="movePendingRank('${r.id}',-1)" ${isFirst?'disabled':''} title="Move up">↑</button>
        <button class="rank-arrow" onclick="movePendingRank('${r.id}',1)"  ${isLast?'disabled':''} title="Move down">↓</button>
      </div>` : ''}
    </td>` : '';

  const dragAttrs = (isPending && showDragHandle)
    ? `draggable="true"
       ondragstart="resDragStart(event,'${r.id}')"
       ondragover="resDragOver(event,'${r.id}')"
       ondrop="resDrop(event,'${r.id}')"
       ondragend="resDragEnd()"` : '';

  const venueCell = '';

  return `
    <tr id="res-row-${r.id}" class="res-row${isPending?' res-row-pending':''}${isNew?' res-row-new':''}${isArchived?' archived-entry':''}" onclick="markResSeen('${r.id}')" ${dragAttrs}>
      ${rankCell}
      <td>
        <div class="guest-cell">
          ${showDragHandle ? `<span class="drag-handle" title="Drag to reorder within this venue">⠿</span>` : ''}
          <img src="${r.guestImg}" alt="" class="contact-clickable" onclick="openContactPopup(event,'${r.id}')" onerror="this.style.background='#1C1C1C'"/>
          <div>
            <div class="contact-clickable" style="font-weight:600" onclick="openContactPopup(event,'${r.id}')">${r.guest}</div>
            ${isNew ? `<span class="new-req-badge" id="new-badge-${r.id}">New · Submitted ${r.submittedAt ? fmtTs(r.submittedAt) : ''}</span>` : ''}
            ${r.submittedAt ? `<span class="submitted-at-text" id="submitted-at-${r.id}"${isNew ? ' style="display:none"' : ''}>Submitted ${fmtTs(r.submittedAt)}</span>` : ''}
            ${r.hostGenerated ? `<span class="host-gen-badge">Host added</span>` : ''}
            ${isPending ? renderReliabilityBadge(r.guest) : ''}
            ${conflict ? `<span class="conflict-badge">⚠ hold priority</span>` : ''}
            ${r.removedFromCalendar ? `<span class="conflict-badge">Removed from Calendar</span>` : ''}
            ${!isPending && r.status === 'cancelled' && !r.removedFromCalendar && RESERVATIONS.some(x => x.id !== r.id && (x.status === 'confirmed' || x.status === 'completed') && x.property === r.property && x.checkin === r.checkin) ? `<span class="conflict-badge">date booked · higher hold priority</span>` : ''}
          </div>
        </div>
      </td>
      <td class="contact-clickable act-cell" onclick="openContactPopup(event,'${r.id}')" style="color:var(--text-sec)">${r.bandName || '<span style="color:var(--text-muted);font-style:italic">—</span>'}</td>
      ${venueCell}
      <td><span class="date-cal-link" onclick="event.stopPropagation();goToCalendarDate('${r.id}')">${fmt(r.checkin)}</span></td>
      <td>${r.guests.toLocaleString()}</td>
      <td>$${r.total.toLocaleString()}</td>
      <td>
        ${r.status === 'confirmed' && !r.hostGenerated ? `<div style="font-size:11px;margin-bottom:4px">${r.paymentStatus === 'paid' ? '<span style="color:#10B981">● Payment received</span>' : '<span style="color:#F59E0B">● Awaiting payment</span>'}</div>` : ''}
        <select class="res-status-select status-${r.status}" onchange="changeResStatus('${r.id}', this.value)">
          <option value="pending"    ${r.status==='pending'   ?'selected':''}>Pending</option>
          <option value="confirmed"  ${r.status==='confirmed' ?'selected':''}>Confirmed</option>
          <option value="completed"  ${r.status==='completed' ?'selected':''}>Completed</option>
          <option value="cancelled"  ${r.status==='cancelled' ?'selected':''}>Cancelled</option>
        </select>
      </td>
      <td>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
          <button class="res-action-btn" onclick="viewRes('${r.id}')">Details</button>
          ${(()=>{ const sd=new Date(r.checkin+'T00:00:00'),td=new Date();td.setHours(0,0,0,0); return r.status==='confirmed'&&!r.hostGenerated&&sd<td?`<button class="res-action-btn confirm-played-btn" onclick="markPlayedOff('${r.id}')">✓ Confirm played</button>`:''; })()}
          ${r.status === 'cancelled' && !r.archived ? `<button class="res-action-btn req-archive-btn" onclick="archiveReservation('${r.id}')">Archive</button>` : ''}
          ${r.archived ? `<button class="res-action-btn req-archive-btn" onclick="unarchiveReservation('${r.id}')">Unarchive</button>` : ''}
          ${(() => { const n = getBookingNote(r.id); return `<button class="res-action-btn${n ? ' res-note-active' : ''}" onclick="openNoteModal('${r.id}')" title="Private note">${n ? '📝 Note ·' + (n.tags?.length ? ' ' + n.tags[0] : '') : '+ Note'}</button>`; })()}
        </div>
      </td>
    </tr>`;
}

function changeResStatus(id, newStatus) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (!r || r.status === newStatus) return;
  const old = r.status;
  r.status = newStatus;
  // Keep per-venue pendingOrder in sync
  if (newStatus === 'pending') {
    if (!pendingOrder[r.property]) pendingOrder[r.property] = [];
    if (!pendingOrder[r.property].includes(id)) pendingOrder[r.property].push(id);
  } else {
    const venue = _venueOfId(id);
    if (venue) {
      pendingOrder[venue] = pendingOrder[venue].filter(x => x !== id);
      if (!pendingOrder[venue].length) delete pendingOrder[venue];
    }
  }

  if (newStatus === 'confirmed') {
    r.confirmedAt    = Date.now();
    r.paymentStatus  = 'unpaid';
    r.paymentDeadline = Date.now() + 48 * 3600 * 1000;
    // Write approval to localStorage so the artist's dashboard can pick it up
    try {
      const approvals = JSON.parse(localStorage.getItem('gnv_approvals') || '[]');
      const existing  = approvals.findIndex(a => a.id === r.id);
      const entry     = { id: r.id, paymentStatus: 'unpaid', paymentDeadline: r.paymentDeadline };
      if (existing >= 0) approvals[existing] = entry; else approvals.push(entry);
      localStorage.setItem('gnv_approvals', JSON.stringify(approvals));
    } catch(e) {}
  }

  // When confirming, auto-cancel all other pending requests at the same date + venue
  if (newStatus === 'confirmed') {
    RESERVATIONS.forEach(x => {
      if (x.id !== id && x.status === 'pending' && x.property === r.property && x.checkin === r.checkin) {
        x.status = 'cancelled';
        if (pendingOrder[x.property]) {
          pendingOrder[x.property] = pendingOrder[x.property].filter(pid => pid !== x.id);
          if (!pendingOrder[x.property].length) delete pendingOrder[x.property];
        }
      }
    });
  }
  syncCalendarFromBookings();
  renderCalendar();
  const labels = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
  const calNote = newStatus === 'confirmed' ? ' · Calendar marked Booked · Artist has 48 hrs to complete payment'
                : newStatus === 'pending'   ? ' · Calendar marked Pending'
                : newStatus === 'cancelled' ? ' · Calendar dates freed'
                : '';
  showDash(`${r.guest} moved from ${labels[old]} → ${labels[newStatus]}${calNote}`);
  renderReservations(currentResFilter);
}

function markPlayedOff(id) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (!r) return;
  const showDate = new Date(r.checkin + 'T00:00:00');
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
  if (showDate >= todayMidnight) { showDash('Show confirmation is available the day after the show date.'); return; }
  r.status = 'completed';
  r.playedOffAt = Date.now();
  syncCalendarFromBookings();
  renderCalendar();
  renderReservations(currentResFilter);
  updateConfirmedTabBadge();
  renderOverview();
  renderEarnings();
  showDash(`✓ Show confirmed — $${Math.round(r.total * 0.20).toLocaleString()} deposit released. Funds transfer within 24 hours.`);
  // Prompt host to rate the artist
  openHostRatingModal(id);
}

// ─── RATINGS ─────────────────────────────────────────────────────────────────

let BB_RATINGS = [];
(function() {
  try { BB_RATINGS = JSON.parse(localStorage.getItem('bb_ratings') || '[]'); } catch(e) {}
})();

function saveRatings() {
  try { localStorage.setItem('bb_ratings', JSON.stringify(BB_RATINGS)); } catch(e) {}
}

let _hostRatingBookingId = null;

function openHostRatingModal(bookingId) {
  _hostRatingBookingId = bookingId;
  const r = RESERVATIONS.find(x => x.id === bookingId);
  const subEl = document.getElementById('hostRatingSubtitle');
  if (subEl) subEl.textContent = `How was ${r ? (r.bandName || r.guest) : 'the artist'}?`;
  ['hrQ1','hrQ2','hrQ3'].forEach(n => {
    document.querySelectorAll(`input[name="${n}"]`).forEach(i => i.checked = false);
  });
  document.getElementById('hrNote').value = '';
  document.getElementById('hostRatingOverlay').classList.add('open');
  document.getElementById('hostRatingModal').classList.add('open');
}

function closeHostRatingModal() {
  document.getElementById('hostRatingOverlay').classList.remove('open');
  document.getElementById('hostRatingModal').classList.remove('open');
  _hostRatingBookingId = null;
}

function submitHostRating() {
  if (!_hostRatingBookingId) return;
  const r   = RESERVATIONS.find(x => x.id === _hostRatingBookingId);
  const q1  = parseInt(document.querySelector('input[name="hrQ1"]:checked')?.value || '0');
  const q2  = parseInt(document.querySelector('input[name="hrQ2"]:checked')?.value || '0');
  const q3  = parseInt(document.querySelector('input[name="hrQ3"]:checked')?.value || '0');
  if (!q1 || !q2 || !q3) { showDash('Please answer all three questions.'); return; }
  const note = document.getElementById('hrNote').value.trim().slice(0, 200);
  const rating = {
    id: 'rat_' + Date.now(),
    bookingId: _hostRatingBookingId,
    raterType: 'host',
    raterId: user?.id || 'host',
    ratedId: r?.guest || '',
    venueId: r ? HOST_LISTINGS.find(l => l.title === r.property)?.id || '' : '',
    scores: { asDescribed: q1, professional: q2, wouldBookAgain: q3 },
    note,
    submittedAt: Date.now(),
    response: null,
    responseAt: null,
    locked: false,
  };
  BB_RATINGS.push(rating);
  saveRatings();
  closeHostRatingModal();
  showDash('Rating submitted — thank you!');
}

function getArtistRatings(guestName) {
  return BB_RATINGS.filter(rt => rt.raterType === 'host' && rt.ratedId === guestName);
}

function avgScore(ratings) {
  if (!ratings.length) return 0;
  const total = ratings.reduce((s, rt) => s + (rt.scores.asDescribed + rt.scores.professional + rt.scores.wouldBookAgain) / 3, 0);
  return total / ratings.length;
}

function starsHtml(score, size = 14) {
  const filled = Math.round(score);
  return [1,2,3,4,5].map(s =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${s<=filled?'#F59E0B':'#333'}" style="vertical-align:middle"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  ).join('');
}

// ─── PLAYED-OFF NOTIFICATIONS ─────────────────────────────────────────────────
// Called once on load. For each past-date confirmed+paid booking that hasn't
// been marked as played off, send a browser push notification (once per calendar
// day per booking, throttled via localStorage).
function checkPlayedOffNotifications() {
  if (!('Notification' in window)) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = RESERVATIONS.filter(r =>
    r.status === 'confirmed' && r.paymentStatus === 'paid' && new Date(r.checkin) < today
  );
  if (!due.length) return;

  const todayKey = today.toISOString().slice(0,10);
  let sent;
  try { sent = JSON.parse(localStorage.getItem('bb_notif_sent') || '{}'); } catch(e) { sent = {}; }

  const doNotify = () => {
    due.forEach(r => {
      const key = `${r.id}_${todayKey}`;
      if (sent[key]) return;
      sent[key] = true;
      try { new Notification('Deposit ready to release', {
        body: `${r.bandName || r.guest} played at ${r.property}. Confirm the show to release your deposit within 24 hours.`,
        icon: '/favicon.ico',
        tag:  r.id
      }); } catch(e) {}
    });
    try { localStorage.setItem('bb_notif_sent', JSON.stringify(sent)); } catch(e) {}
  };

  if (Notification.permission === 'granted') {
    doNotify();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') doNotify(); });
  }
}

function archiveReservation(id) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (r) { r.archived = true;  renderReservations(currentResFilter); }
}
function unarchiveReservation(id) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (r) { r.archived = false; renderReservations(currentResFilter); }
}
function toggleArchivedResRows() {
  const rows = document.querySelectorAll('.archived-entry');
  const btn  = document.getElementById('archivedToggleBtn');
  const showing = rows[0]?.style.display !== 'none';
  rows.forEach(r => r.style.display = showing ? 'none' : '');
  if (btn) btn.textContent = (showing ? '▸' : '▾') + ` Archived (${rows.length})`;
}

function viewRes(id) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (!r) return;

  const deposit    = Math.round(r.total * 0.20);
  const bookingFee = Math.round(r.total * 0.08);
  const remaining  = r.total - deposit;
  const isPaid     = r.paymentStatus === 'paid';

  // Timeline steps
  const tlSteps = [
    { label: 'Request submitted',  time: r.submittedAt ? fmtTs(r.submittedAt) : null,  done: true },
    { label: 'Booking confirmed',  time: r.confirmedAt ? fmtTs(r.confirmedAt) : null,  done: !!r.confirmedAt },
    { label: 'Payment received',   time: r.paidAt      ? fmtTs(r.paidAt)      : null,  done: isPaid },
    { label: 'Show played off',    time: r.playedOffAt  ? fmtTs(r.playedOffAt) : null,  done: !!r.playedOffAt },
  ];

  // Competing requests (same venue + date, pending, not this one)
  const competing = RESERVATIONS.filter(x =>
    x.id !== r.id && x.property === r.property &&
    x.checkin === r.checkin && x.status === 'pending'
  );
  const myOrder  = (pendingOrder[r.property] || []);
  const ranked   = [...competing].sort((a, b) => {
    const ia = myOrder.indexOf(a.id), ib = myOrder.indexOf(b.id);
    return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
  });

  // Contact section
  const contactHtml = isPaid
    ? `<div class="rd-section">
        <div class="rd-section-label">Contact details</div>
        <div class="rd-contact-row"><strong>Email</strong><span>${r.guest.toLowerCase().replace(' ','.')}@example.com</span></div>
        <div class="rd-contact-row" style="margin-top:6px"><strong>Phone</strong><span>(555) 000-0000</span></div>
       </div>`
    : `<div class="rd-section">
        <div class="rd-section-label">Contact details</div>
        <div class="rd-contact-locked">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 1 1 6.2 0v2z"/></svg>
          Released after payment is completed
        </div>
       </div>`;

  const competingHtml = (r.status === 'pending' && ranked.length)
    ? `<div class="rd-section">
        <div class="rd-section-label">Other requests for this date</div>
        <div class="rd-competing">
          ${ranked.map((c, i) => `
            <div class="rd-comp-row">
              <img src="${c.guestImg}" class="rd-comp-avatar" onerror="this.style.background='#1C1C1C'"/>
              <div>
                <div class="rd-comp-name">${c.guest}</div>
                ${c.bandName ? `<div class="rd-comp-band">${c.bandName}</div>` : ''}
              </div>
              <span class="rd-comp-rank">#${i + 2} priority</span>
            </div>`).join('')}
        </div>
       </div>`
    : '';

  const pastArtistRatings = getArtistRatings(r.guest);
  const artistAvg = avgScore(pastArtistRatings);
  const artistRatingHtml = pastArtistRatings.length
    ? `<div style="margin-top:6px;font-size:12px;color:var(--text-muted)">${starsHtml(artistAvg,13)} <span style="color:var(--text-sec)">${artistAvg.toFixed(1)} avg from ${pastArtistRatings.length} booking${pastArtistRatings.length>1?'s':''}</span></div>`
    : '';

  const artistVenueRating = BB_RATINGS.find(rt => rt.raterType === 'artist' && rt.bookingId === r.id);
  const artistVenueRatingHtml = artistVenueRating
    ? `<div class="rd-section">
        <div class="rd-section-label">Artist's rating of this venue</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${starsHtml((artistVenueRating.scores.asDescribed + artistVenueRating.scores.professional + artistVenueRating.scores.wouldBookAgain)/3)}
          <span style="font-size:12px;color:var(--text-muted)">${new Date(artistVenueRating.submittedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
        </div>
        ${artistVenueRating.note ? `<div class="rd-notes" style="margin-top:8px">"${artistVenueRating.note}"</div>` : ''}
       </div>`
    : '';

  if (r.hostGenerated) {
    const venueId = getVenueIdForReservation(r);
    const loggedEntry = venueId ? (MANUAL_CAL_ENTRIES[venueId] || {})[r.checkin] : null;
    const loggedEarnings = loggedEntry?.earnings;

    document.getElementById('resDrawerBody').innerHTML = `
      <div class="rd-section">
        <div class="rd-artist-name" style="font-size:18px;font-weight:700">${r.guest}</div>
        ${r.bandName ? `<div class="rd-artist-band" style="margin-top:4px">${r.bandName}</div>` : ''}
      </div>

      <div class="rd-section">
        <div class="rd-section-label">Event details</div>
        ${r.eventType ? `<div class="rd-row"><span class="rd-row-label">Event type</span><span class="rd-row-val">${r.eventType}</span></div>` : ''}
        <div class="rd-row"><span class="rd-row-label">Turnout</span><span class="rd-row-val">${r.guests ? r.guests.toLocaleString() : '—'}</span></div>
        ${r.notes ? `<div class="rd-notes">"${r.notes}"</div>` : ''}
      </div>

      <div class="rd-section">
        <div class="rd-section-label">Venue &amp; date</div>
        <div class="rd-row"><span class="rd-row-label">Venue</span><span class="rd-row-val">${r.property}</span></div>
        <div class="rd-row"><span class="rd-row-label">Date</span><span class="rd-row-val">${fmt(r.checkin)}</span></div>
      </div>

      <div class="rd-section">
        <div class="rd-section-label">Night's earnings</div>
        ${loggedEarnings
          ? `<div class="rd-fin-row-total"><span>Total logged</span><span>$${Number(loggedEarnings).toLocaleString()}</span></div>
             ${loggedEntry.earningsNotes ? `<div class="rd-notes" style="margin-top:8px">${loggedEntry.earningsNotes}</div>` : ''}`
          : `<div style="font-size:13px;color:var(--text-muted)">No earnings logged yet. <button class="res-action-btn" style="font-size:13px" onclick="closeResDrawer();openLogEarningsModal('${r.id}','${venueId || ''}','${r.checkin}','${r.guest}','${r.property}')">Log earnings →</button></div>`
        }
      </div>
    `;
  } else {
  document.getElementById('resDrawerBody').innerHTML = `
    <div class="rd-section">
      <div class="rd-artist-card">
        <img src="${r.guestImg}" class="rd-artist-avatar" onerror="this.style.background='#1C1C1C'"/>
        <div>
          <div class="rd-artist-name">${r.guest}</div>
          <div class="rd-artist-band">${r.bandName || '<span style="color:var(--text-muted);font-style:italic">No band listed</span>'}</div>
          ${artistRatingHtml}
        </div>
      </div>
      <div class="rd-artist-btns">
        <button class="rd-artist-btn" onclick="closeResDrawer();openContactPopup(event,'${r.id}')">View profile</button>
        <button class="rd-artist-btn" onclick="closeResDrawer();goToMessageWithGuest('${r.id}')">Message</button>
      </div>
    </div>

    <div class="rd-section">
      <div class="rd-section-label">Event details</div>
      ${r.eventType ? `<div class="rd-row"><span class="rd-row-label">Event type</span><span class="rd-row-val">${r.eventType}</span></div>` : ''}
      <div class="rd-row"><span class="rd-row-label">Expected attendance</span><span class="rd-row-val">${r.guests ? r.guests.toLocaleString() : '—'}</span></div>
      ${r.riderName ? `<div class="rd-row"><span class="rd-row-label">Rider on file</span><span class="rd-row-val">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${r.riderName}</span></div>` : ''}
      ${r.notes
        ? `<div class="rd-notes">"${r.notes}"</div>`
        : `<div class="rd-notes-empty">No additional notes submitted.</div>`}
    </div>

    <div class="rd-section">
      <div class="rd-section-label">Venue &amp; date</div>
      <div class="rd-row"><span class="rd-row-label">Venue</span><span class="rd-row-val">${r.property}</span></div>
      <div class="rd-row"><span class="rd-row-label">Date</span><span class="rd-row-val">${fmt(r.checkin)}</span></div>
    </div>

    <div class="rd-section">
      <div class="rd-section-label">Payment breakdown</div>
      <div class="rd-financials">
        <div class="rd-fin-row">
          <span>Nightly rate</span>
          <span>$${r.total.toLocaleString()}</span>
        </div>
        <div class="rd-fin-row-total">
          <span>Held at confirmation <span class="rd-fin-note">— deposit</span></span>
          <span>$${deposit.toLocaleString()}</span>
        </div>
        <div class="rd-fin-row" style="margin-top:4px">
          <span>Remaining balance <span class="rd-fin-note">— settled per your contract terms</span></span>
          <span>$${remaining.toLocaleString()}</span>
        </div>
        ${r.status === 'confirmed' || r.status === 'completed' ? `
        <div class="rd-fin-row" style="margin-top:6px;align-items:center">
          <span>Payment status</span>
          <span class="rd-status-chip ${isPaid ? 'paid' : 'unpaid'}">${isPaid ? '● Received' : '● Awaiting payment'}</span>
        </div>` : ''}
      </div>
    </div>

    <div class="rd-section">
      <div class="rd-section-label">Booking timeline</div>
      <div class="rd-timeline">
        ${tlSteps.map(s => `
          <div class="rd-tl-step">
            <div class="rd-tl-dot ${s.done ? 'done' : 'pending'}"></div>
            <div>
              <div class="rd-tl-label" style="color:${s.done ? 'var(--text)' : 'var(--text-muted)'}">${s.label}</div>
              ${s.time ? `<div class="rd-tl-time">${s.time}</div>` : s.done ? '' : `<div class="rd-tl-time">—</div>`}
            </div>
          </div>`).join('')}
      </div>
    </div>

    ${contactHtml}
    ${competingHtml}
    ${artistVenueRatingHtml}
    ${(r.status === 'confirmed' || r.status === 'completed') && isPaid ? `
    <div class="rd-section" style="padding-top:0;border-top:none">
      <button onclick="openAgreement('${r.id}')" style="width:100%;padding:11px;border-radius:9px;font-size:14px;font-weight:600;background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.25);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        Download performance agreement
      </button>
    </div>` : ''}
  `;
  }

  document.getElementById('resDrawerOverlay').classList.remove('hidden');
  document.getElementById('resDrawer').classList.remove('hidden');
}

function closeResDrawer() {
  document.getElementById('resDrawerOverlay').classList.add('hidden');
  document.getElementById('resDrawer').classList.add('hidden');
}

// ─── PERFORMANCE AGREEMENT ────────────────────────────────────────────────────

function openAgreement(id) {
  const r = RESERVATIONS.find(x => x.id === id);
  if (!r) return;
  const listing    = HOST_LISTINGS.find(l => l.title === r.property) || {};
  const deposit    = Math.round(r.total * 0.20);
  const bookingFee = Math.round(r.total * 0.08);
  const remaining  = r.total - deposit;
  const dateStr    = new Date(r.checkin + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const issuedStr  = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Performance Agreement — ${r.guest} @ ${r.property}</title>
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
    .sig-block { border-top: 1px solid #aaa; padding-top: 10px; }
    .sig-name { font-weight: 700; margin-bottom: 2px; }
    .sig-role { font-size: 12px; color: #777; }
    .sig-line { margin-top: 28px; border-top: 1px solid #ccc; font-size: 11px; color: #999; padding-top: 4px; }
    .watermark { text-align: center; font-size: 11px; color: #bbb; margin-top: 48px; letter-spacing: 0.5px; }
    @media print {
      body { padding: 40px; }
      button { display: none !important; }
    }
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
    <div class="row"><span class="label">Venue (Host)</span><span class="val">${r.property}${listing.location ? ' — ' + listing.location : ''}</span></div>
    <div class="row"><span class="label">Performer</span><span class="val">${r.guest}${r.bandName ? ' — ' + r.bandName : ''}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Event details</div>
    <div class="row"><span class="label">Performance date</span><span class="val">${dateStr}</span></div>
    ${r.eventType ? `<div class="row"><span class="label">Event type</span><span class="val">${r.eventType}</span></div>` : ''}
    <div class="row"><span class="label">Expected attendance</span><span class="val">${r.guests ? r.guests.toLocaleString() : '—'}</span></div>
    ${listing.capacity ? `<div class="row"><span class="label">Venue capacity</span><span class="val">${listing.capacity.toLocaleString()}</span></div>` : ''}
    ${r.riderName ? `<div class="row"><span class="label">Technical rider on file</span><span class="val">${r.riderName}</span></div>` : ''}
    ${r.notes ? `<div class="row"><span class="label">Performance notes</span><span class="val" style="max-width:360px">${r.notes}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Financial terms</div>
    <table class="fin-table">
      <thead><tr><th>Item</th><th>Amount</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Nightly rate</td><td>$${r.total.toLocaleString()}</td><td>Agreed venue fee</td></tr>
        <tr><td>Deposit (20%)</td><td>$${deposit.toLocaleString()}</td><td>Held by GigNVenue; released within 24 hrs of show completion</td></tr>
        <tr><td>Booking fee (8%)</td><td>$${bookingFee.toLocaleString()}</td><td>GigNVenue platform fee — non-refundable</td></tr>
        <tr><td>Remaining balance</td><td>$${remaining.toLocaleString()}</td><td>Settled directly with venue in terms agreed between venue and artist</td></tr>
        <tr class="total-row"><td>Paid at confirmation</td><td>$${(deposit + bookingFee).toLocaleString()}</td><td>Deposit + booking fee</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Terms &amp; conditions</div>
    <div class="clause"><span class="clause-num">1.</span> The Performer agrees to appear at the Venue on the date and time specified and to perform for the agreed duration.</div>
    <div class="clause"><span class="clause-num">2.</span> The Venue agrees to provide the agreed space, technical facilities, and any amenities confirmed via the GigNVenue platform.</div>
    <div class="clause"><span class="clause-num">3.</span> The deposit of 20% of the nightly rate is held in escrow by GigNVenue and released to the Venue within 24 hours of the Venue confirming that the show has played off successfully.</div>
    <div class="clause"><span class="clause-num">4.</span> Cancellation by the Performer within 14 days of the event date will result in forfeiture of the deposit. Cancellation by the Venue will result in a full refund of all amounts paid by the Performer.</div>
    <div class="clause"><span class="clause-num">5.</span> Both parties agree to conduct themselves professionally and in good faith, and to resolve any disputes first through GigNVenue's resolution process before pursuing external legal remedies.</div>
    <div class="clause"><span class="clause-num">6.</span> This agreement is facilitated by GigNVenue and is governed by the laws of the State of California. GigNVenue acts as platform intermediary and assumes no liability for acts or omissions of either party.</div>
  </div>

  <div class="section">
    <div class="section-title">Signatures</div>
    <div class="sig-grid">
      <div>
        <div class="sig-name">${r.guest}${r.bandName ? ' / ' + r.bandName : ''}</div>
        <div class="sig-role">Performer</div>
        <div class="sig-line">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
      </div>
      <div>
        <div class="sig-name">${r.property}</div>
        <div class="sig-role">Venue / Host</div>
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

// ─── CONTACT POPUP ────────────────────────────────────────────────────────────

function openContactPopup(e, rid) {
  e.stopPropagation();
  markResSeen(rid);
  closeContactPopup();
  const r = RESERVATIONS.find(x => x.id === rid);
  if (!r) return;

  const popup = document.createElement('div');
  popup.id = 'contactPopup';
  popup.className = 'contact-popup';
  popup.innerHTML = `
    <div class="contact-popup-header">
      <img src="${r.guestImg}" class="contact-popup-avatar" onerror="this.style.background='#1C1C1C'"/>
      <div>
        <div class="contact-popup-name">${r.guest}</div>
        ${r.bandName ? `<div class="contact-popup-band">${r.bandName}</div>` : '<div class="contact-popup-band">No band listed</div>'}
      </div>
    </div>
    <div class="contact-popup-actions">
      <button class="contact-popup-btn" onclick="viewArtistProfile('${rid}')">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        View profile
      </button>
      <button class="contact-popup-btn" onclick="goToMessageWithGuest('${rid}')">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        Send message
      </button>
    </div>`;
  document.body.appendChild(popup);

  const rect = e.target.getBoundingClientRect();
  const pw = 220, ph = 164;
  let left = rect.left;
  let top  = rect.bottom + 6;
  if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
  if (top + ph  > window.innerHeight - 12) top  = rect.top - ph - 6;
  popup.style.left = `${Math.max(8, left)}px`;
  popup.style.top  = `${Math.max(8, top)}px`;

  setTimeout(() => document.addEventListener('click', _contactPopupOutside), 50);
}

function _contactPopupOutside(e) {
  const p = document.getElementById('contactPopup');
  if (p && !p.contains(e.target)) closeContactPopup();
}

function closeContactPopup() {
  const p = document.getElementById('contactPopup');
  if (p) p.remove();
  document.removeEventListener('click', _contactPopupOutside);
}

function openMsgArtistProfile(e, name, img, band) {
  e.stopPropagation();
  closeContactPopup();
  const popup = document.createElement('div');
  popup.id = 'contactPopup';
  popup.className = 'contact-popup';
  popup.innerHTML = `
    <div class="contact-popup-header">
      <img src="${img}" class="contact-popup-avatar" onerror="this.style.background='#1C1C1C'"/>
      <div>
        <div class="contact-popup-name">${name}</div>
        <div class="contact-popup-band">${band || 'Pre-booking inquiry'}</div>
      </div>
    </div>
    <div class="contact-popup-actions">
      <button class="contact-popup-btn" onclick="viewArtistProfileFromMsg('${encodeURIComponent(name)}','${encodeURIComponent(img)}','${encodeURIComponent(band||'')}')">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        View profile
      </button>
    </div>`;
  document.body.appendChild(popup);
  const rect = e.target.getBoundingClientRect();
  const pw = 220, ph = 130;
  let left = rect.left;
  let top  = rect.bottom + 6;
  if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
  if (top + ph  > window.innerHeight - 12) top  = rect.top - ph - 6;
  popup.style.left = `${Math.max(8, left)}px`;
  popup.style.top  = `${Math.max(8, top)}px`;
  setTimeout(() => document.addEventListener('click', _contactPopupOutside), 50);
}

function viewArtistProfileFromMsg(name, img, band) {
  closeContactPopup();
  const params = new URLSearchParams({ name: decodeURIComponent(name), img: decodeURIComponent(img), band: decodeURIComponent(band) });
  window.open(`artist-profile.html?${params.toString()}`, '_blank');
}

function viewArtistProfile(rid) {
  closeContactPopup();
  const r = RESERVATIONS.find(x => x.id === rid);
  if (!r) return;
  const p = new URLSearchParams({
    rid,
    name: r.guest       || '',
    band: r.bandName    || '',
    img:  r.guestImg    || '',
  });
  window.open(`artist-profile.html?${p.toString()}`, '_blank');
}

function goToMessageWithGuest(rid) {
  closeContactPopup();
  const r = RESERVATIONS.find(x => x.id === rid);
  if (!r) return;

  // Find existing thread or create a new one
  let thread = MESSAGES.find(m => m.from === r.guest);
  if (!thread) {
    thread = {
      id: 'msg_' + Date.now(),
      from: r.guest,
      fromImg: r.guestImg,
      property: r.property,
      lastMsg: '',
      time: 'Now',
      unread: false,
      thread: [],
    };
    MESSAGES.unshift(thread);
    renderMessages();
  }

  navigate(null, 'messages');
  setTimeout(() => openThread(thread.id), 80);
}

// ─── LISTINGS MANAGER ─────────────────────────────────────────────────────────

function renderListingsManager() {
  document.getElementById('listingsManager').innerHTML = HOST_LISTINGS.map(l => `
    <div class="listing-mgr-card" id="lmgr-${l.id}">
      <img src="${l.img}" alt="${l.title}" class="listing-mgr-img" onerror="this.style.background='#1C1C1C'"/>
      <div class="listing-mgr-body">
        <div class="listing-mgr-title">${l.title}</div>
        <div class="listing-mgr-loc">${l.location} · Up to ${(l.capacity||'?').toLocaleString()} guests</div>
        <div class="listing-mgr-meta">
          <span class="listing-mgr-price">$${l.price.toLocaleString()} <span>/ night</span></span>
        </div>
      </div>
      <div class="listing-mgr-toggle">
        <label class="toggle-switch">
          <input type="checkbox" ${l.active ? 'checked' : ''} onchange="toggleListing('${l.id}', this.checked)"/>
          <span class="toggle-slider"></span>
        </label>
        <span id="toggle-label-${l.id}" style="font-weight:600;${l.active ? 'color:var(--green)' : 'color:var(--text-muted)'}">${l.active ? 'Listed' : 'Unlisted'}</span>
      </div>
      <div class="listing-mgr-actions">
        <div class="lma-row">
          <button class="lma-btn" onclick="editListing('${l.id}')">✏️ Edit</button>
          <button class="lma-btn" onclick="previewListing('${l.id}')">👁 Preview</button>
          <button class="lma-btn primary" onclick="navigate(null,'reservations')">Bookings</button>
        </div>
        <div class="lma-row">
          <button class="lma-btn lma-promote${l.promoted ? ' active' : ''}" onclick="togglePromoted('${l.id}')" title="${l.promoted ? 'Remove promotion' : 'Promote listing — boosts placement in search results'}">⚡ ${l.promoted ? 'Promoted' : 'Promote'}</button>
          <button class="lma-btn" onclick="openVenueCalendar('${l.id}')" title="Manage calendar">📅 Calendar</button>
          <button class="lma-btn danger" onclick="deleteListing('${l.id}')" title="Delete listing">🗑️ Delete</button>
        </div>
      </div>
    </div>`).join('');
}

function togglePromoted(id) {
  const l = HOST_LISTINGS.find(x => x.id === id);
  if (!l) return;
  l.promoted = !l.promoted;
  saveHostListings();
  renderListingsManager();
}

function toggleListing(id, active) {
  const l = HOST_LISTINGS.find(x => x.id === id);
  if (!l) return;
  l.active = active;

  // Persist active states
  const savedActive = {};
  HOST_LISTINGS.forEach(x => { savedActive[x.id] = x.active; });
  localStorage.setItem('gnv_venue_active', JSON.stringify(savedActive));
  saveHostListings();

  // Update toggle label
  const label = document.getElementById(`toggle-label-${id}`);
  if (label) {
    label.textContent = active ? 'Listed' : 'Unlisted';
    label.style.color = active ? 'var(--green)' : 'var(--text-muted)';
  }

  // Sync Overview active venues stat
  const activeCount = HOST_LISTINGS.filter(x => x.active).length;
  const valEl   = document.getElementById('statActiveVenues');
  const deltaEl = document.getElementById('statActiveVenueDelta');
  if (valEl)   valEl.textContent   = activeCount;
  if (deltaEl) deltaEl.textContent = `of ${HOST_LISTINGS.length} total`;

  // Sync Overview action items
  renderActionItems();

  // Sync Calendar venue tabs
  renderCalVenueTabs();

  showDash(`"${l.title}" is now ${active ? 'listed 🎸' : 'unlisted'}`);
}

// ─── EDIT LISTING ─────────────────────────────────────────────────────────────

let elmCurrentId        = null;  // id of listing being edited
let elmAmenities        = new Set();
let elmAmenityDescs     = {};    // { amenityId: 'optional description text' }
let elmFeaturedAmenities = [];   // up to 3 amenity IDs to feature prominently
let elmCustomHighlights  = [];   // custom {title,desc} highlights; total with featuredAmenities ≤ 3

const AMENS = {
  'Stage & Sound': [
    {id:'pro_sound',label:'Professional sound system'},{id:'stage',label:'Dedicated stage'},
    {id:'backline',label:'Backline equipment'},{id:'monitors',label:'Stage monitors'},
    {id:'pa_system',label:'PA system included'},{id:'piano',label:'Grand piano'},
    {id:'drums',label:'House drum kit'},{id:'recording',label:'Recording capability'},
  ],
  'Lighting & Production': [
    {id:'stage_lights',label:'Stage lighting rig'},{id:'laser_show',label:'Laser show system'},
    {id:'followspot',label:'Follow spotlights'},{id:'led_wall',label:'LED video wall'},
    {id:'fog_machine',label:'Fog / haze machines'},{id:'projection',label:'Projection system'},
  ],
  'Venue Features': [
    {id:'bar',label:'Full bar service'},{id:'vip_area',label:'VIP area'},
    {id:'green_room',label:'Green room / dressing rooms'},{id:'outdoor',label:'Outdoor / open air'},
    {id:'rooftop',label:'Rooftop space'},{id:'seated',label:'Seated capacity'},
    {id:'standing',label:'Standing floor'},{id:'coat_check',label:'Coat check'},
    {id:'accessibility',label:'Wheelchair accessible'},
  ],
  'Hospitality': [
    {id:'catering',label:'Catering available'},{id:'private_bar',label:'Private bar in green room'},
    {id:'rider_honored',label:'Rider honored'},{id:'parking',label:'Parking on-site'},
    {id:'load_in',label:'Load-in / dock access'},{id:'wifi',label:'High-speed WiFi'},
    {id:'security',label:'Security staff included'},{id:'box_office',label:'Box office / ticketing'},
  ],
};

// ─── ROOM RENTAL TOGGLE ──────────────────────────────────────────────────────

function toggleRoomRental(prefix) {
  const enabled = document.getElementById(`${prefix}RoomRentalEnabled`).checked;
  const fields  = document.getElementById(`${prefix}RoomRentalFields`);
  if (fields) fields.style.display = enabled ? '' : 'none';
}

// ─── AVAILABILITY HELPERS ────────────────────────────────────────────────────

function updateDepositCalc(prefix) {
  const price = parseInt(document.getElementById(`${prefix}Price`).value) || 0;
  const el    = document.getElementById(`${prefix}DepositCalc`);
  if (!el) return;
  if (!price) { el.innerHTML = ''; return; }
  const deposit   = Math.round(price * 0.20);
  const remaining = price - deposit;
  el.innerHTML = `
    <span class="deposit-calc-row">Deposit charged on approval: <strong>$${deposit.toLocaleString()}</strong> <span class="deposit-calc-note">(20% — held by GigNVenue, released to you after the show)</span></span>
    <span class="deposit-calc-row">Remaining balance: <strong>$${remaining.toLocaleString()}</strong> <span class="deposit-calc-note">(settled per your contract terms)</span></span>
    <span class="deposit-calc-row deposit-calc-note" style="margin-top:4px">⏱ Artist has 48 hours after approval to complete their deposit payment — if unpaid, the booking is automatically cancelled.</span>`;
}

function toggleSeasonalFields(prefix) {
  const val = document.getElementById(`${prefix}Avail`).value;
  document.getElementById(`${prefix}SeasonalWrap`).style.display = val === 'seasonal' ? '' : 'none';
}

function availToMode(dates) {
  if (!dates || dates === 'Available now') return { mode: 'now' };
  if (dates === 'Year-round') return { mode: 'year' };
  const m = dates.match(/^([A-Z][a-z]+)[–\-]([A-Z][a-z]+)/);
  if (m) return { mode: 'seasonal', from: m[1], to: m[2] };
  return { mode: 'now' };
}

function modeToAvail(prefix) {
  const mode = document.getElementById(`${prefix}Avail`).value;
  if (mode === 'year') return 'Year-round';
  if (mode === 'seasonal') {
    const from = document.getElementById(`${prefix}SeasonFrom`).value;
    const to   = document.getElementById(`${prefix}SeasonTo`).value;
    return `${from}–${to}`;
  }
  return 'Available now';
}

function populateAvailFields(prefix, dates) {
  const { mode, from, to } = availToMode(dates);
  document.getElementById(`${prefix}Avail`).value = mode;
  if (from) document.getElementById(`${prefix}SeasonFrom`).value = from;
  if (to)   document.getElementById(`${prefix}SeasonTo`).value   = to;
  toggleSeasonalFields(prefix);
}

function previewListing(id) {
  window.open(`index.html?venue=${encodeURIComponent(id)}`, '_blank');
}

function editListing(id) {
  const l = HOST_LISTINGS.find(x => x.id === id);
  if (!l) return;
  elmCurrentId         = id;
  elmAmenities         = new Set(l.amenities || []);
  elmAmenityDescs      = Object.assign({}, l.amenityDescsAll || l.amenityDescs || {});
  elmFeaturedAmenities = (l.featuredAmenities || []).slice();
  elmCustomHighlights  = (l.customHighlights || []).map(h => ({ ...h }));

  // Pre-fill form fields
  document.getElementById('elmTitle').textContent = `Edit — ${l.title}`;
  document.getElementById('elmName').value     = l.title;
  document.getElementById('elmLocation').value = l.location;
  document.getElementById('elmType').value     = l.type || 'clubs';
  document.getElementById('elmCapacity').value = l.capacity || '';
  document.getElementById('elmPrice').value    = l.price;
  document.getElementById('elmDesc').value     = l.desc || '';

  populateAvailFields('elm', l.dates);
  updateDepositCalc('elm');

  const rrEnabled = !!l.roomRentalEnabled;
  document.getElementById('elmRoomRentalEnabled').checked = rrEnabled;
  document.getElementById('elmRoomRentalFields').style.display = rrEnabled ? '' : 'none';
  document.getElementById('elmRoomRentalPrice').value = l.roomRentalPrice || '';
  document.getElementById('elmRoomRentalDesc').value  = l.roomRentalDesc  || '';
  document.getElementById('elmBookingDesc').value         = l.bookingDesc         || '';
  document.getElementById('elmCancellationPolicy').value = l.cancellationPolicy   || '';

  document.getElementById('elmAmenitySearch').value = '';
  renderElmAmenities('');
  renderElmCustomHighlights();

  document.getElementById('editListingOverlay').classList.remove('hidden');
  document.getElementById('editListingModal').classList.remove('hidden');
}


function renderElmAmenities(query) {
  const q = (query || '').toLowerCase();
  const container = document.getElementById('elmAmenityList');
  if (!container) return;
  container.innerHTML = '';
  const featuredCount = elmFeaturedAmenities.length + elmCustomHighlights.length;
  Object.entries(AMENS).forEach(([cat, items]) => {
    const filtered = items.filter(a => !q || a.label.toLowerCase().includes(q));
    if (!filtered.length) return;
    const sec = document.createElement('div');
    sec.className = 'amenity-section';
    sec.innerHTML = `
      <h4 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">${cat}</h4>
      ${filtered.map(a => {
        const checked = elmAmenities.has(a.id);
        const featured = elmFeaturedAmenities.includes(a.id);
        const canFeature = featured || featuredCount < 3;
        return `
        <label style="display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-sec);cursor:pointer;padding:5px 0;transition:color .15s">
          <input type="checkbox" value="${a.id}" ${checked ? 'checked' : ''}
                 style="accent-color:#FF2D78;width:16px;height:16px"
                 onchange="elmToggleAmenity('${a.id}',this.checked)"/>
          <span>${a.label}</span>
        </label>
        ${checked ? `
        <div style="display:flex;align-items:center;gap:8px;margin-left:26px">
          <input type="text" class="amenity-desc-input" style="flex:1;margin:0"
                 value="${(elmAmenityDescs[a.id] || '').replace(/"/g, '&quot;')}"
                 placeholder="Optional description (e.g. State-of-the-art PA with front fills)"
                 oninput="elmAmenityDescs['${a.id}']=this.value"/>
          <button type="button" class="amenity-feature-btn${featured ? ' active' : ''}"
                  ${!canFeature ? 'disabled' : ''}
                  onclick="elmToggleFeatured('${a.id}')"
                  title="${featured ? 'Remove from featured' : featuredCount >= 3 ? 'Max 3 featured' : 'Feature this amenity'}">
            ★ ${featured ? 'Featured' : 'Feature'}
          </button>
        </div>` : ''}
        `;
      }).join('')}`;
    container.appendChild(sec);
  });
}

function elmToggleAmenity(id, checked) {
  if (checked) {
    elmAmenities.add(id);
  } else {
    elmAmenities.delete(id);
    // Keep elmAmenityDescs[id] so the description is restored if re-checked
    elmFeaturedAmenities = elmFeaturedAmenities.filter(f => f !== id);
  }
  renderElmAmenities(document.getElementById('elmAmenitySearch').value || '');
}

function elmToggleFeatured(id) {
  if (elmFeaturedAmenities.includes(id)) {
    elmFeaturedAmenities = elmFeaturedAmenities.filter(f => f !== id);
  } else if (elmFeaturedAmenities.length < 3) {
    elmFeaturedAmenities = [...elmFeaturedAmenities, id];
  }
  renderElmAmenities(document.getElementById('elmAmenitySearch').value || '');
  renderElmCustomHighlights();
}

function renderElmCustomHighlights() {
  const total     = elmFeaturedAmenities.length + elmCustomHighlights.length;
  const available = 3 - total;
  const listEl    = document.getElementById('elmCustomHlList');
  const slotsEl   = document.getElementById('elmCustomHlSlots');
  const btn       = document.getElementById('elmAddCustomHlBtn');
  if (!listEl) return;
  slotsEl.textContent = `${total}/3 feature slots used`;
  listEl.innerHTML = elmCustomHighlights.map((h, i) => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border:1px solid var(--border-light)">
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text)">${h.title}</div>
        ${h.desc ? `<div style="font-size:12px;color:var(--text-muted);margin-top:3px">${h.desc}</div>` : ''}
      </div>
      <button onclick="removeElmCustomHighlight(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:18px;line-height:1;padding:0;flex-shrink:0" title="Remove">×</button>
    </div>`).join('');
  if (btn) btn.style.display = available > 0 ? '' : 'none';
}
function showElmCustomHlForm() {
  document.getElementById('elmCustomHlForm').style.display = '';
  document.getElementById('elmAddCustomHlBtn').style.display = 'none';
  document.getElementById('elmCustomHlTitle').value = '';
  document.getElementById('elmCustomHlDesc').value  = '';
  document.getElementById('elmCustomHlTitle').focus();
}
function cancelElmCustomHlForm() {
  document.getElementById('elmCustomHlForm').style.display = 'none';
  renderElmCustomHighlights();
}
function addElmCustomHighlight() {
  const title = document.getElementById('elmCustomHlTitle').value.trim();
  if (!title) return;
  const desc  = document.getElementById('elmCustomHlDesc').value.trim();
  elmCustomHighlights = [...elmCustomHighlights, { title, desc }];
  document.getElementById('elmCustomHlForm').style.display = 'none';
  renderElmAmenities(document.getElementById('elmAmenitySearch').value || '');
  renderElmCustomHighlights();
}
function removeElmCustomHighlight(i) {
  elmCustomHighlights = elmCustomHighlights.filter((_, idx) => idx !== i);
  renderElmAmenities(document.getElementById('elmAmenitySearch').value || '');
  renderElmCustomHighlights();
}

function saveEditedListing() {
  const name     = document.getElementById('elmName').value.trim();
  const location = document.getElementById('elmLocation').value.trim();
  const price    = parseInt(document.getElementById('elmPrice').value) || 0;
  const capacity = parseInt(document.getElementById('elmCapacity').value) || 0;
  const type     = document.getElementById('elmType').value;
  const desc     = document.getElementById('elmDesc').value.trim();

  if (!name || !location || !price) { showDash('Please fill in all required fields.'); return; }

  const l = HOST_LISTINGS.find(x => x.id === elmCurrentId);
  if (!l) return;

  l.title    = name;
  l.location = location;
  l.price    = price;
  l.capacity = capacity;
  l.type     = type;
  l.desc     = desc;
  l.dates    = modeToAvail('elm');
  l.roomRentalEnabled = document.getElementById('elmRoomRentalEnabled').checked;
  l.roomRentalPrice   = parseInt(document.getElementById('elmRoomRentalPrice').value) || 0;
  l.roomRentalDesc    = document.getElementById('elmRoomRentalDesc').value.trim();
  l.bookingDesc           = document.getElementById('elmBookingDesc').value.trim();
  l.cancellationPolicy    = document.getElementById('elmCancellationPolicy').value.trim();
  l.amenities             = [...elmAmenities];
  l.amenityDescs      = Object.fromEntries(
    Object.entries(elmAmenityDescs).filter(([k, v]) => elmAmenities.has(k) && v.trim())
  );
  l.amenityDescsAll   = Object.fromEntries(
    Object.entries(elmAmenityDescs).filter(([, v]) => v.trim())
  );
  l.featuredAmenities = elmFeaturedAmenities.filter(id => elmAmenities.has(id));
  l.customHighlights  = elmCustomHighlights.filter(h => h.title.trim());

  closeEditModal();
  saveHostListings();
  renderListingsManager();
  showDash(`"${name}" updated! ✅`);
}

function closeEditModal() {
  document.getElementById('editListingOverlay').classList.add('hidden');
  document.getElementById('editListingModal').classList.add('hidden');
  elmCurrentId = null;
}

// ─── DELETE LISTING ─────────────────────────────────────────────────────────

let _deleteTargetId = null;

function deleteListing(id) {
  const l = HOST_LISTINGS.find(x => x.id === id);
  if (!l) return;
  _deleteTargetId = id;
  document.getElementById('deleteConfirmText').textContent =
    `This will permanently remove "${l.title}" from your venues. This action cannot be undone.`;
  document.getElementById('deleteConfirmOverlay').classList.remove('hidden');
  document.getElementById('deleteConfirmModal').classList.remove('hidden');
}

function confirmDelete() {
  if (!_deleteTargetId) return;
  const idx = HOST_LISTINGS.findIndex(x => x.id === _deleteTargetId);
  const title = HOST_LISTINGS[idx]?.title || 'Venue';
  if (idx > -1) HOST_LISTINGS.splice(idx, 1);
  closeDeleteModal();
  renderListingsManager();
  showDash(`"${title}" has been deleted.`);
}

function closeDeleteModal() {
  document.getElementById('deleteConfirmOverlay').classList.add('hidden');
  document.getElementById('deleteConfirmModal').classList.add('hidden');
  _deleteTargetId = null;
}

/* ── NEW LISTING FORM ── */

let nlmImages    = [];
let nlmFeatureIdx = 0;
let nlmAmenities        = new Set();
let nlmAmenityDescs     = {};
let nlmFeaturedAmenities = [];
let nlmCustomHighlights  = [];

function openNewListingModal() {
  nlmImages            = [];
  nlmFeatureIdx        = 0;
  nlmAmenities         = new Set();
  nlmAmenityDescs      = {};
  nlmFeaturedAmenities = [];
  nlmCustomHighlights  = [];
  document.getElementById('newListingOverlay').classList.remove('hidden');
  document.getElementById('newListingModal').classList.remove('hidden');
  renderNlmAmenities('');
  renderNlmCustomHighlights();
  ['nlTitle','nlLocation','nlCapacity','nlDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const nlPrice = document.getElementById('nlPrice');
  if (nlPrice) nlPrice.value = '2000';
  document.getElementById('imgPreviewGrid').innerHTML = '';
  const inner = document.getElementById('dropzoneInner');
  if (inner) inner.innerHTML = `
    <svg viewBox="0 0 24 24" width="40" height="40" fill="var(--text-muted)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    <p>Drag &amp; drop photos here, or <span style="color:#FF2D78;font-weight:600">browse</span></p>
    <small>JPG, PNG, WEBP · Up to 20 photos</small>`;
}
function closeNewListingModal() {
  document.getElementById('newListingOverlay').classList.add('hidden');
  document.getElementById('newListingModal').classList.add('hidden');
}

/* ── IMAGE UPLOAD ── */

function imgDragOver(e) { e.preventDefault(); document.getElementById('imgDropzone').classList.add('drag-over'); }
function imgDragLeave()  { document.getElementById('imgDropzone').classList.remove('drag-over'); }
function imgDrop(e) {
  e.preventDefault();
  imgDragLeave();
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
  files.forEach(readImgFile);
}
function imgFilePicked(e) { [...e.target.files].forEach(readImgFile); e.target.value=''; }

function readImgFile(file) {
  if (nlmImages.length >= 20) { showDash('Maximum 20 photos allowed.'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    nlmImages.push({ dataUrl: ev.target.result, name: file.name });
    renderImgPreview();
  };
  reader.readAsDataURL(file);
}

function renderImgPreview() {
  const grid = document.getElementById('imgPreviewGrid');
  grid.innerHTML = nlmImages.map((img, i) => `
    <div class="img-preview-item${i===nlmFeatureIdx?' feature':''}" onclick="setFeatureImage(${i})" title="Click to set as feature image">
      <img src="${img.dataUrl}" alt="Photo ${i+1}"/>
      ${i===nlmFeatureIdx?'<div class="feature-badge">⭐ Feature</div>':''}
      <button class="img-preview-remove" onclick="removeImg(event,${i})">✕</button>
    </div>`).join('');
  const inner = document.getElementById('dropzoneInner');
  if (nlmImages.length > 0 && inner) {
    inner.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="var(--text-muted)"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      <p><span style="color:#FF2D78;font-weight:600">Add more photos</span> &nbsp;(${nlmImages.length}/20)</p>`;
  }
}

function setFeatureImage(idx) {
  nlmFeatureIdx = idx;
  renderImgPreview();
}
function removeImg(e, idx) {
  e.stopPropagation();
  nlmImages.splice(idx, 1);
  if (nlmFeatureIdx >= nlmImages.length) nlmFeatureIdx = Math.max(0, nlmImages.length-1);
  renderImgPreview();
}

/* ── AMENITY CHECKLIST (new listing) ── */

function renderNlmAmenities(query) {
  const q = (query || '').toLowerCase();
  const container = document.getElementById('nlmAmenityList');
  if (!container) return;
  container.innerHTML = '';
  const featuredCount = nlmFeaturedAmenities.length + nlmCustomHighlights.length;
  Object.entries(AMENS).forEach(([cat, items]) => {
    const filtered = items.filter(a => !q || a.label.toLowerCase().includes(q));
    if (!filtered.length) return;
    const sec = document.createElement('div');
    sec.className = 'amenity-section';
    sec.innerHTML = `
      <h4 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">${cat}</h4>
      ${filtered.map(a => {
        const checked = nlmAmenities.has(a.id);
        const featured = nlmFeaturedAmenities.includes(a.id);
        const canFeature = featured || featuredCount < 3;
        return `
        <label style="display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-sec);cursor:pointer;padding:5px 0;transition:color .15s">
          <input type="checkbox" value="${a.id}" ${checked ? 'checked' : ''}
                 style="accent-color:#FF2D78;width:16px;height:16px"
                 onchange="nlmToggleAmenity('${a.id}',this.checked)"/>
          <span>${a.label}</span>
        </label>
        ${checked ? `
        <div style="display:flex;align-items:center;gap:8px;margin-left:26px">
          <input type="text" class="amenity-desc-input" style="flex:1;margin:0"
                 value="${(nlmAmenityDescs[a.id] || '').replace(/"/g, '&quot;')}"
                 placeholder="Optional description (e.g. State-of-the-art PA with front fills)"
                 oninput="nlmAmenityDescs['${a.id}']=this.value"/>
          <button type="button" class="amenity-feature-btn${featured ? ' active' : ''}"
                  ${!canFeature ? 'disabled' : ''}
                  onclick="nlmToggleFeatured('${a.id}')"
                  title="${featured ? 'Remove from featured' : featuredCount >= 3 ? 'Max 3 featured' : 'Feature this amenity'}">
            ★ ${featured ? 'Featured' : 'Feature'}
          </button>
        </div>` : ''}
        `;
      }).join('')}`;
    container.appendChild(sec);
  });
}

function nlmToggleAmenity(id, checked) {
  if (checked) {
    nlmAmenities.add(id);
  } else {
    nlmAmenities.delete(id);
    // Keep nlmAmenityDescs[id] so the description is restored if re-checked
    nlmFeaturedAmenities = nlmFeaturedAmenities.filter(f => f !== id);
  }
  renderNlmAmenities(document.getElementById('nlmAmenitySearch')?.value || '');
}

function nlmToggleFeatured(id) {
  if (nlmFeaturedAmenities.includes(id)) {
    nlmFeaturedAmenities = nlmFeaturedAmenities.filter(f => f !== id);
  } else if (nlmFeaturedAmenities.length < 3) {
    nlmFeaturedAmenities = [...nlmFeaturedAmenities, id];
  }
  renderNlmAmenities(document.getElementById('nlmAmenitySearch')?.value || '');
  renderNlmCustomHighlights();
}

function renderNlmCustomHighlights() {
  const total     = nlmFeaturedAmenities.length + nlmCustomHighlights.length;
  const available = 3 - total;
  const listEl    = document.getElementById('nlmCustomHlList');
  const slotsEl   = document.getElementById('nlmCustomHlSlots');
  const btn       = document.getElementById('nlmAddCustomHlBtn');
  if (!listEl) return;
  slotsEl.textContent = `${total}/3 feature slots used`;
  listEl.innerHTML = nlmCustomHighlights.map((h, i) => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border:1px solid var(--border-light)">
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text)">${h.title}</div>
        ${h.desc ? `<div style="font-size:12px;color:var(--text-muted);margin-top:3px">${h.desc}</div>` : ''}
      </div>
      <button onclick="removeNlmCustomHighlight(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:18px;line-height:1;padding:0;flex-shrink:0" title="Remove">×</button>
    </div>`).join('');
  if (btn) btn.style.display = available > 0 ? '' : 'none';
}
function showNlmCustomHlForm() {
  document.getElementById('nlmCustomHlForm').style.display = '';
  document.getElementById('nlmAddCustomHlBtn').style.display = 'none';
  document.getElementById('nlmCustomHlTitle').value = '';
  document.getElementById('nlmCustomHlDesc').value  = '';
  document.getElementById('nlmCustomHlTitle').focus();
}
function cancelNlmCustomHlForm() {
  document.getElementById('nlmCustomHlForm').style.display = 'none';
  renderNlmCustomHighlights();
}
function addNlmCustomHighlight() {
  const title = document.getElementById('nlmCustomHlTitle').value.trim();
  if (!title) return;
  const desc  = document.getElementById('nlmCustomHlDesc').value.trim();
  nlmCustomHighlights = [...nlmCustomHighlights, { title, desc }];
  document.getElementById('nlmCustomHlForm').style.display = 'none';
  renderNlmAmenities(document.getElementById('nlmAmenitySearch')?.value || '');
  renderNlmCustomHighlights();
}
function removeNlmCustomHighlight(i) {
  nlmCustomHighlights = nlmCustomHighlights.filter((_, idx) => idx !== i);
  renderNlmAmenities(document.getElementById('nlmAmenitySearch')?.value || '');
  renderNlmCustomHighlights();
}

/* ── SUBMIT NEW LISTING ── */

function submitNewListing() {
  const title    = document.getElementById('nlTitle').value.trim();
  const location = document.getElementById('nlLocation').value.trim();
  const price    = parseInt(document.getElementById('nlPrice').value) || 0;
  const capacity = parseInt(document.getElementById('nlCapacity').value) || 100;
  const type     = document.getElementById('nlType').value;
  const desc     = document.getElementById('nlDesc').value.trim();
  const featureImg = nlmImages[nlmFeatureIdx]?.dataUrl
    || 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400&q=70';

  HOST_LISTINGS.push({
    id:'l'+Date.now(), title, location, price, capacity, type,
    img: featureImg, rating:0, reviews:0, active:true, desc,
    dates:              modeToAvail('nl'),
    roomRentalEnabled:  document.getElementById('nlRoomRentalEnabled').checked,
    roomRentalPrice:    parseInt(document.getElementById('nlRoomRentalPrice').value) || 0,
    roomRentalDesc:     document.getElementById('nlRoomRentalDesc').value.trim(),
    bookingDesc:        document.getElementById('nlBookingDesc').value.trim(),
    cancellationPolicy: document.getElementById('nlCancellationPolicy').value.trim(),
    amenities:          [...nlmAmenities],
    amenityDescs:       Object.fromEntries(Object.entries(nlmAmenityDescs).filter(([k, v]) => nlmAmenities.has(k) && v.trim())),
    amenityDescsAll:    Object.fromEntries(Object.entries(nlmAmenityDescs).filter(([, v]) => v.trim())),
    featuredAmenities:  nlmFeaturedAmenities.filter(id => nlmAmenities.has(id)),
    customHighlights:   nlmCustomHighlights.filter(h => h.title.trim()),
  });
  closeNewListingModal();
  saveHostListings();
  renderListingsManager();
  showDash(`"${title}" published! 🎸`);
}

// ─── FEATURED NIGHTS ──────────────────────────────────────────────────────────

let FEATURED_NIGHTS = [];
(function() {
  try { FEATURED_NIGHTS = JSON.parse(localStorage.getItem('bb_featured_nights') || '[]'); } catch(e) {}
})();

function saveFeaturedNights() {
  try { localStorage.setItem('bb_featured_nights', JSON.stringify(FEATURED_NIGHTS)); } catch(e) {}
}

let _fnDateIso = null;

function openFeatureNightModal(iso) {
  _fnDateIso = iso;
  const venue = HOST_LISTINGS.find(l => l.id === calVenueId);
  const [y, m, d] = iso.split('-');
  const dateLabel = new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  document.getElementById('fnDateLabel').textContent = dateLabel;
  document.getElementById('fnRate').value = venue ? venue.price : '';
  document.getElementById('fnNote').value = '';
  document.getElementById('fnCharCount').textContent = '0/100';
  document.getElementById('featureNightOverlay').classList.add('open');
  document.getElementById('featureNightModal').classList.add('open');
}

function closeFeatureNightModal() {
  document.getElementById('featureNightOverlay').classList.remove('open');
  document.getElementById('featureNightModal').classList.remove('open');
  _fnDateIso = null;
}

function submitFeatureNight() {
  if (!_fnDateIso) return;
  const venue = HOST_LISTINGS.find(l => l.id === calVenueId);
  const rate = parseInt(document.getElementById('fnRate').value) || 0;
  const note = document.getElementById('fnNote').value.trim().slice(0, 100);
  const entry = {
    id: 'fn_' + Date.now(),
    venueId: calVenueId,
    venueName: venue?.title || '',
    date: _fnDateIso,
    rate,
    note,
    postedAt: Date.now(),
    hostId: user?.id || '',
  };
  // Remove any existing featured night for this venue+date
  FEATURED_NIGHTS = FEATURED_NIGHTS.filter(fn => !(fn.venueId === calVenueId && fn.date === _fnDateIso));
  FEATURED_NIGHTS.push(entry);
  saveFeaturedNights();
  closeFeatureNightModal();
  renderCalendar();
  showDash(`★ Featured night set for ${_fnDateIso}!`);
}

function removeFeatureNight(id) {
  FEATURED_NIGHTS = FEATURED_NIGHTS.filter(fn => fn.id !== id);
  saveFeaturedNights();
  renderCalendar();
  showDash('Featured night removed.');
}

function getFeaturedNight(venueId, iso) {
  return FEATURED_NIGHTS.find(fn => fn.venueId === venueId && fn.date === iso) || null;
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────

// Returns { booked: Reservation[], pending: Reservation[] } for a given ISO date
function getDateBookings(iso) {
  // Only return bookings that belong to the currently displayed venue
  const venueTitle = HOST_LISTINGS.find(l => l.id === calVenueId)?.title || '';
  return {
    booked:  RESERVATIONS.filter(r => (r.status==='confirmed'||r.status==='completed') && r.property===venueTitle && r.checkin<=iso && iso<=r.checkout),
    pending: RESERVATIONS.filter(r => r.status==='pending' && r.property===venueTitle && r.checkin<=iso && iso<=r.checkout),
  };
}

function renderCalendar() {
  const label = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', {month:'long', year:'numeric'});
  document.getElementById('calMonthLabel').textContent = label;
  const wrap = document.getElementById('bigCalendar');
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevDays    = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();

  let html = `<div class="big-cal-header">`;
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => { html += `<div class="big-cal-dayname">${d}</div>`; });
  html += `</div><div class="big-cal-grid">`;

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="big-cal-cell other-month"><div class="big-cal-num" style="opacity:.25">${prevDays - i}</div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso    = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = today.getDate()===d && today.getMonth()===calMonth && today.getFullYear()===calYear;
    const status  = getVenueStatuses()[iso] || 'available';
    const { booked, pending } = getDateBookings(iso);

    const calEntry = r => {
      const badgeClass = (r.status === 'confirmed' || r.status === 'completed') ? 'cal-badge-booked' : 'cal-badge-pending';
      const statusLabel = r.status === 'confirmed' ? 'Confirmed' : r.status === 'completed' ? 'Completed' : 'Pending';
      // Host-added: show band name where the full name sits, and "Host Added" where band name sits
      if (r.hostGenerated) {
        const nameToShow = r.bandName || r.guest;
        return `<div class="cal-booking-entry" onclick="event.stopPropagation();goToBooking('${r.id}','${r.status}')">
          <span class="big-cal-status-badge ${badgeClass}">${statusLabel}</span>
          <span class="big-cal-guest-name">${nameToShow}</span>
          <span class="big-cal-band-name">Host Added</span>
        </div>`;
      }
      const band = r.bandName ? `<span class="big-cal-band-name">${r.bandName}</span>` : '';
      return `<div class="cal-booking-entry" onclick="event.stopPropagation();goToBooking('${r.id}','${r.status}')">
        <span class="big-cal-status-badge ${badgeClass}">${statusLabel}</span>
        <span class="big-cal-guest-name">${r.guest}</span>
        ${band}
      </div>`;
    };

    const manualBandName = (MANUAL_CAL_ENTRIES[calVenueId] || {})[iso]?.bandName || '';

    let badge = '';
    if (status === 'booked' && booked.length) {
      badge = calEntry(booked[0]);
    } else if (status === 'booked') {
      // Manually set booked (no backing reservation yet)
      badge = `<div class="cal-booking-entry" onclick="event.stopPropagation();calDayClick('${iso}')">
        <span class="big-cal-status-badge cal-badge-booked">Booked</span>
        ${manualBandName ? `<span class="big-cal-guest-name">${manualBandName}</span>` : ''}
        <span class="big-cal-band-name">Host Added</span>
      </div>`;
    } else if (status === 'blocked') {
      badge = `<div class="cal-booking-entry">
        <span class="big-cal-status-badge cal-badge-blocked">✗ Blocked</span>
      </div>`;
    } else if (status === 'pending') {
      if (pending.length === 1) {
        badge = calEntry(pending[0]);
      } else if (pending.length > 1) {
        badge = `<div class="cal-booking-entry" onclick="event.stopPropagation();goToBooking('${pending[0].id}','pending')">
          <span class="big-cal-status-badge cal-badge-pending">Pending</span>
          <span class="big-cal-guest-name">${pending.length} bookings pending</span>
        </div>`;
      } else {
        // Manually set pending (no backing reservation yet)
        badge = `<div class="cal-booking-entry" onclick="event.stopPropagation();calDayClick('${iso}')">
          <span class="big-cal-status-badge cal-badge-pending">Pending</span>
          ${manualBandName ? `<span class="big-cal-guest-name">${manualBandName}</span>` : ''}
          <span class="big-cal-band-name">Host Added</span>
        </div>`;
      }
    }

    const fn = getFeaturedNight(calVenueId, iso);
    const isFuture = new Date(iso + 'T00:00:00') > today;
    const fnBadge  = fn ? `<span class="fn-badge" title="Featured night">★</span>` : '';

    const isClickable = status !== 'available' || isFuture;
    html += `
      <div class="big-cal-cell cal-status-${status}${isToday?' today':''}${isClickable?' cal-cell-linked':''}${fn?' cal-cell-featured':''}"
           onclick="calDayClick('${iso}')">
        <div class="big-cal-num"><span class="big-cal-day-digit">${d}</span>${isToday ? '<span class="big-cal-today-label">Today</span>' : ''}${fnBadge}</div>
        ${badge}
      </div>`;
  }

  const total = firstDay + daysInMonth;
  const remainder = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= remainder; d++) {
    html += `<div class="big-cal-cell other-month"><div class="big-cal-num" style="opacity:.25">${d}</div></div>`;
  }
  html += `</div>`;
  wrap.innerHTML = html;
}

function prevCalMonth() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }
function nextCalMonth() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); }

// Clicking directly on a booking entry (cal-booking-entry) calls goToBooking with
// stopPropagation so it never reaches here. This handler fires only when the host
// clicks the empty area of the cell, so always open the popup.
function calDayClick(iso) {
  openCalDayPopup(iso);
}

// Navigate to the Bookings/Reservations section, activate the given tab,
// and (if id is provided) scroll to and flash-highlight that booking row.
function goToBooking(id, tabStatus) {
  navigate(null, 'reservations');

  // Activate the correct filter tab button
  document.querySelectorAll('#resTabs .filter-tab').forEach(t => {
    t.classList.remove('active');
    if (t.getAttribute('onclick').includes(`'${tabStatus}'`)) t.classList.add('active');
  });
  currentResFilter = tabStatus;
  renderReservations(tabStatus);

  if (id) {
    setTimeout(() => {
      const row = document.getElementById(`res-row-${id}`);
      if (!row) return;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('res-row-highlight');
      setTimeout(() => row.classList.remove('res-row-highlight'), 2200);
    }, 120);
  }
}

function openCalDayPopup(iso) {
  closeCalDayPopup();
  const status = getVenueStatuses()[iso] || 'available';
  const manualEntry = (MANUAL_CAL_ENTRIES[calVenueId] || {})[iso];
  const existingBandName = manualEntry?.bandName || '';
  const showBandSection = status === 'pending' || status === 'booked';
  const isFuture = new Date(iso + 'T00:00:00') > new Date();
  const fn = getFeaturedNight(calVenueId, iso);

  // Pre-set _cdpStatus so Save works if user doesn't re-click a button
  _cdpStatus = showBandSection ? status : null;

  const [y, m, d] = iso.split('-');
  const dateLabel = new Date(Number(y), Number(m)-1, Number(d))
    .toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  let targetCell = null;
  document.querySelectorAll('#bigCalendar .big-cal-cell').forEach(cell => {
    if (cell.getAttribute('onclick') === `calDayClick('${iso}')`) targetCell = cell;
  });

  const chk = `<svg class="cdp-check" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`;

  const popup = document.createElement('div');
  popup.id = 'calDayPopup';
  popup.className = 'cal-day-popup';
  popup.innerHTML = `
    <div class="cal-day-popup-header">
      <span class="cal-day-popup-date">${dateLabel}</span>
      <button class="cal-day-popup-close" onclick="closeCalDayPopup()">×</button>
    </div>
    <p class="cal-day-popup-hint">Set availability for this date</p>
    <div class="cal-day-popup-options">
      <button class="cdp-opt${status==='available'?' cdp-active':''}" id="cdp-btn-available" onclick="setDateStatus('${iso}','available')">
        <span class="cdp-dot cdp-dot-available"></span>
        <div class="cdp-opt-text"><strong>Available</strong><span>Open for booking requests</span></div>
        ${status==='available'?chk:''}
      </button>
      <button class="cdp-opt${status==='pending'?' cdp-active':''}" id="cdp-btn-pending" onclick="cdpSelectStatus('pending')">
        <span class="cdp-dot cdp-dot-pending"></span>
        <div class="cdp-opt-text"><strong>Pending</strong><span>Requests still available</span></div>
        ${status==='pending'?chk:''}
      </button>
      <button class="cdp-opt${status==='booked'?' cdp-active':''}" id="cdp-btn-booked" onclick="cdpSelectStatus('booked')">
        <span class="cdp-dot cdp-dot-booked"></span>
        <div class="cdp-opt-text"><strong>Booked</strong><span>Unavailable for new requests</span></div>
        ${status==='booked'?chk:''}
      </button>
      <button class="cdp-opt${status==='blocked'?' cdp-active':''}" id="cdp-btn-blocked" onclick="cdpSelectStatus('blocked')">
        <span class="cdp-dot" style="background:#555;border:1px solid #666"></span>
        <div class="cdp-opt-text"><strong>✗ Blocked</strong><span>Closed — no requests accepted</span></div>
        ${status==='blocked'?chk:''}
      </button>
    </div>
    <div class="cdp-band-section" id="cdpBandSection"${showBandSection ? '' : ' style="display:none"'}>
      <label class="cdp-band-label">Band / Act Name</label>
      <input class="cdp-band-input" id="cdpBandInput" type="text"
             placeholder="e.g. The Midnight Echoes"
             value="${existingBandName.replace(/"/g, '&quot;')}"
             oninput="cdpTogglePublicActRow()"
             onkeydown="if(event.key==='Enter')cdpSave('${iso}')"/>
      <div id="cdpPublicActRow" style="${status === 'booked' && existingBandName ? '' : 'display:none'}">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-secondary);margin-top:8px;cursor:pointer">
          <input type="checkbox" id="cdpPublicAct" style="accent-color:#FF2D78;width:13px;height:13px" ${manualEntry?.publicAct ? 'checked' : ''}/>
          Display act name publicly on venue calendar
        </label>
      </div>
      <div class="cdp-recurring-wrap" id="cdpRecurringWrap" style="display:none">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-sec);margin-top:8px;cursor:pointer">
          <input type="checkbox" id="cdpRecurring" style="accent-color:#FF2D78" onchange="document.getElementById('cdpRecurOptions').style.display=this.checked?'flex':'none'"/>
          Set as recurring
        </label>
        <div id="cdpRecurOptions" style="display:none;gap:6px;margin-top:8px">
          <select id="cdpRecurFreq" style="flex:1;padding:4px 8px;background:var(--bg-elevated);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px">
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select id="cdpRecurCount" style="flex:1;padding:4px 8px;background:var(--bg-elevated);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px">
            <option value="4">4 occurrences</option>
            <option value="8">8 occurrences</option>
            <option value="12">12 occurrences</option>
            <option value="26">26 occurrences</option>
            <option value="52">52 occurrences</option>
          </select>
        </div>
      </div>
      <button class="cdp-save-btn" onclick="cdpSave('${iso}')">Save</button>
    </div>
    ${isFuture && status === 'available' && !fn ? `
    <div class="cdp-feature-section">
      <button class="cdp-feature-night-btn" onclick="closeCalDayPopup();openFeatureNightModal('${iso}')">★ Feature this night</button>
    </div>` : fn ? `
    <div class="cdp-feature-section">
      <button class="cdp-feature-night-btn cdp-feature-remove" onclick="closeCalDayPopup();removeFeatureNight('${fn.id}')">✕ Remove featured night</button>
    </div>` : ''}
    ${(()=>{
      if (isFuture) return '';
      const r = RESERVATIONS.find(x => x.property === HOST_LISTINGS.find(l => l.id === calVenueId)?.title && x.checkin === iso && x.status === 'confirmed' && !x.hostGenerated);
      return r ? `<div class="cdp-feature-section"><button class="cdp-feature-night-btn" style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#34d399" onclick="closeCalDayPopup();markPlayedOff('${r.id}')">✓ Confirm show played · release deposit</button></div>` : '';
    })()}`;

  document.body.appendChild(popup);

  // Anchor to lower-right corner of the calendar grid so it never goes off-screen
  const calGrid = document.getElementById('bigCalendar');
  if (calGrid) {
    const rect = calGrid.getBoundingClientRect();
    popup.style.right  = `${Math.max(8, window.innerWidth - rect.right)}px`;
    popup.style.bottom = `${Math.max(8, window.innerHeight - rect.bottom)}px`;
    popup.style.left   = 'auto';
    popup.style.top    = 'auto';
  }

  setTimeout(() => document.addEventListener('click', calPopupOutsideClick), 50);
}

function calPopupOutsideClick(e) {
  const popup = document.getElementById('calDayPopup');
  if (popup && !popup.contains(e.target)) closeCalDayPopup();
}

function closeCalDayPopup() {
  const p = document.getElementById('calDayPopup');
  if (p) p.remove();
  document.removeEventListener('click', calPopupOutsideClick);
}

function cdpTogglePublicActRow() {
  const row   = document.getElementById('cdpPublicActRow');
  const input = document.getElementById('cdpBandInput');
  if (row) row.style.display = (_cdpStatus === 'booked' && input?.value.trim()) ? '' : 'none';
}

function cdpSelectStatus(status) {
  _cdpStatus = status;
  document.querySelectorAll('.cdp-opt').forEach(b => b.classList.remove('cdp-active'));
  const btn = document.getElementById(`cdp-btn-${status}`);
  if (btn) btn.classList.add('cdp-active');
  const section = document.getElementById('cdpBandSection');
  if (section) { section.style.display = ''; }
  // Show/hide band name field based on status
  const bandInput = document.getElementById('cdpBandInput');
  const bandLabel = section?.querySelector('.cdp-band-label');
  const recurringWrap = document.getElementById('cdpRecurringWrap');
  if (status === 'blocked') {
    if (bandInput) { bandInput.style.display = 'none'; }
    if (bandLabel) { bandLabel.style.display = 'none'; }
    if (recurringWrap) { recurringWrap.style.display = ''; }
  } else if (status === 'booked') {
    if (bandInput) { bandInput.style.display = ''; bandInput.focus(); }
    if (bandLabel) { bandLabel.style.display = ''; }
    if (recurringWrap) { recurringWrap.style.display = ''; }
  } else {
    if (bandInput) { bandInput.style.display = ''; bandInput.focus(); }
    if (bandLabel) { bandLabel.style.display = ''; }
    if (recurringWrap) { recurringWrap.style.display = 'none'; }
  }
  cdpTogglePublicActRow();
}

function cdpSave(iso) {
  if (!_cdpStatus) return;
  const bandName  = document.getElementById('cdpBandInput')?.value.trim() || '';
  const publicAct = !!document.getElementById('cdpPublicAct')?.checked;
  const recurring = document.getElementById('cdpRecurring')?.checked;
  const freq      = document.getElementById('cdpRecurFreq')?.value || 'weekly';
  const count     = parseInt(document.getElementById('cdpRecurCount')?.value) || 8;

  if (_cdpStatus === 'blocked') {
    setDateStatus(iso, 'blocked', '', false);
    if (recurring) {
      const [y, m, d] = iso.split('-').map(Number);
      let date = new Date(y, m - 1, d);
      for (let w = 1; w <= count; w++) {
        if (freq === 'monthly') date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        else date.setDate(date.getDate() + (freq === 'biweekly' ? 14 : 7));
        const nextIso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        if (!MANUAL_CAL_ENTRIES[calVenueId]) MANUAL_CAL_ENTRIES[calVenueId] = {};
        MANUAL_CAL_ENTRIES[calVenueId][nextIso] = { status: 'blocked', bandName: '' };
      }
      saveManualEntries();
      syncCalendarFromBookings();
      closeCalDayPopup();
      renderCalendar();
      const freqLabel = freq === 'biweekly' ? 'bi-weekly' : freq;
      showDash(`${iso} blocked + ${count} ${freqLabel} occurrences.`);
    }
    return;
  }

  // Save first occurrence
  setDateStatus(iso, _cdpStatus, bandName, publicAct);

  // Create recurring future occurrences for booked status
  if (recurring && _cdpStatus === 'booked' && count > 0) {
    const venue = HOST_LISTINGS.find(l => l.id === calVenueId);
    const [y, m, d] = iso.split('-').map(Number);
    let date = new Date(y, m - 1, d);
    for (let i = 1; i <= count; i++) {
      if (freq === 'monthly') date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
      else date.setDate(date.getDate() + (freq === 'biweekly' ? 14 : 7));
      const nextIso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      if (!MANUAL_CAL_ENTRIES[calVenueId]) MANUAL_CAL_ENTRIES[calVenueId] = {};
      if (!MANUAL_CAL_ENTRIES[calVenueId][nextIso]) {
        const rid    = 'hg_' + Date.now() + '_r' + i;
        const newRes = { id: rid, guest: bandName || 'Unknown Artist', guestImg: '', property: venue?.title || '', propertyImg: venue?.img || '', checkin: nextIso, checkout: nextIso, guests: 0, total: 0, status: 'confirmed', hostGenerated: true };
        if (bandName) newRes.bandName = bandName;
        RESERVATIONS.push(newRes);
        MANUAL_CAL_ENTRIES[calVenueId][nextIso] = { status: 'booked', bandName: bandName || '', reservationId: rid };
      }
    }
    saveManualEntries();
    syncCalendarFromBookings();
    renderCalendar();
    renderReservations(currentResFilter);
    const freqLabel = freq === 'biweekly' ? 'bi-weekly' : freq;
    showDash(`Residency set — ${count} ${freqLabel} dates added for ${bandName || 'this show'}.`);
  }
}

function setDateStatus(iso, newStatus, bandName = '', publicAct = false) {
  if (!MANUAL_CAL_ENTRIES[calVenueId]) MANUAL_CAL_ENTRIES[calVenueId] = {};
  const existingEntry = MANUAL_CAL_ENTRIES[calVenueId][iso];
  const venue = HOST_LISTINGS.find(l => l.id === calVenueId);

  if (newStatus === 'blocked') {
    MANUAL_CAL_ENTRIES[calVenueId][iso] = { status: 'blocked', bandName: '', publicAct: false };
    saveManualEntries();
    publishPublicCalendars();
    closeCalDayPopup();
    renderCalendar();
    showDash(`${iso} → Blocked`);
    return;
  }

  if (newStatus === 'available') {
    // Cancel (rather than delete) the backing reservation so it appears in the Cancelled tab
    if (existingEntry?.reservationId) {
      const r = RESERVATIONS.find(x => x.id === existingEntry.reservationId);
      if (r) { r.status = 'cancelled'; r.removedFromCalendar = true; }
      // Remove from pendingOrder
      const v = Object.keys(pendingOrder).find(v => pendingOrder[v].includes(existingEntry.reservationId));
      if (v) { pendingOrder[v] = pendingOrder[v].filter(x => x !== existingEntry.reservationId); if (!pendingOrder[v].length) delete pendingOrder[v]; }
    }
    delete MANUAL_CAL_ENTRIES[calVenueId][iso];
  } else {
    const resStatus = newStatus === 'booked' ? 'confirmed' : 'pending';
    const guestName = bandName || 'Unknown Artist';

    if (existingEntry?.reservationId) {
      // Update the existing host-generated reservation
      const r = RESERVATIONS.find(x => x.id === existingEntry.reservationId);
      if (r) { r.guest = guestName; r.status = resStatus; if (bandName) r.bandName = bandName; else delete r.bandName; }
    } else {
      // Create a new host-generated reservation
      const rid = 'hg_' + Date.now();
      const newRes = { id: rid, guest: guestName, guestImg: '', property: venue?.title || '', propertyImg: venue?.img || '', checkin: iso, checkout: iso, guests: 0, total: 0, status: resStatus, hostGenerated: true };
      if (bandName) newRes.bandName = bandName;
      RESERVATIONS.push(newRes);
      MANUAL_CAL_ENTRIES[calVenueId][iso] = { status: newStatus, bandName, publicAct, reservationId: rid };
    }
    if (existingEntry?.reservationId) {
      MANUAL_CAL_ENTRIES[calVenueId][iso] = { ...existingEntry, status: newStatus, bandName, publicAct };
    }
  }

  saveManualEntries();
  syncCalendarFromBookings();
  closeCalDayPopup();
  renderCalendar();
  renderReservations(currentResFilter);
  const labels = { available: 'Available', pending: 'Pending', booked: 'Booked' };
  showDash(`${iso} → ${labels[newStatus]}${bandName ? ' · ' + bandName : ''}`);
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

let activeThread = null;

function _msgBandName(from) {
  return RESERVATIONS.find(r => r.guest === from)?.bandName || null;
}

function _initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase() + '.';
  return parts[0][0].toUpperCase() + '.' + parts[parts.length - 1][0].toUpperCase() + '.';
}

// Returns the most relevant reservation for a message thread (pending > confirmed > completed > cancelled)
function _msgBooking(from, property) {
  const matches = RESERVATIONS.filter(r => r.guest === from && r.property === property);
  if (!matches.length) return null;
  const priority = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
  return matches.slice().sort((a, b) => priority[a.status] - priority[b.status])[0];
}

function renderMessages() {
  document.getElementById('msgThreadList').innerHTML = MESSAGES.map(m => {
    const band    = _msgBandName(m.from);
    const booking = _msgBooking(m.from, m.property);
    const statusLabels = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
    const bookingMeta = booking
      ? `${m.property} · ${statusLabels[booking.status]} · ${fmt(booking.checkin)}`
      : `${m.property} · <span class="msg-prerequest-badge">Pre-request</span>`;
    return `
    <div class="msg-thread${m.unread?' msg-thread-unread':''}" id="thread-${m.id}" onclick="openThread('${m.id}')">
      <img src="${m.fromImg}" alt="" class="msg-thread-avatar" onerror="this.style.background='#1C1C1C'"/>
      <div class="msg-thread-body">
        <div class="msg-thread-top">
          <div class="msg-thread-name-wrap">
            <span class="msg-thread-name">${m.from}</span>
            ${band ? `<span class="msg-thread-band">${band}</span>` : ''}
          </div>
          <span class="msg-thread-time">${m.time}</span>
        </div>
        <div class="msg-thread-preview">${bookingMeta}</div>
      </div>
      ${m.unread ? '<span class="msg-unread-dot"></span>' : ''}
    </div>`;
  }).join('');
}

function openThread(id) {
  const m = MESSAGES.find(x => x.id === id);
  if (!m) return;
  activeThread = m;
  m.unread = false;
  document.querySelectorAll('.msg-thread').forEach(t => t.classList.remove('active'));
  document.getElementById(`thread-${id}`).classList.add('active');
  document.getElementById(`thread-${id}`).querySelector('.msg-unread-dot')?.remove();
  document.getElementById(`thread-${id}`).classList.remove('msg-thread-unread');

  const band    = _msgBandName(m.from);
  const booking = _msgBooking(m.from, m.property);
  const statusLabels = { pending:'Pending', confirmed:'Confirmed', completed:'Completed', cancelled:'Cancelled' };
  const bookingBadge = booking
    ? `<span class="msg-booking-badge msg-booking-badge-link status-${booking.status}" onclick="goToBooking('${booking.id}','${booking.status}')">${statusLabels[booking.status]} · ${fmt(booking.checkin)}</span>`
    : `<span class="msg-prerequest-badge">Pre-request</span>`;
  const chatArea = document.getElementById('msgChat');
  const profileClick = booking
    ? `onclick="viewArtistProfile('${booking.id}')" style="cursor:pointer" title="View artist profile"`
    : `onclick="viewArtistProfileFromMsg('${m.from}','${m.fromImg}','${band||''}')" style="cursor:pointer" title="View artist profile"`;
  chatArea.innerHTML = `
    <div class="msg-chat-header">
      <img src="${m.fromImg}" alt="" class="msg-thread-avatar" style="width:40px;height:40px;cursor:pointer" onerror="this.style.background='#1C1C1C'" ${profileClick}/>
      <div class="msg-chat-header-info">
        <div class="msg-chat-header-top">
          <strong style="cursor:pointer" ${profileClick}>${m.from}</strong>${band ? ` <span class="msg-chat-band" style="cursor:pointer" ${profileClick}>${band}</span>` : ''}
        </div>
        <div class="msg-chat-header-sub">
          <span>${m.property}</span>
          ${bookingBadge}
        </div>
      </div>
    </div>
    <div class="msg-chat-messages" id="chatMessages">
      ${m.thread.map(msg => `
        <div>
          <div class="msg-bubble ${msg.mine?'mine':'theirs'}">${msg.text}<div class="msg-bubble-time">${msg.time}</div></div>
        </div>`).join('')}
    </div>
    <div class="msg-chat-input">
      <input type="file" id="msgFileInput" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="attachMsgFile(this)"/>
      <button class="msg-attach-btn" onclick="document.getElementById('msgFileInput').click()" title="Attach file">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <textarea id="msgInput" placeholder="Reply to ${m.from}…" rows="1" onkeydown="sendOnEnter(event)"></textarea>
      <button class="msg-send-btn" onclick="sendMessage()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>`;

  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;

  const unreadCount = MESSAGES.filter(x => x.unread).length;
  document.getElementById('msgBadge').textContent          = unreadCount || '';
  document.getElementById('topbarMsgBadge').textContent    = unreadCount || '';
  renderActionItems();
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  if (!input || !input.value.trim() || !activeThread) return;
  const text = input.value.trim();
  activeThread.thread.push({ mine: true, text, time: 'Just now' });
  activeThread.lastMsg = text;
  input.value = '';
  const msgs = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.innerHTML = `<div class="msg-bubble mine">${text}<div class="msg-bubble-time">Just now</div></div>`;
  msgs.appendChild(bubble);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const replies = [
      'Thanks for letting me know!',
      'That sounds great, I will confirm shortly.',
      'Happy to help! Let me check.',
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    activeThread.thread.push({ mine: false, text: reply, time: 'Just now' });
    const rb = document.createElement('div');
    rb.innerHTML = `<div class="msg-bubble theirs">${reply}<div class="msg-bubble-time">Just now</div></div>`;
    msgs.appendChild(rb);
    msgs.scrollTop = msgs.scrollHeight;
  }, 1500);
}

function sendOnEnter(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

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

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

function renderAnalytics() {
  const total       = RESERVATIONS.length;
  const confirmed   = RESERVATIONS.filter(r => r.status === 'confirmed' || r.status === 'completed').length;
  const conversion  = total ? Math.round((confirmed / total) * 100) : 0;
  const totalEarned = RESERVATIONS
    .filter(r => r.status === 'confirmed' || r.status === 'completed')
    .reduce((s, r) => s + (r.total || 0), 0);
  const avgRate = confirmed ? Math.round(totalEarned / confirmed) : 0;

  const stats = [
    { label: 'Total requests', value: total,      color: '#FF2D78' },
    { label: 'Confirmed bookings', value: confirmed, color: '#10B981' },
    { label: 'Conversion rate', value: conversion + '%', color: '#3B82F6' },
    { label: 'Total earned', value: '$' + totalEarned.toLocaleString(), color: '#F59E0B' },
    { label: 'Avg nightly rate', value: avgRate ? '$' + avgRate.toLocaleString() : '—', color: '#8B5CF6' },
  ];
  document.getElementById('analyticsGrid').innerHTML = stats.map(s => `
    <div class="analytics-stat">
      <div class="analytics-stat-accent" style="background:${s.color}"></div>
      <div class="analytics-stat-value">${s.value}</div>
      <div class="analytics-stat-label">${s.label}</div>
    </div>`).join('');

  // Monthly request volume — last 6 months
  const months = [];
  const now2 = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('en-US',{month:'short'}), year: d.getFullYear(), month: d.getMonth() });
  }
  const counts = months.map(m =>
    RESERVATIONS.filter(r => {
      const d = new Date(r.submittedAt || r.checkin + 'T00:00:00');
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length
  );
  const maxCount = Math.max(...counts, 1);
  const chartEl  = document.getElementById('analyticsChart');
  const wrap     = document.createElement('div');
  wrap.className = 'chart-bars';
  months.forEach((m, i) => {
    const pct = counts[i] ? (counts[i] / maxCount) * 100 : 4;
    const bw = document.createElement('div');
    bw.className = 'chart-bar-wrap';
    bw.innerHTML = `
      <div class="chart-bar" style="height:${pct}%;background:rgba(255,45,120,0.25)" title="${counts[i]} requests"></div>
      <div class="chart-bar-label">${m.label}</div>`;
    bw.querySelector('.chart-bar').addEventListener('mouseenter', function(){ this.style.background='#FF2D78'; });
    bw.querySelector('.chart-bar').addEventListener('mouseleave', function(){ this.style.background='rgba(255,45,120,0.25)'; });
    wrap.appendChild(bw);
  });
  if (chartEl) chartEl.replaceWith(wrap);

  // Top event types
  const typeCounts = {};
  RESERVATIONS.forEach(r => {
    const t = r.eventType || 'Unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const sorted = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).slice(0,5);
  const genreMax = sorted[0]?.[1] || 1;
  document.getElementById('analyticsGenres').innerHTML = sorted.map(([type, count]) => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span style="color:var(--text-sec)">${type}</span>
        <span style="color:var(--text-muted)">${count} request${count>1?'s':''}</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${Math.round((count/genreMax)*100)}%;background:#FF2D78;border-radius:3px;transition:width 0.4s"></div>
      </div>
    </div>`).join('') || '<p style="color:var(--text-muted);font-size:14px">No data yet.</p>';
}

// ─── EARNINGS ─────────────────────────────────────────────────────────────────

function getVenueIdForReservation(r) {
  return HOST_LISTINGS.find(l => l.title === r.property)?.id || null;
}

function getAllLoggedEarnings() {
  const year = new Date().getFullYear().toString();
  let allTime = 0, thisYear = 0;
  Object.values(MANUAL_CAL_ENTRIES).forEach(dates => {
    Object.entries(dates).forEach(([iso, entry]) => {
      if (entry.earnings) {
        allTime += entry.earnings;
        if (iso.startsWith(year)) thisYear += entry.earnings;
      }
    });
  });
  return { allTime, thisYear };
}

function seedManualEarnings() {
  const seeds = [
    { venueId:'l1', iso:'2026-01-15', entry:{ status:'booked', bandName:'The Wailers Revival', reservationId:'hg1', earnings:4200 } },
    { venueId:'l2', iso:'2026-01-28', entry:{ status:'booked', bandName:'Private Event',        reservationId:'hg2', earnings:2100 } },
    { venueId:'l1', iso:'2026-02-10', entry:{ status:'booked', bandName:'Stereo Jungle',        reservationId:'hg3', earnings:5800 } },
    { venueId:'l1', iso:'2026-02-22', entry:{ status:'booked', bandName:'Club Night',           reservationId:'hg4', earnings:3200 } },
    { venueId:'l2', iso:'2026-03-08', entry:{ status:'booked', bandName:'Jazz Night',           reservationId:'hg5', earnings:1800 } },
    { venueId:'l1', iso:'2025-09-20', entry:{ status:'booked', bandName:'DJ Catalyst',          reservationId:'hg6', earnings:4800 } },
    { venueId:'l2', iso:'2025-11-05', entry:{ status:'booked', bandName:'Acoustic Evening',     reservationId:'hg7', earnings:3200 } },
  ];
  let changed = false;
  seeds.forEach(({ venueId, iso, entry }) => {
    if (!MANUAL_CAL_ENTRIES[venueId]) MANUAL_CAL_ENTRIES[venueId] = {};
    if (!MANUAL_CAL_ENTRIES[venueId][iso]) {
      MANUAL_CAL_ENTRIES[venueId][iso] = entry;
      changed = true;
    }
  });
  if (changed) saveManualEntries();
}

let _lemVenueId = null, _lemIso = null, _lemResId = null;

function openLogEarningsModal(resId, venueId, iso, artistName, venueName) {
  _lemResId = resId; _lemVenueId = venueId; _lemIso = iso;
  document.getElementById('lemSubtitle').textContent = `${artistName}  ·  ${fmt(iso)}  ·  ${venueName}`;
  const existing = (MANUAL_CAL_ENTRIES[venueId] || {})[iso];
  document.getElementById('lemAmount').value = existing?.earnings || '';
  document.getElementById('lemNotes').value  = existing?.earningsNotes || '';
  document.getElementById('logEarningsOverlay').classList.remove('hidden');
  document.getElementById('logEarningsModal').classList.remove('hidden');
}

function closeLogEarningsModal() {
  document.getElementById('logEarningsOverlay').classList.add('hidden');
  document.getElementById('logEarningsModal').classList.add('hidden');
  _lemVenueId = _lemIso = _lemResId = null;
}

function saveLoggedEarnings() {
  const amt = parseFloat(document.getElementById('lemAmount').value);
  if (!amt || amt < 0) { showDash('Please enter a valid amount.'); return; }
  const notes = document.getElementById('lemNotes').value.trim();
  if (!MANUAL_CAL_ENTRIES[_lemVenueId]) MANUAL_CAL_ENTRIES[_lemVenueId] = {};
  if (!MANUAL_CAL_ENTRIES[_lemVenueId][_lemIso]) MANUAL_CAL_ENTRIES[_lemVenueId][_lemIso] = { status:'booked', bandName:'' };
  MANUAL_CAL_ENTRIES[_lemVenueId][_lemIso].earnings      = amt;
  MANUAL_CAL_ENTRIES[_lemVenueId][_lemIso].earningsNotes = notes;
  MANUAL_CAL_ENTRIES[_lemVenueId][_lemIso].reservationId = _lemResId;
  saveManualEntries();
  closeLogEarningsModal();
  renderEarnings();
  showDash('Earnings saved.');
}

function confirmShowPlayed(resId) {
  markPlayedOff(resId);
}

function downloadEarningsCSV() {
  const today = new Date();
  const rows = [['Date','Venue','Artist / Event','Source','Gross ($)','Deposit Released / Logged ($)','Status','Notes']];

  // GigNVenue history
  RESERVATIONS.filter(r => !r.hostGenerated && (r.status === 'completed' || r.status === 'cancelled'))
    .sort((a,b) => a.checkin.localeCompare(b.checkin))
    .forEach(r => {
      const cancelled = r.status === 'cancelled';
      rows.push([
        r.checkin,
        r.property,
        r.bandName ? `${r.guest} / ${r.bandName}` : r.guest,
        'GigNVenue',
        cancelled ? '' : r.total,
        cancelled ? '' : Math.round(r.total * 0.20),
        cancelled ? 'Cancelled' : 'Released',
        ''
      ]);
    });

  // Self-managed
  RESERVATIONS.filter(r => r.hostGenerated && r.status !== 'cancelled' && new Date(r.checkin + 'T00:00:00') < today)
    .sort((a,b) => a.checkin.localeCompare(b.checkin))
    .forEach(r => {
      const venueId = getVenueIdForReservation(r);
      const entry   = venueId ? (MANUAL_CAL_ENTRIES[venueId] || {})[r.checkin] : null;
      rows.push([
        r.checkin,
        r.property,
        r.guest,
        'Self-managed',
        entry?.earnings || '',
        entry?.earnings || '',
        entry?.earnings ? 'Logged' : 'Not logged',
        entry?.earningsNotes || ''
      ]);
    });

  const csv = rows.map(row =>
    row.map(cell => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `gignvenue-earnings-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderEarnings() {
  const today = new Date();
  const yr    = today.getFullYear().toString();

  // GigNVenue-facilitated earnings
  const gnvCompleted = RESERVATIONS.filter(r => !r.hostGenerated && r.status === 'completed');
  const gnvAllTime   = gnvCompleted.reduce((s, r) => s + r.total, 0);
  const gnvThisYear  = gnvCompleted.filter(r => r.checkin.startsWith(yr)).reduce((s, r) => s + r.total, 0);

  // Self-managed (manually logged) earnings
  const { allTime: manualAllTime, thisYear: manualThisYear } = getAllLoggedEarnings();

  const totalAllTime  = Math.round(gnvAllTime  + manualAllTime);
  const totalThisYear = Math.round(gnvThisYear + manualThisYear);

  // GigNVenue confirmed bookings with deposit in escrow (upcoming + awaiting confirmation)
  const todayIso    = today.toISOString().slice(0, 10);
  const allEscrow   = RESERVATIONS.filter(r => !r.hostGenerated && r.status === 'confirmed');
  const awaitingConf = allEscrow.filter(r => r.checkin < todayIso);   // show date passed — needs confirmation
  const upcoming    = allEscrow.filter(r => r.checkin >= todayIso);   // not yet happened
  const escrowTotal = allEscrow.reduce((sum, r) => sum + r.total * 0.20, 0);
  const nextUp      = [...upcoming].sort((a,b) => new Date(a.checkin) - new Date(b.checkin))[0];

  document.getElementById('earningsStatsGrid').innerHTML = [
    { icon:'💰', label:'Total earned (all time)', value:`$${totalAllTime.toLocaleString()}`,  delta:'GigNVenue + self-managed', deltaClass:'delta-up',      color:'#FF2D78' },
    { icon:'📅', label:`This year (${yr})`,        value:`$${totalThisYear.toLocaleString()}`, delta:'Jan – Mar · all sources',  deltaClass:'delta-up',      color:'#3B82F6' },
    { icon:'🏦', label:'Deposits in escrow',        value:`$${Math.round(escrowTotal).toLocaleString()}`, delta:`${allEscrow.length} show${allEscrow.length!==1?'s':''}${awaitingConf.length ? ` · ${awaitingConf.length} need confirmation` : ''}`, deltaClass: awaitingConf.length ? 'delta-pending' : 'delta-neutral', color:'#10B981' },
    { icon:'📊', label:'Next deposit release',      value: nextUp ? `$${Math.round(nextUp.total*0.20).toLocaleString()}` : '—', delta: nextUp ? `after ${fmt(nextUp.checkin)}` : 'No upcoming shows', deltaClass:'delta-pending', color:'#F59E0B' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-card-accent" style="background:${s.color}"></div>
      <div class="stat-card-icon" style="background:${s.color}22">${s.icon}</div>
      <div class="stat-card-value">${s.value}</div>
      <div class="stat-card-label">${s.label}</div>
      <span class="stat-card-delta ${s.deltaClass}">${s.deltaClass==='delta-up'?'▲ ':''}${s.delta}</span>
    </div>`).join('');

  // Deposits in escrow table
  const escrowRows = [
    // Shows needing confirmation (past) — sorted most recent first
    ...[...awaitingConf].sort((a,b) => new Date(b.checkin) - new Date(a.checkin)).map(r => `
        <tr style="background:rgba(245,158,11,0.05)">
          <td>${fmt(r.checkin)}</td>
          <td>${r.property}</td>
          <td>${r.guest}${r.bandName ? ` <span style="color:var(--text-muted);font-size:12px">/ ${r.bandName}</span>` : ''}</td>
          <td>$${r.total.toLocaleString()}</td>
          <td><strong>$${Math.round(r.total * 0.20).toLocaleString()}</strong></td>
          <td>
            <button class="res-action-btn confirm-played-btn" onclick="confirmShowPlayed('${r.id}')">✓ Confirm played</button>
          </td>
        </tr>`),
    // Upcoming shows — sorted soonest first
    ...[...upcoming].sort((a,b) => new Date(a.checkin) - new Date(b.checkin)).map(r => `
        <tr>
          <td>${fmt(r.checkin)}</td>
          <td>${r.property}</td>
          <td>${r.guest}${r.bandName ? ` <span style="color:var(--text-muted);font-size:12px">/ ${r.bandName}</span>` : ''}</td>
          <td>$${r.total.toLocaleString()}</td>
          <td><strong>$${Math.round(r.total * 0.20).toLocaleString()}</strong></td>
          <td><span class="status-badge status-confirmed">Held</span></td>
        </tr>`),
  ];
  document.getElementById('escrowTable').innerHTML = escrowRows.length
    ? escrowRows.join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No deposits currently in escrow</td></tr>';

  // Self-managed shows table
  const selfManaged = RESERVATIONS
    .filter(r => r.hostGenerated && r.status !== 'cancelled' && new Date(r.checkin + 'T00:00:00') < today)
    .sort((a,b) => new Date(b.checkin) - new Date(a.checkin));

  document.getElementById('selfManagedTable').innerHTML = selfManaged.length
    ? selfManaged.map(r => {
        const venueId = getVenueIdForReservation(r);
        const entry   = venueId ? (MANUAL_CAL_ENTRIES[venueId] || {})[r.checkin] : null;
        const logged  = entry?.earnings;
        const vid     = venueId || '';
        const iso     = r.checkin;
        const artist  = r.guest.replace(/'/g,"\\'");
        const venue   = r.property.replace(/'/g,"\\'");
        return `
        <tr>
          <td>${fmt(r.checkin)}</td>
          <td>${r.property}</td>
          <td>${r.guest}</td>
          <td>${logged ? `<strong>$${logged.toLocaleString()}</strong>` : '<span style="color:var(--text-muted)">—</span>'}</td>
          <td><button class="res-action-btn" onclick="openLogEarningsModal('${r.id}','${vid}','${iso}','${artist}','${venue}')">${logged ? 'Edit' : 'Log earnings'}</button></td>
          <td style="font-size:12px;color:var(--text-muted)">${entry?.earningsNotes || ''}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No past self-managed shows yet. Add shows to your calendar and log their earnings here.</td></tr>';

  // GigNVenue payout history
  const gnvHistory = RESERVATIONS.filter(r => !r.hostGenerated && (r.status === 'completed' || r.status === 'cancelled'));
  document.getElementById('payoutTable').innerHTML = gnvHistory.length
    ? gnvHistory.map(r => {
        const isCancelled = r.status === 'cancelled';
        return `
        <tr>
          <td>${fmt(r.checkin)}</td>
          <td>${r.property}</td>
          <td>${r.guest}${r.bandName ? ` <span style="color:var(--text-muted);font-size:12px">/ ${r.bandName}</span>` : ''}</td>
          <td>${isCancelled ? '<span style="color:var(--text-muted)">—</span>' : `$${r.total.toLocaleString()}`}</td>
          <td>${isCancelled ? '<span style="color:var(--text-muted)">—</span>' : `$${Math.round(r.total * 0.20).toLocaleString()}`}</td>
          <td><span class="status-badge ${isCancelled ? 'status-cancelled' : 'status-completed'}">${isCancelled ? 'Cancelled' : 'Released'}</span></td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No completed payouts yet</td></tr>';
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

function renderReviews() {
  const avg = (REVIEWS_DATA.reduce((a,r)=>a+r.rating,0)/REVIEWS_DATA.length).toFixed(2);
  const counts = [5,4,3,2,1].map(s => REVIEWS_DATA.filter(r=>r.rating===s).length);
  const total  = REVIEWS_DATA.length;

  document.getElementById('reviewsSummary').innerHTML = `
    <div>
      <div class="review-big-score">${avg}</div>
      <div class="review-stars">
        ${[1,2,3,4,5].map(()=>`<svg viewBox="0 0 32 32" width="20" height="20"><path fill="#F59E0B" d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.483-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.124-8.885a1 1 0 0 0-1.817 0z"/></svg>`).join('')}
      </div>
      <div style="font-size:14px;color:var(--text-muted)">${total} reviews</div>
    </div>
    <div class="review-bars">
      ${[5,4,3,2,1].map((s,i)=>`
        <div class="review-bar-row">
          <span>${s} stars</span>
          <div class="review-bar-track"><div class="review-bar-fill" style="width:${total?counts[i]/total*100:0}%"></div></div>
          <span>${counts[i]}</span>
        </div>`).join('')}
    </div>
  `;

  document.getElementById('reviewsList').innerHTML = REVIEWS_DATA.map((r,i) => `
    <div class="review-card">
      <div class="review-card-top">
        <img src="${r.guestImg}" alt="${r.guest}" class="review-avatar" onerror="this.style.background='#1C1C1C'"/>
        <div>
          <div class="review-name">${r.guest}</div>
          <div class="review-date">${r.date} · ${r.property}</div>
        </div>
        <div class="review-stars-sm" style="margin-left:auto">
          ${[1,2,3,4,5].map(s=>`<svg viewBox="0 0 32 32" width="14" height="14" fill="${s<=r.rating?'#F59E0B':'#333'}"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.483-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.124-8.885a1 1 0 0 0-1.817 0z"/></svg>`).join('')}
        </div>
      </div>
      <p class="review-text">"${r.text}"</p>
      ${r.replied
        ? `<div class="review-reply"><strong>Your response</strong>${r.reply}</div>`
        : `<button class="review-reply-btn" onclick="replyToReview(${i})">Reply to ${r.guest.split(' ')[0]}</button>`}
    </div>`).join('');
}

function replyToReview(idx) {
  const reply = prompt(`Reply to ${REVIEWS_DATA[idx].guest}:`);
  if (reply && reply.trim()) {
    REVIEWS_DATA[idx].replied = true;
    REVIEWS_DATA[idx].reply   = reply.trim();
    renderReviews();
    showDash('Reply posted!');
  }
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

function populateProfile() {
  document.getElementById('profileAvatar').src = user.avatar;
  document.getElementById('pfFirst').value  = user.firstName || '';
  document.getElementById('pfLast').value   = user.lastName  || '';
  document.getElementById('pfEmail').value  = user.email     || '';
  document.getElementById('pfPhone').value  = user.phone     || '';

  _applyVisToggle('email', !!user.showEmail);
  _applyVisToggle('phone', !!user.showPhone);

}

function _applyVisToggle(field, shown) {
  const cb = document.getElementById(`${field}VisToggle`);
  if (cb) cb.checked = shown;
}

function toggleContactVis(field) {
  const cb = document.getElementById(`${field}VisToggle`);
  if (!cb) return;
  if (field === 'email') user.showEmail = cb.checked;
  else                   user.showPhone = cb.checked;
  Auth.updateProfile({ showEmail: user.showEmail, showPhone: user.showPhone });
}

function saveProfile(e) {
  e.preventDefault();
  const updates = {
    firstName : document.getElementById('pfFirst').value.trim(),
    lastName  : document.getElementById('pfLast').value.trim(),
    email     : document.getElementById('pfEmail').value.trim(),
    phone     : document.getElementById('pfPhone').value.trim(),
  };
  const newPw = document.getElementById('pfNewPw').value;
  const conf  = document.getElementById('pfConfirmPw').value;
  if (newPw) {
    if (newPw !== conf) { showDash('Passwords do not match.'); return; }
    updates.password = newPw;
  }
  Auth.updateProfile(updates);
  populateSidebarUser();
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
    Auth.updateProfile({ avatar: ev.target.result });
    populateSidebarUser();
    populateTopbarAvatar();
    showDash('Profile photo updated!');
  };
  reader.readAsDataURL(file);
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function fmt(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function fmtTs(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
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
