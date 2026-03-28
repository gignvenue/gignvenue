/* ============================================
   VENUE FINDER — MAIN APP
   Dark music-venue theme · Leaflet map
   Amenity data model · Full filtering
   ============================================ */

'use strict';

// ─── AMENITIES DATA MODEL ────────────────────────────────────────────────────

const AMENITIES = {
  'Stage & Sound': [
    { id:'pro_sound',   label:'Professional sound system' },
    { id:'stage',       label:'Dedicated stage' },
    { id:'backline',    label:'Backline equipment' },
    { id:'monitors',    label:'Stage monitors' },
    { id:'pa_system',   label:'PA system included' },
    { id:'piano',       label:'Grand piano' },
    { id:'drums',       label:'House drum kit' },
    { id:'recording',   label:'Recording capability' },
  ],
  'Lighting & Production': [
    { id:'stage_lights', label:'Stage lighting rig' },
    { id:'laser_show',   label:'Laser show system' },
    { id:'followspot',   label:'Follow spotlights' },
    { id:'led_wall',     label:'LED video wall' },
    { id:'fog_machine',  label:'Fog / haze machines' },
    { id:'projection',   label:'Projection system' },
  ],
  'Venue Features': [
    { id:'bar',          label:'Full bar service' },
    { id:'vip_area',     label:'VIP area' },
    { id:'green_room',   label:'Green room / dressing rooms' },
    { id:'outdoor',      label:'Outdoor / open air' },
    { id:'rooftop',      label:'Rooftop space' },
    { id:'seated',       label:'Seated capacity' },
    { id:'standing',     label:'Standing floor' },
    { id:'coat_check',   label:'Coat check' },
    { id:'accessibility',label:'Wheelchair accessible' },
  ],
  'Hospitality': [
    { id:'catering',     label:'Catering available' },
    { id:'private_bar',  label:'Private bar in green room' },
    { id:'rider_honored',label:'Rider honored' },
    { id:'parking',      label:'Parking on-site' },
    { id:'load_in',      label:'Load-in / dock access' },
    { id:'wifi',         label:'High-speed WiFi' },
    { id:'security',     label:'Security staff included' },
    { id:'box_office',   label:'Box office / ticketing' },
  ],
};

// ─── AMENITY ICONS ───────────────────────────────────────────────────────────

const AMENITY_ICONS = {
  pro_sound:    'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  stage:        'M3 20h18M5 20V10l7-7 7 7v10M10 20v-5h4v5',
  stage_lights: 'M12 2L8 8H4l3 4-1.5 5L12 14l6.5 3L17 12l3-4h-4L12 2z',
  backline:     'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v12m0 0H5a2 2 0 01-2-2V9m6 6h10a2 2 0 002-2V9m-6 6v3m0 0H9m3 0h3',
  monitors:     'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  piano:        'M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4M9 17v4m6-4v4M9 21h6',
  drums:        'M12 6V3m0 0L9 5m3-2l3 2M5 10a7 7 0 0114 0v1H5v-1zm1 4h12M7 20h10M8 14v6m8-6v6',
  recording:    'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-18a7 7 0 017 7H5a7 7 0 017-7z',
  laser_show:   'M13 10V3L4 14h7v7l9-11h-7z',
  followspot:   'M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M1 12h2m18 0h2M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z',
  led_wall:     'M4 6h16M4 10h16M4 14h16M4 18h16',
  fog_machine:  'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z',
  projection:   'M15 10l4.553-2.069A1 1 0 0121 8.873v6.254a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  bar:          'M9 3H5v18h14V3h-4M9 3V1h6v2M9 3h6m-3 6v8m-3-4h6',
  vip_area:     'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  green_room:   'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  outdoor:      'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  rooftop:      'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  seated:       'M5 3v4M3 5h4M6 17v4m-2-2h4M13 3l4 4-4 4M17 7H7m6 10l4 4-4 4M17 17H7',
  standing:     'M12 3a2 2 0 100 4 2 2 0 000-4zM10 9l-2 4h8l-2-4m-4 0h4m-2 4v8',
  coat_check:   'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  accessibility:'M12 3a1 1 0 100 2 1 1 0 000-2zM6 8l6-2 6 2m-6-2v4m0 0l-4 7h8l-4-7m4 7v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2',
  catering:     'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  private_bar:  'M8 5v14l8-7-8-7z',
  rider_honored:'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  parking:      'M8 7h4a4 4 0 010 8H8V7zm0 0H6m2 8H6m0-8v8',
  load_in:      'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  wifi:         'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
  security:     'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  box_office:   'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  pa_system:    'M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M6.343 6.343a8 8 0 000 11.314M17.657 6.343a8 8 0 010 11.314',
};

const AMENITY_ICON_DEFAULT = 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3';

function amenityIcon(id) {
  const d = AMENITY_ICONS[id] || AMENITY_ICON_DEFAULT;
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#EF60A3" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

// ─── LISTINGS / VENUES ────────────────────────────────────────────────────────

const LISTINGS = [
  {
    id: 1,
    title: 'The Neon Stage',
    location: '6801 Hollywood Blvd, Hollywood, CA',
    subtitle: 'Hosted by Sarah M.',
    dates: 'Available now',
    price: 2100,
    weekdayRates: {0:1800,1:1800,2:1800,3:1800,4:2100,5:2800,6:2400},
    priceUnit: 'night',
    capacity: 500,
    badge: null,
    category: 'clubs',
    lat: 34.0928, lng: -118.3287,
    images: [
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','stage_lights','bar','vip_area','green_room'],
    amenityDescs: {
      pro_sound:    'State-of-the-art PA with front fills and side hangs',
      stage:        '40ft wide elevated stage with full wing access',
      stage_lights: 'Full moving-head rig with haze and follow spots',
      green_room:   'Private dressing suite with private bathroom and hospitality',
    },
    featuredAmenities: ['pro_sound', 'stage_lights', 'green_room'],
    cancellationPolicy: 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Sarah Johnson', years:5, superhost:true, img:'https://randomuser.me/api/portraits/women/44.jpg' },
    description: 'Iconic Hollywood venue with state-of-the-art sound and lights. A boutique 500-capacity club with impeccable acoustics, professional stage, full backline, and a dedicated green room that keeps artists comfortable.',
    highlights: [
      { title:'Pro sound system', desc:'State-of-the-art PA with front fills and side hangs' },
      { title:'Full production', desc:'Stage lighting rig, LED wash, and backline available' },
      { title:'Green room included', desc:'Private artist lounge with hospitality' },
    ],
  },
  {
    id: 2,
    title: 'Velvet Lounge',
    location: '218 Bedford Ave, Brooklyn, NY',
    subtitle: 'Hosted by James K.',
    dates: 'Available now',
    price: 1300,
    weekdayRates: {0:1200,1:1100,2:1100,3:1100,4:1300,5:1800,6:1600},
    priceUnit: 'night',
    capacity: 200,
    badge: null,
    category: 'jazz',
    lat: 40.7173, lng: -73.9573,
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    ],
    amenities: ['pro_sound','piano','bar','seated','accessibility'],
    cancellationPolicy: 'Cancellations more than 21 days before the event date are eligible for a full deposit refund. Cancellations within 21 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'James K.', years:5, superhost:false, img:'https://api.dicebear.com/7.x/initials/svg?seed=James%20K&backgroundColor=3B82F6&textColor=ffffff' },
    description: 'Intimate jazz club with incredible acoustics and cozy vibes. A beloved Brooklyn institution offering a 200-capacity room with impeccable sound, a baby grand piano, and a warm atmosphere that makes every act sound their best.',
    highlights: [
      { title:'Intimate atmosphere', desc:'200-cap room with perfect sightlines from every seat' },
      { title:'Baby grand piano', desc:'In-tune house piano available for all bookings' },
      { title:'Exceptional acoustics', desc:'Naturally tuned room beloved by jazz artists' },
    ],
  },
  {
    id: 3,
    title: 'Rooftop Sessions',
    location: '432 W 45th St, New York, NY',
    subtitle: 'Hosted by Maria L.',
    dates: 'Available now',
    price: 3500,
    priceUnit: 'night',
    capacity: 120,
    badge: null,
    category: 'rooftops',
    active: false,
    lat: 40.7614, lng: -73.9937,
    images: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
      'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    ],
    amenities: ['pro_sound','outdoor','rooftop','bar','vip_area','security'],
    cancellationPolicy: 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Maria L.', years:3, superhost:false, img:'https://api.dicebear.com/7.x/initials/svg?seed=Maria%20L&backgroundColor=8B5CF6&textColor=ffffff' },
    description: 'Open-air rooftop with stunning skyline views and premium sound. A boutique 120-cap rooftop above Midtown Manhattan — perfect for intimate concerts, album launches, and private events with NYC\'s skyline as the backdrop.',
    highlights: [
      { title:'Skyline views', desc:'Panoramic NYC backdrop for unforgettable shows' },
      { title:'Intimate capacity', desc:'120-guest max for exclusive, premium events' },
      { title:'Premium outdoor sound', desc:'Weather-rated PA system, all-season ready' },
    ],
  },
  {
    id: 4,
    title: 'The Midnight Rooftop',
    location: '230 W 39th St, New York, NY',
    subtitle: 'Hosted by Skyline Spaces',
    dates: 'Year-round',
    price: 3600,
    priceUnit: 'night',
    capacity: 250,
    rating: 4.88,
    reviews: 341,
    badge: null,
    category: 'rooftops',
    lat: 40.7505, lng: -73.9934,
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
    ],
    amenities: ['pro_sound','stage_lights','bar','vip_area','outdoor','rooftop','seated','standing','catering','private_bar','wifi','accessibility'],
    cancellationPolicy: 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Skyline Spaces', years:3, superhost:false, img:'https://randomuser.me/api/portraits/women/62.jpg' },
    description: 'Perched 40 stories above Manhattan with the full skyline as your backdrop. Intimate 250-cap rooftop with a retractable cover, professional sound, and full bar service. Perfect for album launches, private showcases, and brand events.',
    highlights: [
      { title:'Manhattan skyline views', desc:'360° panoramic backdrop for your show' },
      { title:'Intimate capacity', desc:'250-guest max for exclusive events' },
      { title:'Retractable cover', desc:'Weatherproof for year-round bookings' },
    ],
  },
  {
    id: 5,
    title: 'Blue Note Underground',
    location: '623 Frenchmen St, New Orleans, LA',
    subtitle: 'Hosted by Harlan J.',
    dates: 'Available Mar 20+',
    price: 1400,
    priceUnit: 'night',
    capacity: 180,
    rating: 4.95,
    reviews: 487,
    badge: 'Top venue',
    category: 'jazz',
    lat: 29.9511, lng: -90.0715,
    images: [
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
    ],
    amenities: ['piano','pro_sound','stage','monitors','bar','seated','green_room','recording','catering','rider_honored','wifi','accessibility'],
    cancellationPolicy: 'Cancellations more than 21 days before the event date are eligible for a full deposit refund. Cancellations within 21 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Harlan J.', years:12, superhost:true, img:'https://randomuser.me/api/portraits/men/28.jpg' },
    description: 'A Bourbon Street institution with 70 years of jazz history. Steinway grand piano, vintage Neve console for direct recording, and an atmosphere that has hosted legends from Louis Armstrong to Wynton Marsalis. Every show feels like history.',
    highlights: [
      { title:'Steinway Grand Piano', desc:'Vintage 9-ft concert grand, tuned weekly' },
      { title:'Recording ready', desc:'Neve console captures every performance' },
      { title:'70 years of history', desc:'New Orleans\' most storied jazz venue' },
    ],
  },
  {
    id: 6,
    title: 'Coachella Stage II Replica',
    location: '81800 Avenue 51, Indio, CA',
    subtitle: 'Hosted by Desert Events Co.',
    dates: 'Apr – Oct only',
    price: 8500,
    priceUnit: 'night',
    capacity: 5000,
    rating: 4.91,
    reviews: 44,
    badge: 'Iconic',
    category: 'festival',
    lat: 33.6823, lng: -116.2370,
    images: [
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','backline','stage_lights','led_wall','fog_machine','bar','vip_area','outdoor','standing','parking','load_in','box_office','security'],
    cancellationPolicy: 'Cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event date will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. Due to the scale of production and infrastructure required, no exceptions can be made. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Desert Events Co.', years:7, superhost:true, img:'https://randomuser.me/api/portraits/men/53.jpg' },
    description: 'A purpose-built outdoor festival ground in the Coachella Valley. 5,000-cap main stage with full Clair Brothers PA, LED horizon wall, and desert sunset views that are unlike anything else on earth.',
    highlights: [
      { title:'Clair Brothers PA', desc:'Festival-grade main stage sound system' },
      { title:'Iconic desert location', desc:'Coachella Valley sunsets as your backdrop' },
      { title:'Full festival infrastructure', desc:'Load-in docks, golf carts, and ground power' },
    ],
  },
  {
    id: 7,
    title: 'The Chicago Shrine',
    location: '3730 N Clark St, Chicago, IL',
    subtitle: 'Hosted by Lakeshore Music Group',
    dates: 'Year-round',
    price: 3200,
    priceUnit: 'night',
    capacity: 1500,
    rating: 4.96,
    reviews: 291,
    badge: 'Top venue',
    category: 'clubs',
    lat: 41.8957, lng: -87.6298,
    images: [
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','stage_lights','laser_show','led_wall','bar','vip_area','green_room','standing','seated','coat_check','security','wifi','accessibility','box_office'],
    cancellationPolicy: 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Lakeshore Music Group', years:8, superhost:true, img:'https://randomuser.me/api/portraits/women/11.jpg' },
    description: 'A former Uptown church converted into Chicago\'s most storied multi-room music complex. The main hall\'s soaring arched ceilings and original stonework create an acoustic environment that artists request by name — raw, resonant, and unlike anything else in the Midwest.',
    highlights: [
      { title:'Historic church conversion', desc:'Stunning early 1900s architecture intact' },
      { title:'Multi-room complex', desc:'3 separate spaces, 90 to 1,500 cap' },
      { title:'Chicago institution', desc:'Home stage for artists who define the city' },
    ],
  },
  {
    id: 8,
    title: 'The Ryman Stage',
    location: '116 5th Ave N, Nashville, TN',
    subtitle: 'Hosted by Ryman Heritage',
    dates: 'Available select dates',
    price: 6800,
    priceUnit: 'night',
    capacity: 2362,
    rating: 4.99,
    reviews: 103,
    badge: 'Iconic',
    category: 'theaters',
    lat: 36.1612, lng: -86.7765,
    images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','monitors','piano','stage_lights','projection','bar','seated','green_room','recording','coat_check','accessibility','box_office','load_in'],
    cancellationPolicy: 'Due to the historic and high-demand nature of this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Ryman Heritage', years:15, superhost:true, img:'https://randomuser.me/api/portraits/men/77.jpg' },
    description: 'The "Mother Church of Country Music" and one of the most recognizable stages on earth. Stunning 1892 architecture, pristine acoustics built over 130 years, and a history of performances that reads like a who\'s-who of American music.',
    highlights: [
      { title:'Mother Church of Country Music', desc:'130 years of legendary performances' },
      { title:'Unmatched acoustics', desc:'1892 architecture perfected over a century' },
      { title:'Historic seated theatre', desc:'Original church pews for 2,362 guests' },
    ],
  },
  {
    id: 9,
    title: 'Red Rocks Amphitheatre',
    location: '18300 W Alameda Pkwy, Morrison, CO',
    subtitle: 'Hosted by Denver Arts & Venues',
    dates: 'May – October',
    price: 22000,
    priceUnit: 'night',
    capacity: 9525,
    rating: 4.94,
    reviews: 38,
    badge: 'Iconic',
    category: 'amphitheaters',
    lat: 39.6655, lng: -105.2057,
    images: [
      'https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','backline','monitors','stage_lights','led_wall','followspot','laser_show','fog_machine','bar','vip_area','green_room','standing','seated','coat_check','security','box_office','load_in','parking','accessibility'],
    cancellationPolicy: 'Given the unique nature of this venue and the production commitments involved, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Denver Arts & Venues', years:9, superhost:true, img:'https://randomuser.me/api/portraits/women/33.jpg' },
    description: 'The greatest outdoor concert venue on earth — a naturally formed 9,525-capacity amphitheater carved into the Colorado Rockies. Towering 300-million-year-old red sandstone formations flank the stage, creating acoustics and visuals that no architect could design.',
    highlights: [
      { title:'300-million-year-old acoustics', desc:'Natural rock formations shape every note' },
      { title:'9,525 capacity', desc:'Terraced seating with sightlines from every row' },
      { title:'Colorado Rockies backdrop', desc:'The most iconic outdoor stage in the USA' },
    ],
  },
  {
    id: 10,
    title: 'The Corner Dive',
    location: '415 E 6th St, Austin, TX',
    subtitle: 'Hosted by Sixth Street Collective',
    dates: 'Year-round',
    price: 800,
    priceUnit: 'night',
    capacity: 120,
    rating: 4.82,
    reviews: 612,
    badge: null,
    category: 'dive-bars',
    lat: 30.2672, lng: -97.7431,
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','monitors','backline','drums','bar','standing','green_room','wifi'],
    cancellationPolicy: 'Cancellations more than 21 days before the event date are eligible for a full deposit refund. Cancellations within 21 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Sixth Street Collective', years:5, superhost:false, img:'https://randomuser.me/api/portraits/men/26.jpg' },
    description: 'The legendary dive bar where careers are launched. No frills — just a perfect-sounding room, a tight stage, and an audience that actually listens. Elbow room for 120, but it feels like you\'re playing for thousands.',
    highlights: [
      { title:'Where legends started', desc:'Dozens of artists broke out on this stage' },
      { title:'Legendary acoustics', desc:'The room has been tuned for 20 years' },
      { title:'House backline included', desc:'Vintage Marshall and Vox amps on stage' },
    ],
  },
  {
    id: 11,
    title: 'The Fox Theatre',
    location: '660 Peachtree St NE, Atlanta, GA',
    subtitle: 'Hosted by Atlanta Landmarks',
    dates: 'By application only',
    price: 18000,
    priceUnit: 'night',
    capacity: 2679,
    rating: 5.0,
    reviews: 21,
    badge: 'Iconic',
    category: 'theaters',
    lat: 33.7725, lng: -84.3857,
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','monitors','piano','stage_lights','followspot','projection','bar','seated','green_room','recording','coat_check','accessibility','box_office','load_in','security'],
    cancellationPolicy: 'Due to the historic significance and demand for this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Atlanta Landmarks', years:14, superhost:true, img:'https://randomuser.me/api/portraits/women/55.jpg' },
    description: 'Atlanta\'s crown jewel and one of the most breathtaking concert halls in America. The Fox Theatre\'s 1929 Moorish-Egyptian interior — with its starlit ceiling, ornate arches, and 4,678-pipe Möller organ — makes every performance feel like a once-in-a-career moment.',
    highlights: [
      { title:'1929 Moorish-Egyptian interior', desc:'One of America\'s most stunning concert halls' },
      { title:'Starlit ceiling', desc:'Hand-painted sky dome visible from every seat' },
      { title:'Historic 4,678-pipe organ', desc:'The Möller Grande Organ, fully operational' },
    ],
  },
  {
    id: 12,
    title: 'Fillmore West Revival',
    location: '1805 Geary Blvd, San Francisco, CA',
    subtitle: 'Hosted by Bay Area Shows',
    dates: 'Year-round',
    price: 3800,
    priceUnit: 'night',
    capacity: 1150,
    rating: 4.90,
    reviews: 179,
    badge: null,
    category: 'theaters',
    lat: 37.7841, lng: -122.4330,
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','stage_lights','led_wall','bar','vip_area','green_room','standing','coat_check','security','wifi','accessibility'],
    cancellationPolicy: 'Cancellations more than 30 days before the event date are eligible for a full deposit refund. Cancellations within 30 days but more than 7 days before the event date will forfeit 50% of the deposit. Cancellations within 7 days of the event date forfeit the deposit in full. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Bay Area Shows', years:6, superhost:true, img:'https://randomuser.me/api/portraits/men/62.jpg' },
    description: 'A spiritual successor to Bill Graham\'s legendary venue. Exposed brick, psychedelic poster art covering every wall, and a floor plan that puts every single person within 80 feet of the stage. San Francisco music royalty.',
    highlights: [
      { title:'Bill Graham heritage', desc:'Continuing a 60-year SF music tradition' },
      { title:'80 feet to the stage', desc:'Intimate sightlines in every spot' },
      { title:'Famous poster collection', desc:'Iconic psychedelic art adorns every wall' },
    ],
  },
  {
    id: 13,
    title: 'The Summit Arena',
    location: '1510 Polk St, Houston, TX',
    subtitle: 'Hosted by Houston Live Events',
    dates: 'Year-round',
    price: 28000,
    priceUnit: 'night',
    capacity: 16000,
    rating: 4.87,
    reviews: 57,
    badge: 'Iconic',
    category: 'arenas',
    lat: 29.7490, lng: -95.3677,
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    ],
    amenities: ['pro_sound','stage','backline','monitors','stage_lights','led_wall','followspot','laser_show','fog_machine','bar','vip_area','green_room','standing','seated','coat_check','security','box_office','load_in','parking','accessibility','wifi'],
    cancellationPolicy: 'Due to the scale of production commitments at this venue, cancellations more than 60 days before the event date are eligible for a full deposit refund. Cancellations within 60 days but more than 14 days before the event will forfeit 50% of the deposit. Cancellations within 14 days of the event date forfeit the deposit in full. No exceptions. The GigNVenue booking fee is non-refundable in all cases.',
    host: { name:'Houston Live Events', years:11, superhost:true, img:'https://randomuser.me/api/portraits/men/41.jpg' },
    description: 'Houston\'s premier indoor arena — 16,000 seats of pure spectacle. A fully rigged production house with a 360° LED ceiling, 48-point rigging grid, and a stage that has welcomed everyone from stadium rock acts to sold-out residencies. If you\'re ready to play at this scale, this is your room.',
    highlights: [
      { title:'360° LED ceiling', desc:'Full arena roof wrapped in programmable display panels' },
      { title:'16,000-seat capacity', desc:'Tiered bowl seating with unobstructed views throughout' },
      { title:'48-point rigging grid', desc:'Full production fly system for large touring shows' },
    ],
  },
];

// ─── VENUE TIMEZONES ──────────────────────────────────────────────────────────
// Keyed by listing id; used to determine "today" and display dates in the
// correct local time for the venue rather than the visitor's browser timezone.
const VENUE_TIMEZONES = {
  1:  'America/Los_Angeles', // The Neon Stage         — Hollywood, CA
  2:  'America/New_York',    // Velvet Lounge           — Brooklyn, NY
  3:  'America/New_York',    // Rooftop Sessions        — New York, NY
  4:  'America/New_York',    // The Midnight Rooftop    — Manhattan, NY
  5:  'America/Chicago',     // Blue Note Underground   — New Orleans, LA
  6:  'America/Los_Angeles', // Coachella Stage II      — Indio, CA
  7:  'America/Chicago',     // The Chicago Shrine      — Chicago, IL
  8:  'America/Chicago',     // The Ryman Stage         — Nashville, TN
  9:  'America/Denver',      // Red Rocks Amphitheatre  — Morrison, CO
  10: 'America/Chicago',     // The Corner Dive         — Austin, TX
  11: 'America/New_York',    // The Fox Theatre         — Atlanta, GA
  12: 'America/Los_Angeles', // Fillmore West Revival   — San Francisco, CA
  13: 'America/Chicago',     // The Summit Arena         — Houston, TX
};

// Maps numeric listing IDs back to the booker-dashboard venue string IDs
// (used to cross-reference the artist's requests from bb_my_requests)
const LISTING_TO_BOOKER_VENUE = { 1:'l1', 2:'l2', 3:'l3', 4:'l4', 5:'l5', 6:'l6', 7:'l7', 8:'l8', 9:'l9', 10:'l10', 11:'l11', 12:'l12', 13:'l13' };

// Returns today's ISO date (YYYY-MM-DD) in the venue's local timezone.
function venueToday(tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date());
}

// Formats an ISO date string for display without any UTC-parsing shift.
function fmtIso(iso, opts) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id:'all',          label:'All Venues',    emoji:'🎸' },
  { id:'amphitheaters',label:'Amphitheaters', emoji:'🏟' },
  { id:'clubs',        label:'Clubs',         emoji:'🎛' },
  { id:'arenas',       label:'Arenas',        emoji:'⚡' },
  { id:'rooftops',     label:'Rooftops',      emoji:'🌃' },
  { id:'jazz',         label:'Jazz Clubs',    emoji:'🎷' },
  { id:'festival',     label:'Festival',      emoji:'🎪' },
  { id:'theaters',     label:'Theaters',      emoji:'🎭' },
  { id:'dive-bars',    label:'Dive Bars',     emoji:'🍺' },
];

// ─── PAGINATION ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
let _currentPage = 1;
let _currentResults = [];
let _sortOrder = 'recommended';

function venueHasFeaturedNight(venueId) {
  try {
    const nights = JSON.parse(localStorage.getItem('bb_featured_nights') || '[]');
    const today = new Date().toISOString().slice(0, 10);
    return nights.some(fn => String(fn.venueId) === String(venueId) && fn.iso >= today);
  } catch(e) { return false; }
}

// Returns the badge a listing should display.
// Iconic = editorial only (hardcoded). Top venue = auto-awarded at 4.8+/50+.
function getEffectiveBadge(l) {
  if (l.badge === 'Iconic') return 'Iconic';
  if ((l.rating >= 4.8 && (l.reviews || 0) >= 50) || l.badge === 'Top venue') return 'Top venue';
  return null;
}

function recommendedScore(l) {
  const featured    = venueHasFeaturedNight(l.id) ? 10 : 0;
  const promoted    = l.promoted ? 8 : 0;
  const badge       = getEffectiveBadge(l);
  const badgeBoost  = badge === 'Iconic' ? 3 : badge ? 2 : 0;
  const reviews     = l.reviews || 0;
  const rating      = l.rating  || 0;
  const ratingScore = rating * Math.min(reviews, 100) / 100;
  const superhost   = l.host?.superhost ? 0.5 : 0;
  return featured + promoted + badgeBoost + ratingScore + superhost;
}

function sortListings(results) {
  const r = [...results];
  switch (_sortOrder) {
    case 'price_asc':      return r.sort((a, b) => a.price - b.price);
    case 'price_desc':     return r.sort((a, b) => b.price - a.price);
    case 'capacity_asc':   return r.sort((a, b) => a.capacity - b.capacity);
    case 'capacity_desc':  return r.sort((a, b) => b.capacity - a.capacity);
    case 'rating':         return r.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:               return r.sort((a, b) => recommendedScore(b) - recommendedScore(a));
  }
}

function setSortOrder(val) {
  _sortOrder = val;
  _currentPage = 1;
  renderListings(sortListings(_currentResults), _currentPage);
}

// ─── FILTER STATE ─────────────────────────────────────────────────────────────

const filterState = {
  category   : 'all',
  priceMin   : 0,
  priceMax   : 25000,
  capacityMin: 0,
  capacityMax: 15000,
  amenities  : new Set(),
  checkin    : null,
  checkout   : null,
  location   : '',
  lat        : null,
  lng        : null,
  radius     : 0,
  query      : '',
};

// ─── DOM STATE ────────────────────────────────────────────────────────────────

let _venueMap = null;

const appState = {
  wishlist        : new Set(),
  activeImageIndex: {},
  selectedListing : null,
  mapOpen         : false,
  map             : null,
  markers         : [],
  currentMonth    : new Date().getMonth(),
  currentYear     : new Date().getFullYear(),
  selectedDates   : [],
  guests          : { adults:1, children:0, infants:0, pets:0 },
};

// ─── HOST LISTINGS MERGE ──────────────────────────────────────────────────────

const HOST_ID_MAP = { l1: 1, l2: 2, l3: 3 };

function mergeHostListings() {
  try {
    const hostListings = JSON.parse(localStorage.getItem('bb_host_listings') || '[]');
    hostListings.forEach(hl => {
      const targetId = HOST_ID_MAP[hl.id];
      if (targetId !== undefined) {
        const listing = LISTINGS.find(l => l.id === targetId);
        if (listing) {
          listing.title    = hl.title;
          listing.location = hl.location;
          listing.price    = hl.price;
          listing.capacity = hl.capacity;
          if (hl.dates)    listing.dates    = hl.dates;
          listing.description = hl.desc || listing.description;
          listing.amenities   = hl.amenities || listing.amenities;
          listing.active      = hl.active;
          if (hl.img)           listing.images[0]       = hl.img;
          if (hl.hostName)      listing.host.name        = hl.hostName;
          if (hl.hostImg)       listing.host.img         = hl.hostImg;
          listing.host.email     = hl.hostEmail     || '';
          listing.host.phone     = hl.hostPhone     || '';
          listing.host.showEmail = hl.hostShowEmail || false;
          listing.host.showPhone = hl.hostShowPhone || false;
          if (hl.amenityDescs)      listing.amenityDescs      = hl.amenityDescs;
          if (hl.featuredAmenities) listing.featuredAmenities = hl.featuredAmenities;
          if (hl.customHighlights)  listing.customHighlights  = hl.customHighlights;
          listing.promoted = hl.promoted || false;
          listing.roomRentalEnabled = hl.roomRentalEnabled || false;
          listing.roomRentalPrice   = hl.roomRentalPrice   || 0;
          listing.roomRentalDesc    = hl.roomRentalDesc    || '';
          listing.bookingDesc       = hl.bookingDesc       || '';
          listing.weekdayRates  = hl.weekdayRates  || null;
          listing.dateOverrides = hl.dateOverrides || null;
        }
      } else {
        if (!LISTINGS.find(l => l.id === hl.id)) {
          LISTINGS.push({
            id: hl.id, title: hl.title, location: hl.location,
            price: hl.price, capacity: hl.capacity,
            dates: hl.dates || 'Available now',
            category: hl.type || 'clubs',
            images: [hl.img || ''],
            amenities:         hl.amenities || [],
            amenityDescs:      hl.amenityDescs || {},
            featuredAmenities: hl.featuredAmenities || [],
            description: hl.desc || '',
            highlights: [],
            host: { name:'Host', years:1, superhost:false, img:'' },
            active: hl.active !== false,
            roomRentalEnabled: hl.roomRentalEnabled || false,
            roomRentalPrice:   hl.roomRentalPrice   || 0,
            roomRentalDesc:    hl.roomRentalDesc    || '',
            bookingDesc:       hl.bookingDesc       || '',
          });
        }
      }
    });
  } catch(e) {}
}

function resolveNightlyRate(l, iso) {
  if (l.dateOverrides?.[iso] !== undefined) return l.dateOverrides[iso];
  if (l.weekdayRates) {
    const dow = new Date(iso + 'T00:00:00').getDay();
    if (l.weekdayRates[dow] !== undefined) return l.weekdayRates[dow];
  }
  return l.price;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

// Normalize venue IDs — the booker dashboard uses 'l1'-style strings; app.js uses numbers
function normalizeVenueId(id) {
  if (typeof id === 'string' && /^l\d+$/.test(id)) return parseInt(id.slice(1));
  const n = parseInt(id);
  return isNaN(n) ? id : n;
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved venues so hearts render correctly on load
  try {
    JSON.parse(localStorage.getItem('bb_saved_venues') || '[]')
      .forEach(v => appState.wishlist.add(normalizeVenueId(v.id)));
  } catch(e) {}

  mergeHostListings();

  renderCategoryBar();
  renderSkeletons();
  setTimeout(() => {
    applyFilters();
    renderCalendars();
    initSearchBackdrop();
    buildAmenityList();
    // Deep-link: ?venue=l1 or ?venue=1 opens that listing's profile immediately
    const vParam = new URLSearchParams(location.search).get('venue');
    if (vParam) {
      const id = normalizeVenueId(vParam) || (Object.entries(HOST_ID_MAP).find(([k]) => k === vParam)?.[1] ?? vParam);
      openListing(id);
    }
  }, 600);
});

// ─── SKELETON ────────────────────────────────────────────────────────────────

function renderSkeletons() {
  const grid = document.getElementById('listingsGrid');
  grid.innerHTML = Array.from({ length:12 }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text w-80" style="margin-top:12px"></div>
      <div class="skeleton skeleton-text w-60"></div>
      <div class="skeleton skeleton-text w-40"></div>
    </div>`).join('');
}

// ─── CATEGORY BAR ────────────────────────────────────────────────────────────

function renderCategoryBar() {
  const el = document.getElementById('categories');
  el.innerHTML = CATEGORIES.map(c => `
    <button class="category${c.id==='all'?' active':''}" data-cat="${c.id}" onclick="selectCategory('${c.id}',this)">
      <span class="cat-emoji">${c.emoji}</span>
      <span>${c.label}</span>
    </button>`).join('');
}

function selectCategory(id, btn) {
  document.querySelectorAll('.category').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterState.category = id;
  renderSkeletons();
  setTimeout(() => applyFilters(), 400);
}

// Called from venue type chip in modal — closes modal, activates the matching filter button
function filterByCategory(catId) {
  closeListing();
  const btn = document.querySelector(`.category[data-cat="${catId}"]`);
  if (btn) {
    document.querySelectorAll('.category').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterState.category = catId;
    document.getElementById('listingsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderSkeletons();
    setTimeout(() => applyFilters(), 400);
  }
}

// ─── FILTER LOGIC ─────────────────────────────────────────────────────────────

// ─── SAVED SEARCHES ───────────────────────────────────────────────────────────

function isFilterActive() {
  return filterState.category !== 'all'
    || filterState.priceMax < 25000
    || filterState.capacityMin > 0
    || filterState.amenities.size > 0
    || !!filterState.location
    || !!filterState.checkin;
}

function saveCurrentSearch() {
  const searches = (() => { try { return JSON.parse(localStorage.getItem('bb_saved_searches') || '[]'); } catch(e) { return []; } })();
  const snap = {
    category    : filterState.category,
    priceMin    : filterState.priceMin,
    priceMax    : filterState.priceMax,
    capacityMin : filterState.capacityMin,
    capacityMax : filterState.capacityMax,
    amenities   : [...filterState.amenities],
    location    : filterState.location,
    checkin     : filterState.checkin,
    savedAt     : Date.now(),
  };
  // Avoid exact duplicates
  const isDupe = searches.some(s =>
    s.category === snap.category && s.location === snap.location &&
    s.priceMax === snap.priceMax && s.capacityMin === snap.capacityMin
  );
  if (!isDupe) {
    searches.push(snap);
    try { localStorage.setItem('bb_saved_searches', JSON.stringify(searches)); } catch(e) {}
  }
  const btn = document.getElementById('saveSearchBar')?.querySelector('.save-search-btn');
  if (btn) { btn.textContent = '✓ Saved'; btn.disabled = true; }
  setTimeout(() => { if (btn) { btn.textContent = 'Save this search'; btn.disabled = false; } }, 2000);
}

function applyFilters() {
  let results = LISTINGS.filter(l => {
    if (l.active === false) return false; // host has unlisted this venue
    if (filterState.category !== 'all' && l.category !== filterState.category) return false;
    if (l.price < filterState.priceMin || l.price > filterState.priceMax) return false;
    if (l.capacity < filterState.capacityMin || l.capacity > filterState.capacityMax) return false;
    if (filterState.amenities.size > 0) {
      const has = [...filterState.amenities].every(a => l.amenities.includes(a));
      if (!has) return false;
    }
    if (filterState.location) {
      const q = filterState.location.toLowerCase();
      if (!l.location.toLowerCase().includes(q) && !l.title.toLowerCase().includes(q)) return false;
    }
    if (filterState.radius > 0 && filterState.lat != null && filterState.lng != null) {
      if (l.lat == null || l.lng == null) return false;
      if (haversine(filterState.lat, filterState.lng, l.lat, l.lng) > filterState.radius) return false;
    }
    if (filterState.checkin) {
      const vid = LISTING_TO_BOOKER_VENUE[l.id];
      if (vid) {
        try {
          const cal = JSON.parse(localStorage.getItem(`bb_pub_cal_${vid}`) || '{}');
          if (cal[filterState.checkin] === 'booked') return false;
        } catch(e) {}
      }
    }
    return true;
  });
  _currentResults = results;
  _currentPage = 1;
  renderListings(sortListings(_currentResults), _currentPage);
  updateMapMarkers(results);
  document.getElementById('filterApplyBtn').textContent = 'Show venues';
  const bar = document.getElementById('saveSearchBar');
  if (bar) bar.style.display = isFilterActive() ? 'flex' : 'none';
}

// ─── AMENITY FILTER LIST (with search) ───────────────────────────────────────

function buildAmenityList(query='') {
  const container = document.getElementById('amenityList');
  if (!container) return;
  const q = query.toLowerCase();
  container.innerHTML = '';
  Object.entries(AMENITIES).forEach(([cat, items]) => {
    const filtered = items.filter(a => !q || a.label.toLowerCase().includes(q));
    if (!filtered.length) return;
    const section = document.createElement('div');
    section.className = 'amenity-section';
    section.innerHTML = `<h4 class="amenity-cat-label">${cat}</h4>
      ${filtered.map(a => `
        <label class="amenity-row">
          <input type="checkbox" value="${a.id}" ${filterState.amenities.has(a.id)?'checked':''}
                 onchange="toggleAmenity('${a.id}',this.checked)"/>
          <span>${a.label}</span>
        </label>`).join('')}`;
    container.appendChild(section);
  });
  if (!container.innerHTML) container.innerHTML = '<p style="color:#888;padding:16px 0;font-size:14px">No amenities match your search.</p>';
}

function toggleAmenity(id, checked) {
  if (checked) filterState.amenities.add(id);
  else filterState.amenities.delete(id);
  // update badge
  const badge = document.getElementById('amenityBadge');
  if (badge) badge.textContent = filterState.amenities.size || '';
}

// ─── RENDER LISTINGS ─────────────────────────────────────────────────────────

function renderListings(listings, page = 1) {
  const grid = document.getElementById('listingsGrid');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const countEl  = document.getElementById('listingsCount');
  const sortEl   = document.getElementById('sortSelect');
  if (countEl) {
    countEl.textContent = isFilterActive() ? (listings.length === 1 ? '1 venue' : `${listings.length} venues`) : '';
  }
  if (sortEl && sortEl.value !== _sortOrder) sortEl.value = _sortOrder;

  if (!listings.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:#888;">
      <div style="font-size:40px;margin-bottom:12px">🎸</div>
      <p style="font-size:16px;font-weight:600">No venues found</p>
      <p style="font-size:14px;margin-top:4px">Try adjusting your filters or search</p>
    </div>`;
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    grid.onmouseenter = grid.onmouseleave = null;
    return;
  }

  const visible = listings.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < listings.length;

  if (page === 1) {
    grid.innerHTML = visible.map(l => renderCard(l)).join('');
    // Re-attach card → pin hover listeners on fresh render
    grid.addEventListener('mouseover', e => {
      const card = e.target.closest('.listing-card');
      if (card) setActiveMapPin(parseInt(card.dataset.id) || card.dataset.id, true);
    });
    grid.addEventListener('mouseout', e => {
      const card = e.target.closest('.listing-card');
      if (card) setActiveMapPin(parseInt(card.dataset.id) || card.dataset.id, false);
    });
  } else {
    // Append only the new page's cards
    const newCards = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    newCards.forEach(l => {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderCard(l);
      grid.appendChild(tmp.firstElementChild);
    });
  }

  if (loadMoreWrap) {
    loadMoreWrap.style.display = hasMore ? 'flex' : 'none';
    const btn = document.getElementById('loadMoreBtn');
    if (btn) btn.textContent = `Show more venues (${listings.length - visible.length} remaining)`;
  }
}

function loadMoreListings() {
  _currentPage++;
  renderListings(_currentResults, _currentPage);
}

function renderCard(l) {
  const idx = appState.activeImageIndex[l.id] || 0;
  const inWL = appState.wishlist.has(l.id);
  const dots = l.images.map((_,i) => `<span class="listing-dot${i===idx?' active':''}"></span>`).join('');
  return `
    <article class="listing-card" data-id="${l.id}" onclick="openListing(${l.id})">
      <div class="listing-images" data-id="${l.id}">
        ${getEffectiveBadge(l) ? `<div class="listing-badge">${getEffectiveBadge(l)}</div>` : ''}
        ${l.promoted ? `<div class="listing-promoted">Promoted</div>` : ''}
        <button class="listing-wishlist${inWL?' active':''}" onclick="toggleWishlist(event,${l.id})" aria-label="Save venue">
          <svg viewBox="0 0 32 32" width="20" height="20"
               fill="${inWL?'#EF60A3':'none'}" stroke="${inWL?'none':'white'}" stroke-width="2">
            <path d="M16 28c7-4.733 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0C2.61 7.42 2 9.21 2 11c0 7 7 12.267 14 17z"/>
          </svg>
        </button>
        <img src="${l.images[idx]}" alt="${l.title}" class="listing-img" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800'"/>
        <button class="listing-arrow listing-arrow-prev" onclick="prevImage(event,${l.id})">‹</button>
        <button class="listing-arrow listing-arrow-next" onclick="nextImage(event,${l.id})">›</button>
        <div class="listing-dots">${dots}</div>
        <div class="listing-capacity-badge">👥 ${l.capacity >= 1000 ? (l.capacity/1000).toFixed(1)+'K' : l.capacity} cap</div>
      </div>
      <div class="listing-info">
        <div class="listing-top">
          <span class="listing-title">${l.title}</span>
        </div>
        <p class="listing-subtitle">${l.location}</p>
        ${(() => { const _c = CATEGORIES.find(c => c.id === l.category); return _c && _c.id !== 'all' ? `<p class="listing-type-chip">${_c.emoji} ${_c.label}</p>` : ''; })()}
        <p class="listing-dates">${l.dates}</p>
        <div class="listing-price-row">
          <p class="listing-price"><strong>${formatPrice(l.price)}</strong> <span>/ ${l.priceUnit}</span></p>
          <p class="listing-capacity">👥 ${l.capacity >= 1000 ? (l.capacity/1000).toFixed(l.capacity%1000===0?0:1)+'k' : l.capacity.toLocaleString()}</p>
        </div>
      </div>
    </article>`;
}

// ─── IMAGE CAROUSEL ───────────────────────────────────────────────────────────

function nextImage(e, id) {
  e.stopPropagation();
  const l = LISTINGS.find(x => x.id === id);
  if (!l) return;
  appState.activeImageIndex[id] = ((appState.activeImageIndex[id]||0)+1) % l.images.length;
  updateCardImage(id);
}
function prevImage(e, id) {
  e.stopPropagation();
  const l = LISTINGS.find(x => x.id === id);
  if (!l) return;
  const n = l.images.length;
  appState.activeImageIndex[id] = ((appState.activeImageIndex[id]||0)-1+n) % n;
  updateCardImage(id);
}
function updateCardImage(id) {
  const card = document.querySelector(`.listing-card[data-id="${id}"]`);
  if (!card) return;
  const l = LISTINGS.find(x => x.id === id);
  const idx = appState.activeImageIndex[id]||0;
  card.querySelector('.listing-img').src = l.images[idx];
  card.querySelectorAll('.listing-dot').forEach((d,i) => d.classList.toggle('active', i===idx));
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

function toggleWishlist(e, id) {
  e.stopPropagation();
  const inList = appState.wishlist.has(id);
  try {
    const stored = JSON.parse(localStorage.getItem('bb_saved_venues') || '[]');
    if (inList) {
      appState.wishlist.delete(id);
      showToast('Removed from saved venues');
      localStorage.setItem('bb_saved_venues', JSON.stringify(stored.filter(v => v.id !== id)));
    } else {
      appState.wishlist.add(id);
      showToast('Venue saved ♥');
      if (!stored.find(v => v.id === id)) {
        const l = LISTINGS.find(x => x.id === id);
        if (l) {
          stored.push({ id: l.id, title: l.title, location: l.location, img: l.images?.[0] || '', price: l.price, capacity: l.capacity, rating: l.rating });
          localStorage.setItem('bb_saved_venues', JSON.stringify(stored));
        }
      }
    }
  } catch(e) {}
  const saved = !inList;

  // Update the clicked button
  const btn = e.currentTarget;
  btn.classList.toggle('active', saved);
  const svg = btn.querySelector('svg');
  svg.setAttribute('fill',   saved ? '#EF60A3' : 'none');
  svg.setAttribute('stroke', saved ? 'none'    : (btn.id === 'modalSaveBtn' ? 'currentColor' : 'white'));
  const label = btn.querySelector('#modalSaveBtnLabel');
  if (label) label.textContent = saved ? 'Saved' : 'Save';

  // Cross-sync the card heart if the modal was clicked, or the modal if a card was clicked
  const cardBtn = document.querySelector(`.listing-card[data-id="${id}"] .listing-wishlist`);
  if (cardBtn && cardBtn !== btn) {
    cardBtn.classList.toggle('active', saved);
    const csvg = cardBtn.querySelector('svg');
    csvg.setAttribute('fill',   saved ? '#EF60A3' : 'none');
    csvg.setAttribute('stroke', saved ? 'none'    : 'white');
  }
  const modalBtn = document.getElementById('modalSaveBtn');
  if (modalBtn && modalBtn !== btn && appState.selectedListing?.id === id) {
    modalBtn.classList.toggle('active', saved);
    const msv = modalBtn.querySelector('svg');
    msv.setAttribute('fill',   saved ? '#EF60A3' : 'none');
    msv.setAttribute('stroke', saved ? 'none'    : 'currentColor');
    const ml = modalBtn.querySelector('#modalSaveBtnLabel');
    if (ml) ml.textContent = saved ? 'Saved' : 'Save';
  }
}

// ─── LOCALE / CURRENCY CONFIG ─────────────────────────────────────────────────
// Single place to update when adding multi-currency / international support.
// To go global: swap these values per-user or per-listing; add a currency field
// to each listing; pass the listing's locale into formatPrice().

const LOCALE_CONFIG = {
  locale         : 'en-US',
  currency       : 'USD',
  currencySymbol : '$',
  countryCode    : 'US',
  // Default map bounds for the home market
  mapDefaultBounds: [[24.396308, -125.001651], [49.384358, -66.934570]],
};

/** Format a number as a price string using the active locale config. */
function formatPrice(amount) {
  return LOCALE_CONFIG.currencySymbol + Number(amount).toLocaleString(LOCALE_CONFIG.locale);
}

/** Compact price for tight spaces: $5k, $1.2k, $800 */
function formatPriceShort(amount) {
  if (amount >= 1000) {
    const k = amount / 1000;
    return LOCALE_CONFIG.currencySymbol + (k % 1 === 0 ? k : k.toFixed(1)) + 'k';
  }
  return LOCALE_CONFIG.currencySymbol + amount;
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

const CITIES = [
  { name:'Los Angeles',   state:'CA', country:'US', emoji:'🎸', lat:34.0522,  lng:-118.2437 },
  { name:'New York',      state:'NY', country:'US', emoji:'🎷', lat:40.7128,  lng:-74.0060  },
  { name:'Nashville',     state:'TN', country:'US', emoji:'🎵', lat:36.1627,  lng:-86.7816  },
  { name:'Austin',        state:'TX', country:'US', emoji:'🤠', lat:30.2672,  lng:-97.7431  },
  { name:'Chicago',       state:'IL', country:'US', emoji:'🎻', lat:41.8781,  lng:-87.6298  },
  { name:'New Orleans',   state:'LA', country:'US', emoji:'🎺', lat:29.9511,  lng:-90.0715  },
  { name:'Seattle',       state:'WA', country:'US', emoji:'🌧️', lat:47.6062,  lng:-122.3321 },
  { name:'Atlanta',       state:'GA', country:'US', emoji:'🎤', lat:33.7490,  lng:-84.3880  },
  { name:'Miami',         state:'FL', country:'US', emoji:'🌴', lat:25.7617,  lng:-80.1918  },
  { name:'Denver',        state:'CO', country:'US', emoji:'🏔️', lat:39.7392,  lng:-104.9903 },
  { name:'San Francisco', state:'CA', country:'US', emoji:'🌉', lat:37.7749,  lng:-122.4194 },
  { name:'Portland',      state:'OR', country:'US', emoji:'🌲', lat:45.5051,  lng:-122.6750 },
  { name:'Brooklyn',      state:'NY', country:'US', emoji:'🎙️', lat:40.6782,  lng:-73.9442  },
  { name:'Hollywood',     state:'CA', country:'US', emoji:'🌟', lat:34.0928,  lng:-118.3287 },
];

const searchData = {
  activePanel  : null,
  city         : '',
  lat          : null,
  lng          : null,
  radius       : 0,       // miles; 0 = any
  dateStart    : null,
  dateEnd      : null,
  capacity     : 0,
  dpYear       : new Date().getFullYear(),
  dpMonth      : new Date().getMonth(),
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
          + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function setRadius(mi) {
  searchData.radius = mi;
  document.querySelectorAll('.radius-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.mi) === mi);
  });
}

let _searchBackdrop;

function initSearchBackdrop() {
  _searchBackdrop = document.createElement('div');
  _searchBackdrop.className = 'search-backdrop';
  _searchBackdrop.onclick = closeSearch;
  document.body.appendChild(_searchBackdrop);
}

function openSearch() {
  document.getElementById('searchExpanded').classList.add('open');
  document.getElementById('searchPill').style.display = 'none';
  _searchBackdrop.classList.add('open');
  activatePanel('where');
}

function closeSearch() {
  document.getElementById('searchExpanded').classList.remove('open');
  document.getElementById('searchPill').style.display = '';
  _searchBackdrop.classList.remove('open');
  deactivateAllPanels();
}

// ── Panel activation ────────────────────────────────────────────────────────

function activatePanel(name) {
  searchData.activePanel = name;

  ['sfWhere','sfWhen','sfCapacity'].forEach(id =>
    document.getElementById(id)?.classList.remove('sf-active')
  );
  const idMap = { where:'sfWhere', when:'sfWhen', capacity:'sfCapacity' };
  document.getElementById(idMap[name])?.classList.add('sf-active');

  const d1 = document.getElementById('sfDiv1');
  const d2 = document.getElementById('sfDiv2');
  d1?.classList.toggle('sf-div-hide', name === 'where' || name === 'when');
  d2?.classList.toggle('sf-div-hide', name === 'when'  || name === 'capacity');

  document.getElementById('searchDropdown').classList.add('open');
  ['sdpCity','sdpDate','sdpCapacity'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );

  if (name === 'where') {
    document.getElementById('sdpCity').classList.remove('hidden');
    filterCitySuggestions(document.getElementById('whereInput').value);
    setTimeout(() => document.getElementById('whereInput').focus(), 0);
  } else if (name === 'when') {
    document.getElementById('sdpDate').classList.remove('hidden');
    renderDatePicker();
  } else if (name === 'capacity') {
    document.getElementById('sdpCapacity').classList.remove('hidden');
    syncCapacityInput();
  }
}

function deactivateAllPanels() {
  searchData.activePanel = null;
  ['sfWhere','sfWhen','sfCapacity'].forEach(id =>
    document.getElementById(id)?.classList.remove('sf-active')
  );
  document.getElementById('sfDiv1')?.classList.remove('sf-div-hide');
  document.getElementById('sfDiv2')?.classList.remove('sf-div-hide');
  document.getElementById('searchDropdown')?.classList.remove('open');
}

// ── City suggestions ─────────────────────────────────────────────────────────

function filterCitySuggestions(query) {
  const q = (query || '').trim().toLowerCase();
  // Clear location + radius filter immediately when the input is emptied
  if (!q && filterState.location) {
    filterState.location = '';
    searchData.city = '';
    searchData.lat  = null;
    searchData.lng  = null;
    document.querySelector('.search-pill-location').textContent = 'Search Locations';
    applyFilters();
  }
  const matches = q
    ? CITIES.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q))
    : CITIES;
  const list = document.getElementById('cityList');
  if (!matches.length) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:8px 0">No cities found</p>`;
    return;
  }
  list.innerHTML = matches.map(c => `
    <div class="city-item" onclick="selectCity('${c.name}, ${c.state}',${c.lat||'null'},${c.lng||'null'})">
      <div class="city-item-icon">${c.emoji}</div>
      <div>
        <div class="city-item-name">${c.name}</div>
        <div class="city-item-sub">${c.state} · Music venues</div>
      </div>
    </div>`).join('');
}

function selectCity(cityStr, lat, lng) {
  searchData.city = cityStr;
  searchData.lat  = lat  || null;
  searchData.lng  = lng  || null;
  document.getElementById('whereInput').value = cityStr;
  document.querySelector('.search-pill-location').textContent = cityStr;
  if (searchData.radius === 0) setRadius(5);
  _mapUserMoved = false;
  document.getElementById('searchAreaWrap').style.display = 'none';
  if (!appState.mapOpen) toggleMap();
  geocodeAndFitMap(cityStr);
  activatePanel('capacity');
}

function handleWhereKey(e) {
  if (e.key === 'Enter') { submitSearch(); return; }
  if (e.key === 'Tab') { e.preventDefault(); activatePanel('capacity'); }
}

// ── Date picker ───────────────────────────────────────────────────────────────

function dpNav(delta) {
  searchData.dpMonth += delta;
  if (searchData.dpMonth > 11) { searchData.dpMonth = 0; searchData.dpYear++; }
  if (searchData.dpMonth < 0)  { searchData.dpMonth = 11; searchData.dpYear--; }
  renderDatePicker();
}

function renderDatePicker() {
  const { dpYear, dpMonth, dateStart, dateEnd } = searchData;
  const today = new Date(); today.setHours(0,0,0,0);
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('dpMonthLabel').textContent = `${months[dpMonth]} ${dpYear}`;

  const firstDay    = new Date(dpYear, dpMonth, 1).getDay();
  const daysInMonth = new Date(dpYear, dpMonth + 1, 0).getDate();
  let html = '';

  for (let i = 0; i < firstDay; i++) html += `<div class="dp-day dp-empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(dpYear, dpMonth, d); date.setHours(0,0,0,0);
    const iso = `${dpYear}-${String(dpMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isPast    = date < today;
    const isStart   = dateStart && date.getTime() === dateStart.getTime();
    const isEnd     = dateEnd   && date.getTime() === dateEnd.getTime();
    const inRange   = dateStart && dateEnd && date > dateStart && date < dateEnd;

    let cls = 'dp-day';
    if (isPast)   cls += ' dp-past';
    if (isStart)  cls += ' dp-start';
    if (isEnd)    cls += ' dp-end';
    if (inRange)  cls += ' dp-in-range';

    const click = isPast ? '' : `onclick="dpSelectDate('${iso}')"`;
    html += `<div class="${cls}" ${click}>${d}</div>`;
  }
  document.getElementById('dpGrid').innerHTML = html;
}

function dpSelectDate(iso) {
  const [_y, _m, _d] = iso.split('-').map(Number);
  const clicked = new Date(_y, _m - 1, _d); clicked.setHours(0,0,0,0);
  if (!searchData.dateStart || searchData.dateEnd || clicked < searchData.dateStart) {
    searchData.dateStart = clicked;
    searchData.dateEnd   = null;
  } else {
    searchData.dateEnd = clicked;
    updateWhenDisplay();
    setTimeout(() => activatePanel('capacity'), 320);
  }
  renderDatePicker();
  updateWhenDisplay();
}

function updateWhenDisplay() {
  const { dateStart, dateEnd } = searchData;
  const opts = { month:'short', day:'numeric' };
  const el   = document.getElementById('whenValue');
  const pill = document.querySelector('.search-pill-dates');
  if (dateStart && dateEnd) {
    const s = dateStart.toLocaleDateString('en-US', opts);
    const e = dateEnd.toLocaleDateString('en-US', opts);
    const txt = `${s} – ${e}`;
    el.textContent = txt;  el.classList.add('has-value');
    if (pill) pill.textContent = txt;
  } else if (dateStart) {
    const s = dateStart.toLocaleDateString('en-US', opts);
    el.textContent = s; el.classList.add('has-value');
  } else {
    el.textContent = 'Find Dates'; el.classList.remove('has-value');
    if (pill) pill.textContent = 'Find Dates';
  }
}

function clearSearchDate() {
  searchData.dateStart = null;
  searchData.dateEnd   = null;
  updateWhenDisplay();
  renderDatePicker();
}

// ── Capacity picker ───────────────────────────────────────────────────────────

function syncCapacityInput() {
  const inp = document.getElementById('capInput');
  if (inp) inp.value = searchData.capacity || '';
  updateCapacityPresetHighlight();
}

function adjustCapacity(delta) {
  searchData.capacity = Math.max(0, (searchData.capacity || 0) + delta);
  syncCapacityInput();
  updateCapacityDisplay();
}

function setCapacity(val) {
  searchData.capacity = val;
  syncCapacityInput();
  updateCapacityDisplay();
}

function onCapInput(val) {
  searchData.capacity = Math.max(0, parseInt(val) || 0);
  updateCapacityPresetHighlight();
  updateCapacityDisplay();
}

function updateCapacityPresetHighlight() {
  document.querySelectorAll('.cap-presets button').forEach(btn => {
    const v = parseInt(btn.textContent.replace(/,/g, '')) || 5000;
    const isActive = btn.textContent.includes('+')
      ? searchData.capacity >= 5000
      : v === searchData.capacity;
    btn.classList.toggle('cap-preset-active', isActive);
  });
}

function updateCapacityDisplay() {
  const val  = searchData.capacity;
  const el   = document.getElementById('capacityValue');
  const pill = document.querySelector('.search-pill-guests');
  if (val) {
    const txt = val >= 5000 ? '5,000+ fans' : `${val.toLocaleString()} fans`;
    el.textContent = txt; el.classList.add('has-value');
    if (pill) pill.textContent = txt;
  } else {
    el.textContent = 'Fit your fans'; el.classList.remove('has-value');
    if (pill) pill.textContent = 'Fit your fans';
  }
}

// ── Submit ────────────────────────────────────────────────────────────────────

function submitSearch() {
  const whereVal = (document.getElementById('whereInput')?.value.trim()) || searchData.city;
  filterState.location = whereVal;
  filterState.lat      = searchData.lat;
  filterState.lng      = searchData.lng;
  filterState.radius   = searchData.radius;
  const localISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  filterState.checkin  = searchData.dateStart ? localISO(searchData.dateStart) : null;
  filterState.checkout = searchData.dateEnd   ? localISO(searchData.dateEnd)   : null;
  if (searchData.capacity > 0) {
    filterState.capacityMin = searchData.capacity;
    filterState.capacityMax = 15000;
  }
  updateCapacityDisplay();
  if (whereVal) document.querySelector('.search-pill-location').textContent = whereVal;
  closeSearch();
  renderSkeletons();
  if (whereVal && appState.mapOpen) {
    _mapUserMoved = true; // hold geocoded view — don't let venue fitBounds override
    geocodeAndFitMap(whereVal);
  }
  setTimeout(() => applyFilters(), 500);
}

// ─── FILTER MODAL ─────────────────────────────────────────────────────────────

function toggleFilters() {
  document.getElementById('filterModal').classList.toggle('open');
  document.getElementById('filterOverlay').classList.toggle('open');
}

function resetHome(e) {
  if (e) e.preventDefault();
  // Reset filter modal state
  clearFilters();
  // Reset category bar to 'all'
  filterState.category = 'all';
  document.querySelectorAll('.category').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.category[data-cat="all"]');
  if (allBtn) allBtn.classList.add('active');
  // Reset filterState location/radius
  filterState.location = '';
  filterState.lat      = null;
  filterState.lng      = null;
  filterState.radius   = 0;
  // Reset searchData
  searchData.city     = '';
  searchData.lat      = null;
  searchData.lng      = null;
  searchData.radius   = 0;
  searchData.capacity = 0;
  // Reset search pill UI
  document.querySelector('.search-pill-location').textContent = 'Search Locations';
  const whereInput = document.getElementById('whereInput');
  if (whereInput) whereInput.value = '';
  setRadius(0);
  // Close any open panels
  closeSearch();
  closeListing();
  if (document.getElementById('filterModal').classList.contains('open')) toggleFilters();
  // Re-render
  renderSkeletons();
  setTimeout(() => applyFilters(), 400);
}

function clearFilters() {
  filterState.priceMin    = 0;
  filterState.priceMax    = 25000;
  filterState.capacityMin = 0;
  filterState.capacityMax = 15000;
  filterState.amenities   = new Set();
  filterState.checkin     = null;
  filterState.checkout    = null;
  document.getElementById('priceMin').value     = 0;
  document.getElementById('priceMax').value     = 25000;
  document.getElementById('capacityMin').value  = 0;
  document.getElementById('capacityMax').value  = 15000;
  updatePriceDisplay();
  updateCapacityDisplay();
  document.getElementById('amenitySearch').value = '';
  buildAmenityList();
  document.getElementById('amenityBadge').textContent = '';
  clearDateFilter();
}

function updatePriceDisplay() {
  const min = parseInt(document.getElementById('priceMin').value);
  const max = parseInt(document.getElementById('priceMax').value);
  filterState.priceMin = Math.min(min,max);
  filterState.priceMax = Math.max(min,max);
  document.getElementById('priceMinLabel').textContent = formatPrice(filterState.priceMin);
  document.getElementById('priceMaxLabel').textContent = filterState.priceMax >= 25000 ? formatPriceShort(25000)+'+' : formatPrice(filterState.priceMax);
}

function updateCapacityDisplay() {
  const min = parseInt(document.getElementById('capacityMin').value);
  const max = parseInt(document.getElementById('capacityMax').value);
  filterState.capacityMin = Math.min(min,max);
  filterState.capacityMax = Math.max(min,max);
  document.getElementById('capMinLabel').textContent = filterState.capacityMin.toLocaleString();
  document.getElementById('capMaxLabel').textContent = filterState.capacityMax >= 15000 ? '15k+' : filterState.capacityMax.toLocaleString();
}

// ─── DATE PICKER (inline in filter) ──────────────────────────────────────────

let filterDates = [];

function renderCalendars() {
  const container = document.getElementById('dpCalendars');
  if (!container) return;
  container.innerHTML = '';
  for (let offset = 0; offset < 2; offset++) {
    const d = new Date(appState.currentYear, appState.currentMonth + offset, 1);
    container.appendChild(buildCalendar(d, offset));
  }
}

function buildCalendar(date, offset) {
  const year = date.getFullYear(), month = date.getMonth();
  const monthName  = date.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const firstDay   = new Date(year,month,1).getDay();
  const daysInMonth= new Date(year,month+1,0).getDate();
  const wrap = document.createElement('div'); wrap.className='cal-month';
  wrap.innerHTML = `
    <div class="cal-month-header">
      ${offset===0?`<button onclick="changeMonth(-1)">‹</button>`:'<span></span>'}
      <strong>${monthName}</strong>
      ${offset===1?`<button onclick="changeMonth(1)">›</button>`:'<span></span>'}
    </div>
    <div class="cal-grid">
      ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-day-name">${d}</div>`).join('')}
      ${Array(firstDay).fill('<div></div>').join('')}
      ${Array.from({length:daysInMonth},(_,i)=>i+1).map(day => {
        const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const thisDate = new Date(year,month,day);
        const past = thisDate < new Date(new Date().toDateString());
        let cls = 'cal-day';
        if (past) cls+=' disabled';
        else {
          if (filterDates[0] && isSameDay(thisDate,filterDates[0])) cls+=' selected';
        }
        return `<div class="${cls}"${!past?` onclick="selectDate(${year},${month},${day})"`:''}>${day}</div>`;
      }).join('')}
    </div>`;
  return wrap;
}

function isSameDay(a,b) { return a.toDateString()===b.toDateString(); }
function selectDate(y, m, d) {
  const date = new Date(y, m, d);
  if (filterDates[0] && isSameDay(filterDates[0], date)) {
    clearDateFilter();
    return;
  }
  filterDates = [date];
  filterState.checkin = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const fmt = dt => dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  document.getElementById('filterDateFrom').textContent = fmt(date);
  document.getElementById('clearDateBtn').style.display = '';
  renderCalendars();
}

function clearDateFilter() {
  filterDates = [];
  filterState.checkin = null;
  document.getElementById('filterDateFrom').textContent = 'No date selected';
  document.getElementById('clearDateBtn').style.display = 'none';
  renderCalendars();
}
function changeMonth(delta) {
  appState.currentMonth += delta;
  if (appState.currentMonth<0)  {appState.currentMonth=11; appState.currentYear--;}
  if (appState.currentMonth>11) {appState.currentMonth=0;  appState.currentYear++;}
  renderCalendars();
}

// ─── GUEST PICKER ─────────────────────────────────────────────────────────────

function openGuestPicker() { document.getElementById('guestpickerOverlay').classList.add('open'); }
function closeGuestPicker() { document.getElementById('guestpickerOverlay').classList.remove('open'); }
function changeGuests(type, delta) {
  appState.guests[type] = Math.max(0, appState.guests[type]+delta);
  document.getElementById(`${type}Count`).textContent = appState.guests[type];
}
function saveGuests() {
  const t = appState.guests.adults;
  const txt = t ? `${t.toLocaleString()} fan${t>1?'s':''}` : 'Add fans';
  document.querySelector('.search-pill-guests').textContent = txt;
  closeGuestPicker();
}

// ─── MAP (LEAFLET) ────────────────────────────────────────────────────────────

// Tracks whether the user has manually panned/zoomed — suppresses auto-fitBounds
let _mapUserMoved = false;
// Debounce timer for showing "Search this area"
let _searchAreaTimer = null;

async function geocodeAndFitMap(query) {
  if (!query) return;
  // If map isn't initialised yet, retry once it is
  if (!appState.map) { setTimeout(() => geocodeAndFitMap(query), 400); return; }
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'GigNVenue/1.0' } }
    );
    const data = await res.json();
    if (!data.length) return;
    const place = data[0];
    const bb    = place.boundingbox; // [south, north, west, east]
    if (bb) {
      appState.map.fitBounds(
        [[parseFloat(bb[0]), parseFloat(bb[2])], [parseFloat(bb[1]), parseFloat(bb[3])]],
        { padding: [24, 24] }
      );
    } else {
      // Point result (specific address)
      appState.map.setView([parseFloat(place.lat), parseFloat(place.lon)], 15);
    }
    // Lock the geocoded view — prevent venue fitBounds from overriding it
    _mapUserMoved = true;
    document.getElementById('searchAreaWrap').style.display = 'none';
  } catch (_) { /* silently fall back to venue fitBounds */ }
}

function toggleMap() {
  appState.mapOpen = !appState.mapOpen;
  document.getElementById('mapPanel').classList.toggle('open', appState.mapOpen);
  document.getElementById('pageBody').classList.toggle('map-open', appState.mapOpen);
  const btn = document.getElementById('catbarMapBtn');
  const label = document.getElementById('catbarMapLabel');
  btn.classList.toggle('active', appState.mapOpen);
  label.textContent = appState.mapOpen ? 'Hide map' : 'Show map';
  if (appState.mapOpen && !appState.map) initLeafletMap();
  // Invalidate map size after layout shift, then fit to US on first open
  if (appState.mapOpen && appState.map) setTimeout(() => {
    appState.map.invalidateSize();
    if (!_mapUserMoved) {
      appState.map.fitBounds(LOCALE_CONFIG.mapDefaultBounds, { padding: [16, 16] });
      appState.map.setMinZoom(appState.map.getZoom());
    }
  }, 60);
}

function initLeafletMap() {
  const mapEl = document.getElementById('leafletMap');
  if (!mapEl || !window.L) {
    document.getElementById('mapPanel').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#111;color:#888;font-size:14px;flex-direction:column;gap:8px"><div style="font-size:32px">🗺</div>Map requires network connection</div>`;
    return;
  }
  appState.map = L.map('leafletMap', {
    zoomControl: true,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19, noWrap: true
  }).addTo(appState.map);

  // Show "Search this area" after user manually pans/zooms
  appState.map.on('moveend', () => {
    if (!_mapUserMoved) return; // ignore programmatic fitBounds calls
    clearTimeout(_searchAreaTimer);
    _searchAreaTimer = setTimeout(() => {
      document.getElementById('searchAreaWrap').style.display = '';
    }, 300);
  });
  // Any user interaction with the map counts as a manual move
  appState.map.on('mousedown', () => { _mapUserMoved = true; });

  updateMapMarkers(LISTINGS, true);
}

function updateMapMarkers(listings, forcefit) {
  if (!appState.map || !window.L) return;

  // Remove old markers
  Object.values(appState.markerMap || {}).forEach(m => m.remove());
  appState.markerMap = {};

  listings.forEach(l => {
    const priceLabel = formatPriceShort(l.price);
    const pinEl = document.createElement('div');
    pinEl.className = 'map-price-pin';
    pinEl.textContent = priceLabel;
    pinEl.addEventListener('click', () => openListing(l.id));

    // Pin → card hover
    pinEl.addEventListener('mouseenter', () => {
      document.querySelector(`.listing-card[data-id="${l.id}"]`)?.classList.add('card-map-hover');
    });
    pinEl.addEventListener('mouseleave', () => {
      document.querySelector(`.listing-card[data-id="${l.id}"]`)?.classList.remove('card-map-hover');
    });

    const icon = L.divIcon({ className: '', html: pinEl, iconSize: [null, null] });
    const marker = L.marker([l.lat, l.lng], { icon }).addTo(appState.map);

    // Rich hover tooltip
    marker.bindTooltip(`
      <div class="map-hover-card">
        <img src="${l.images[0]}?w=160&q=60" alt="${l.title}" class="map-hover-img" onerror="this.style.display='none'"/>
        <div class="map-hover-body">
          <div class="map-hover-title">${l.title}</div>
          <div class="map-hover-meta">${formatPrice(l.price)} / night &nbsp;·&nbsp; ${l.capacity.toLocaleString(LOCALE_CONFIG.locale)} cap</div>
        </div>
      </div>`, {
      permanent: false, direction: 'top', offset: [0, -8],
      className: 'map-hover-tooltip', opacity: 1,
    });

    appState.markerMap[l.id] = { marker, pinEl };
  });

  // Only auto-fit on city search or explicit force — not on every filter change
  if ((forcefit || !_mapUserMoved) && listings.length) {
    _mapUserMoved = false; // reset so fitBounds doesn't trigger the moveend button
    const bounds = L.latLngBounds(listings.map(l => [l.lat, l.lng]));
    appState.map.fitBounds(bounds, { padding:[40,40] });
  }
}

// Called when user clicks "Search this area"
function searchThisArea() {
  if (!appState.map) return;
  const bounds = appState.map.getBounds();
  const filtered = LISTINGS.filter(l =>
    l.active !== false &&
    l.lat >= bounds.getSouth() && l.lat <= bounds.getNorth() &&
    l.lng >= bounds.getWest()  && l.lng <= bounds.getEast()
  );
  renderListings(filtered);
  updateMapMarkers(filtered);
  document.getElementById('searchAreaWrap').style.display = 'none';
}

// Highlight / unhighlight the map pin for a given listing id
function setActiveMapPin(id, active) {
  const entry = (appState.markerMap || {})[id];
  if (!entry) return;
  entry.pinEl.classList.toggle('map-pin-active', active);
}

// ─── VENUE AVAILABILITY CALENDAR (listing modal) ─────────────────────────────

function getVenueCalendar() {
  try {
    const bookerVenueId = LISTING_TO_BOOKER_VENUE[appState.selectedListing && appState.selectedListing.id];
    if (!bookerVenueId) return {};
    const saved = localStorage.getItem(`bb_pub_cal_${bookerVenueId}`);
    return saved ? JSON.parse(saved) : {};
  } catch(e) { return {}; }
}

const modalCal = {
  year : new Date().getFullYear(),
  month: new Date().getMonth(),
  date : null,   // single selected event date
};

function renderModalCal() {
  const el = document.getElementById('modalCalGrid');
  if (!el) return;
  const statuses  = getVenueCalendar();
  const tz        = VENUE_TIMEZONES[appState.selectedListing && appState.selectedListing.id] || 'UTC';
  const todayIso  = venueToday(tz);

  // Map of iso → status for the logged-in artist's requests at this venue
  const myReqMap = new Map();
  try {
    const session = JSON.parse(localStorage.getItem('vf_booker_session') || 'null');
    const bookerVenueId = LISTING_TO_BOOKER_VENUE[appState.selectedListing && appState.selectedListing.id];
    if (session && bookerVenueId) {
      const myReqs = JSON.parse(localStorage.getItem('bb_my_requests') || '[]');
      myReqs.filter(r => r.bookerId === session.userId && r.venueId === bookerVenueId)
            .forEach(r => myReqMap.set(r.date, r.status));
    }
  } catch(e) {}
  const firstDay  = new Date(modalCal.year, modalCal.month, 1).getDay();
  const daysInMo  = new Date(modalCal.year, modalCal.month + 1, 0).getDate();
  const prevDays  = new Date(modalCal.year, modalCal.month, 0).getDate();
  const months    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label     = `${months[modalCal.month]} ${modalCal.year}`;

  document.getElementById('modalCalLabel').textContent = label;

  let html = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    html += `<div class="mcp-dayname">${d}</div>`;
  });

  // Prev-month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="mcp-day mcp-empty">${prevDays - i}</div>`;
  }

  for (let d = 1; d <= daysInMo; d++) {
    const iso  = `${modalCal.year}-${String(modalCal.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const entry         = statuses[iso];
    const status        = typeof entry === 'object' ? entry.status : (entry || 'available');
    const actName       = typeof entry === 'object' ? (entry.actName || null) : null;
    const isPast        = iso < todayIso;
    const isUnavailable = status === 'booked' || status === 'blocked';
    const disabled      = isPast || isUnavailable;

    const myReqStatus = !isPast ? myReqMap.get(iso) : undefined; // 'approved'|'pending'|'declined'|undefined
    const hasMyReq    = myReqStatus !== undefined;

    const nightlyPrice = (!disabled && !hasMyReq && appState.selectedListing?.weekdayRates)
      ? resolveNightlyRate(appState.selectedListing, iso) : null;

    let cls = 'mcp-day';
    if (disabled && !hasMyReq)      cls += ' mcp-disabled';
    else if (status === 'pending' && !hasMyReq) cls += ' mcp-pending';
    if (hasMyReq) cls += ` mcp-my-req mcp-my-req-${myReqStatus}`;

    // Single-date selection (only for non-request cells)
    if (!hasMyReq && modalCal.date && iso === modalCal.date) cls += ' mcp-start';

    // Request cells navigate to booker dashboard; other non-disabled cells pick the date
    const clickAttr = hasMyReq
      ? `onclick="goToBookerCalendarDate('${iso}')" style="cursor:pointer"`
      : disabled ? '' : `onclick="modalCalPick('${iso}')"`;
    const title = hasMyReq       ? ` title="Your request — click to view in your dashboard"`
                : status === 'pending'   ? ' title="Pending — requests still available"'
                : isUnavailable && actName ? ` title="${actName}"` : '';
    html += `<div class="${cls}"${title}${clickAttr}>
      <span class="mcp-num">${d}</span>
      ${nightlyPrice ? `<span class="mcp-price">$${nightlyPrice >= 1000 ? Math.round(nightlyPrice/100)/10 + 'k' : nightlyPrice}</span>` : ''}
      ${isUnavailable && !hasMyReq && actName ? `<span class="mcp-badge mcp-badge-booked mcp-badge-act" title="${actName}">${actName}</span>` : ''}
      ${status === 'pending' && !disabled && !hasMyReq ? '<span class="mcp-badge mcp-badge-pending">Pending</span>' : ''}
      ${hasMyReq ? `<span class="mcp-badge mcp-badge-my-req-${myReqStatus}">YOUR REQ</span>` : ''}
    </div>`;
  }

  // Fill remainder
  const total = firstDay + daysInMo;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= rem; d++) {
    html += `<div class="mcp-day mcp-empty">${d}</div>`;
  }

  el.innerHTML = html;
  updateModalDateDisplay();

  // Show "Approved ↗" legend entry only when the artist has an approved request at this venue
  const myReqLegendBtn = document.querySelector('.mcp-my-req-link');
  if (myReqLegendBtn) {
    const hasApproved = [...myReqMap.values()].some(s => s === 'approved');
    myReqLegendBtn.style.display = hasApproved ? '' : 'none';
  }
}

function vrfAttendanceCheck(input, capacity) {
  const val = parseInt(input.value);
  const err = document.getElementById('vrfAttendanceErr');
  const over = val && val > capacity;
  input.classList.toggle('vrf-input-error', !!over);
  if (err) err.style.display = over ? '' : 'none';
}

function submitVenueRequest() {
  const l = appState.selectedListing;
  if (!l) return;

  if (!modalCal.date) {
    showToast('Please select an event date on the calendar first.');
    return;
  }

  const bookerVenueId = LISTING_TO_BOOKER_VENUE[l.id];
  if (!bookerVenueId) {
    showToast('Online booking is not yet available for this venue.');
    return;
  }

  const session = JSON.parse(localStorage.getItem('vf_booker_session') || 'null');
  if (!session) {
    showToast('Please log in to your artist account to request a booking.');
    setTimeout(() => { window.location.href = 'booker-login.html'; }, 1800);
    return;
  }

  const users  = JSON.parse(localStorage.getItem('vf_booker_users') || '[]');
  const booker = users.find(u => u.id === session.userId);
  if (!booker) { showToast('Session error — please log in again.'); return; }

  // Check account freeze / flag from strike system
  try {
    const strikeRec = (JSON.parse(localStorage.getItem('bb_strikes') || '{}'))[session.userId];
    if (strikeRec) {
      if (strikeRec.flagged) {
        showToast('Your account is under review. Please contact support to restore booking access.');
        return;
      }
      if (strikeRec.freezeUntil && Date.now() < strikeRec.freezeUntil) {
        const d = new Date(strikeRec.freezeUntil).toLocaleDateString('en-US', { month:'long', day:'numeric' });
        showToast(`New requests are paused until ${d} due to a missed payment window.`);
        return;
      }
    }
  } catch(e) {}

  const attendance = parseInt(document.getElementById('vrfAttendance')?.value) || 0;
  if (!attendance) { showToast('Please enter your expected attendance.'); return; }
  if (l.capacity && attendance > l.capacity) {
    showToast(`Attendance cannot exceed venue capacity of ${l.capacity.toLocaleString()}.`);
    return;
  }

  // Block duplicate: same artist, same venue, same date — checks both request stores
  try {
    const allMine = [
      ...JSON.parse(localStorage.getItem('bb_my_requests')   || '[]'),
      ...JSON.parse(localStorage.getItem('bb_site_requests') || '[]'),
    ];
    const duplicate = allMine.find(r =>
      r.bookerId === session.userId &&
      r.venueId  === bookerVenueId  &&
      r.date     === modalCal.date  &&
      r.status   !== 'cancelled'
    );
    if (duplicate) {
      showToast(`You already have a ${duplicate.status} request for this venue on that date.`);
      return;
    }
    // Warn (but don't block) if artist already has a request on this date at a different venue
    const dateConflict = allMine.find(r =>
      r.bookerId === session.userId &&
      r.venueId  !== bookerVenueId  &&
      r.date     === modalCal.date  &&
      (r.status === 'pending' || r.status === 'approved' || r.status === 'confirmed')
    );
    if (dateConflict && !submitVenueRequest._conflictArmed) {
      submitVenueRequest._conflictArmed = modalCal.date;
      showToast('⚠️ You already have a booking request on this date. Submit again to proceed anyway — if that booking is confirmed, this request will be auto-cancelled.');
      return;
    }
    if (submitVenueRequest._conflictArmed !== modalCal.date) {
      submitVenueRequest._conflictArmed = null;
    }
  } catch(e) {}

  const eventType = document.getElementById('vrfEventType')?.value || 'Concert / live show';
  const notes     = document.getElementById('vrfNotes')?.value?.trim() || '';
  const today     = new Date().toISOString().slice(0, 10);
  const reqId     = 'req_site_' + Date.now();

  // 1. Host dashboard pickup queue
  try {
    const queue = JSON.parse(localStorage.getItem('bb_host_pending_requests') || '[]');
    queue.push({
      id:          reqId,
      guest:       `${booker.firstName} ${booker.lastName}`.trim(),
      bandName:    booker.artistName || '',
      guestImg:    booker.avatar    || '',
      property:    l.title,
      propertyImg: l.images[0]     || '',
      checkin:     modalCal.date,
      checkout:    modalCal.date,
      guests:      attendance,
      total:       l.price,
      submittedAt: today,
      eventType,
    });
    localStorage.setItem('bb_host_pending_requests', JSON.stringify(queue));
  } catch(e) {}

  // 2. Artist dashboard pickup queue
  const siteReq = {
    id: reqId, bookerId: session.userId, venueId: bookerVenueId,
    date: modalCal.date, status: 'pending', eventType, attendance, notes, sent: today,
  };
  try {
    const siteReqs = JSON.parse(localStorage.getItem('bb_site_requests') || '[]');
    siteReqs.push(siteReq);
    localStorage.setItem('bb_site_requests', JSON.stringify(siteReqs));
  } catch(e) {}

  // 3. Update bb_my_requests so the modal calendar green dot shows immediately
  try {
    const mine = JSON.parse(localStorage.getItem('bb_my_requests') || '[]');
    mine.push({ id: reqId, bookerId: session.userId, venueId: bookerVenueId, date: modalCal.date, status: 'pending' });
    localStorage.setItem('bb_my_requests', JSON.stringify(mine));
  } catch(e) {}

  // Update button to confirmed state
  const btn = document.getElementById('venueReqBtn');
  if (btn) {
    btn.textContent = '✓ Request sent!';
    btn.disabled = true;
    btn.style.background = '#059669';
  }
  showToast(`Request sent to ${l.title} for ${fmtIso(modalCal.date, { month:'long', day:'numeric', year:'numeric' })}! 🎸`);
  renderModalCal(); // refresh to show the new green dot
}

function goToBookerCalendar() {
  const bookerVenueId = LISTING_TO_BOOKER_VENUE[appState.selectedListing && appState.selectedListing.id];
  const url = bookerVenueId
    ? `booker-dashboard.html?section=calendar&venue=${bookerVenueId}`
    : 'booker-dashboard.html?section=calendar';
  window.location.href = url;
}

// Navigate to booker dashboard calendar at the specific month of an ISO date
function goToBookerCalendarDate(iso) {
  const bookerVenueId = LISTING_TO_BOOKER_VENUE[appState.selectedListing && appState.selectedListing.id];
  const [y, m] = iso.split('-');
  const params = new URLSearchParams({ section: 'calendar' });
  if (bookerVenueId) params.set('venue', bookerVenueId);
  params.set('year', y);
  params.set('month', m); // 1-based
  window.location.href = `booker-dashboard.html?${params.toString()}`;
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function modalCalNav(delta) {
  modalCal.month += delta;
  if (modalCal.month > 11) { modalCal.month = 0; modalCal.year++; }
  if (modalCal.month < 0)  { modalCal.month = 11; modalCal.year--; }
  renderModalCal();
}

function modalCalPick(iso) {
  // Toggle off if the same date is clicked again; store as ISO string
  modalCal.date = (modalCal.date === iso) ? null : iso;
  renderModalCal();
  updateModalBookingTotal();
}

function updateModalDateDisplay() {
  const el = document.getElementById('modalCalDateField');
  if (!el) return;
  el.textContent = modalCal.date ? fmtIso(modalCal.date, { month:'short', day:'numeric', year:'numeric' }) : 'Select a date';

  // Update featured price: specific rate on selection, range when no date chosen
  const l = appState.selectedListing;
  const priceEl = document.getElementById('modalSelectedPrice');
  if (priceEl && l) {
    if (modalCal.date) {
      priceEl.textContent = formatPrice(resolveNightlyRate(l, modalCal.date));
    } else {
      const vals = l.weekdayRates ? Object.values(l.weekdayRates) : [l.price];
      const lo = Math.min(...vals), hi = Math.max(...vals);
      priceEl.textContent = lo === hi ? formatPrice(lo) : `${formatPrice(lo)} – ${formatPrice(hi)}`;
    }
  }
}

function updateModalBookingTotal() {
  const l = appState.selectedListing;
  if (!l) return;
  const nightlyRate = modalCal.date ? resolveNightlyRate(l, modalCal.date) : l.price;
  const deposit    = Math.round(nightlyRate * 0.20);
  const bookingFee = Math.round(nightlyRate * 0.05);
  const el = document.getElementById('modalBookingBreakdown');
  if (!el) return;
  el.innerHTML = `
    <div class="booking-fee-row"><span>Venue fee <sup style="color:var(--red);font-size:9px">*</sup></span><span>$${nightlyRate.toLocaleString()} / night</span></div>
    <div class="booking-fee-row"><span>Deposit <span class="fee-note">(20% · held; released post-show)</span></span><span>$${deposit.toLocaleString()}</span></div>
    <div class="booking-fee-row"><span>Artist booking fee <span class="fee-note">(5% · non-refundable)</span></span><span>$${bookingFee.toLocaleString()}</span></div>
    <div class="booking-fee-total"><span>Due on approval</span><span>$${(deposit + bookingFee).toLocaleString()}</span></div>
    <p style="font-size:11px;color:var(--text-muted);margin:8px 0 0;line-height:1.4">No payment required to submit a request. The amount shown is due within 48 hours of venue approval.</p>`;
}

// ─── LISTING DETAIL MODAL ────────────────────────────────────────────────────

function openListing(id) {
  mergeHostListings();
  const l = LISTINGS.find(x => x.id === id);
  if (!l) return;
  // Clear any previously active pin, set new one
  if (appState.selectedListing) setActiveMapPin(appState.selectedListing.id, false);
  setActiveMapPin(id, true);
  appState.selectedListing = l;
  document.getElementById('listingModalOverlay').classList.add('open');
  document.getElementById('listingModal').classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('listingModalImages').innerHTML =
    l.images.slice(0,4).map((src,i) => `<img src="${src}" alt="${l.title}" loading="${i?'lazy':'eager'}" onerror="this.style.background='#1a1a1a'"/>`).join('') +
    '<div id="listingImgMap" class="listing-img-map"></div>';

  // Initialize Leaflet map in photo strip (bottom-right slot)
  if (_venueMap) { _venueMap.remove(); _venueMap = null; }
  setTimeout(() => {
    const mapEl = document.getElementById('listingImgMap');
    if (!mapEl || !l.lat || !l.lng) return;
    _venueMap = L.map('listingImgMap', {
      zoomControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, touchZoom: false, keyboard: false
    }).setView([l.lat, l.lng], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(_venueMap);
    const dot = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#EF60A3;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7]
    });
    L.marker([l.lat, l.lng], { icon: dot }).addTo(_venueMap);
  }, 80);

  document.getElementById('listingModalTitle').textContent = l.title;
  document.getElementById('listingModalLocation').innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.location)}" target="_blank" rel="noopener" class="venue-map-link">${l.location}</a> · <strong>Capacity: ${l.capacity.toLocaleString()}</strong>`;
  document.getElementById('listingModalRating').innerHTML = '';

  // Venue type chip — clickable to filter by this category
  const _cat = CATEGORIES.find(c => c.id === l.category);
  const _typeEl = document.getElementById('listingModalType');
  if (_typeEl) {
    _typeEl.innerHTML = _cat && _cat.id !== 'all'
      ? `<button class="venue-type-chip" onclick="filterByCategory('${_cat.id}')" title="Browse all ${_cat.label}">${_cat.emoji} ${_cat.label}</button>`
      : '';
  }

  // Build highlights: featured amenities + custom highlights, falling back to static array
  const allAmenityItemsHL = Object.values(AMENITIES).flat();
  const descsHL = l.amenityDescs || {};
  const featuredIds = l.featuredAmenities && l.featuredAmenities.length ? l.featuredAmenities : null;
  const amenityHL = featuredIds
    ? featuredIds.map(fid => {
        const amenity = allAmenityItemsHL.find(a => a.id === fid);
        if (!amenity) return null;
        return { id: fid, title: amenity.label, desc: descsHL[fid] || '' };
      }).filter(Boolean)
    : [];
  const customHL = (l.customHighlights || []).map(h => ({ title: h.title, desc: h.desc }));
  const highlightItems = (amenityHL.length || customHL.length)
    ? [...amenityHL, ...customHL].slice(0, 3)
    : l.highlights || [];
  document.getElementById('listingModalHighlights').innerHTML = highlightItems.map(h => `
    <div class="highlight-item">
      ${h.id ? amenityIcon(h.id) : '<svg viewBox="0 0 24 24" width="24" height="24" fill="#EF60A3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>'}
      <div><strong>${h.title}</strong><span>${h.desc}</span></div>
    </div>`).join('');

  document.getElementById('listingModalDesc').textContent = l.description;

  // Pricing section — only shown when host has filled in booking/room rental details
  const pricingEl = document.getElementById('listingModalPricing');
  const hasPricing = l.bookingDesc || (l.roomRentalEnabled && l.roomRentalPrice);
  if (hasPricing) {
    pricingEl.innerHTML = `
      <div class="listing-modal-divider"></div>
      <div class="listing-modal-pricing">
        <h3>Pricing options</h3>
        <div class="pricing-options-list">
          <div class="pricing-option-row">
            <div class="pricing-option-row-label">
              <span class="pricing-option-row-title">Full booking — $${l.price.toLocaleString()} / night</span>
              ${l.bookingDesc ? `<p class="pricing-option-row-desc">${l.bookingDesc}</p>` : ''}
            </div>
          </div>
          ${l.roomRentalEnabled && l.roomRentalPrice ? `
          <div class="pricing-option-row">
            <div class="pricing-option-row-label">
              <span class="pricing-option-row-title">Room rental — $${l.roomRentalPrice.toLocaleString()} / night</span>
              ${l.roomRentalDesc ? `<p class="pricing-option-row-desc">${l.roomRentalDesc}</p>` : ''}
            </div>
          </div>` : ''}
        </div>
      </div>`;
  } else {
    pricingEl.innerHTML = '';
  }

  // GigNVenue platform cancellation policy (left info panel)
  const cancelEl = document.getElementById('listingModalCancellation');
  if (cancelEl) {
    cancelEl.innerHTML = `
      <div class="listing-modal-divider"></div>
      <div class="listing-modal-cancel-policy" id="venueCancelPolicySection">
        <h3>GigNVenue cancellation policy</h3>
        <ul style="margin:8px 0 0 0;padding-left:18px;font-size:14px;line-height:1.7;color:var(--text-muted,#555)">
          <li>Cancel before payment — no charge. The booking fee is only collected at payment.</li>
          <li>Cancel after payment — refund eligibility is governed by the venue's cancellation policy, which you review and accept before booking.</li>
          <li>If the venue cancels a confirmed booking — your full deposit is returned.</li>
          <li>The 5% GigNVenue booking fee is non-refundable in all cases.</li>
        </ul>
        <p style="margin:10px 0 0;font-size:13px"><a href="terms.html#cancellation" target="_blank" style="color:#EF60A3">Full cancellation terms ↗</a></p>
      </div>`;
  }

  // All amenities the venue has
  const allAmenityItems = Object.values(AMENITIES).flat();
  const venueAmenities = l.amenities.map(id => allAmenityItems.find(a => a.id===id)).filter(Boolean);
  const descs = l.amenityDescs || {};
  document.getElementById('listingModalAmenities').innerHTML = `
    <h3>What this venue includes</h3>
    <div class="amenities-list">
      ${venueAmenities.map(a => `
        <div class="amenity-row">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="#EF60A3" style="flex-shrink:0;margin-top:2px"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <div>
            <div class="amenity-label">${a.label}</div>
            ${descs[a.id] ? `<div class="amenity-desc">${descs[a.id]}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;


  // Reset modal calendar state — single date only
  const tz = VENUE_TIMEZONES[l.id] || 'UTC';
  const todayIsoInit = venueToday(tz);
  const [ty, tm] = todayIsoInit.split('-').map(Number);
  modalCal.year  = ty;
  modalCal.month = tm - 1;
  modalCal.date  = filterDates[0] ? toIso(filterDates[0]) : null;

  const deposit    = Math.round(l.price * 0.20);
  const bookingFee = Math.round(l.price * 0.05);
  const _rateVals  = l.weekdayRates ? Object.values(l.weekdayRates) : [l.price];
  const _minRate   = Math.min(..._rateVals);
  const _maxRate   = Math.max(..._rateVals);
  const priceRangeHtml = _minRate === _maxRate
    ? formatPrice(_minRate)
    : `${formatPrice(_minRate)} – ${formatPrice(_maxRate)}`;
  const initDateLabel = modalCal.date
    ? fmtIso(modalCal.date, { month:'short', day:'numeric', year:'numeric' })
    : 'Select a date';
  // Build existing-request banner for logged-in bookers
  const _bvId = LISTING_TO_BOOKER_VENUE[l.id];
  let _existingBanner = '';
  if (_bvId) {
    try {
      const _sess = JSON.parse(localStorage.getItem('vf_booker_session') || 'null');
      if (_sess) {
        const _mine = JSON.parse(localStorage.getItem('bb_my_requests') || '[]')
          .filter(r => r.bookerId === _sess.userId && r.venueId === _bvId && r.status !== 'cancelled');
        if (_mine.length) {
          const _statusColor = { pending:'#f59e0b', approved:'#10b981', declined:'#ef4444' };
          const _statusLabel = { pending:'Pending', approved:'Approved', declined:'Declined' };
          const _pills = _mine.map(r => {
            const d = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
            const col = _statusColor[r.status] || 'var(--text-muted)';
            const lbl = _statusLabel[r.status] || r.status;
            return `<span style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.04);border:1px solid ${col}33;border-radius:20px;padding:3px 10px;font-size:12px;color:${col}"><span style="width:6px;height:6px;border-radius:50%;background:${col};flex-shrink:0"></span>${lbl} · ${d}</span>`;
          }).join(' ');
          _existingBanner = `<div style="margin-bottom:14px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px">
            <div style="font-size:11px;font-weight:600;color:var(--text-muted);letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px">Your requests here</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${_pills}</div>
            <a href="booker-dashboard.html" style="display:inline-block;margin-top:8px;font-size:12px;color:var(--red);text-decoration:none;font-weight:500">View in dashboard →</a>
          </div>`;
        }
      }
    } catch(e) {}
  }

  document.getElementById('bookingCard').innerHTML = `
    ${_existingBanner}
    <div class="booking-price"><strong id="modalSelectedPrice">${priceRangeHtml}</strong> <span>/ ${l.priceUnit}</span><sup style="color:var(--red);font-size:10px;margin-left:2px;cursor:default" title="Venue's starting price before conversation, confirmation, and contractualization.">*</sup></div>
    <p style="font-size:11px;color:var(--text-muted);margin:-6px 0 10px;line-height:1.4">* Starting price — final rate confirmed with the venue before contractualization.</p>

    <div class="mcp-date-row">
      <div class="mcp-date-field" style="flex:1">
        <label>Event Date</label>
        <span id="modalCalDateField">${initDateLabel}</span>
      </div>
    </div>

    <div class="mcp-wrap">
      <div class="mcp-nav">
        <button onclick="modalCalNav(-1)">‹</button>
        <span id="modalCalLabel"></span>
        <button onclick="modalCalNav(1)">›</button>
      </div>
      <div class="mcp-grid" id="modalCalGrid"></div>
      <div class="mcp-legend">
        <button class="mcp-leg-item mcp-my-req-link" onclick="goToBookerCalendar()"><span class="mcp-leg-dot mcp-ld-available"></span>Approved ↗</button>
        <span class="mcp-leg-item"><span class="mcp-leg-dot mcp-ld-pending"></span>Pending (You can still submit)</span>
        <span class="mcp-leg-item"><span class="mcp-leg-dot mcp-ld-booked"></span>Booked</span>
      </div>
    </div>

    <div class="vrf-fields">
      <div class="vrf-field">
        <label class="vrf-label">Event type</label>
        <select id="vrfEventType" class="vrf-input">
          <option>Concert / live show</option>
          <option>Album launch</option>
          <option>Club night / DJ set</option>
          <option>Private event</option>
          <option>Other</option>
        </select>
      </div>
      <div class="vrf-field">
        <label class="vrf-label">Expected attendance</label>
        <input type="number" id="vrfAttendance" class="vrf-input" min="1" max="${l.capacity}"
               placeholder="Up to ${l.capacity.toLocaleString()}"
               oninput="vrfAttendanceCheck(this,${l.capacity})"/>
        <span id="vrfAttendanceErr" class="vrf-error" style="display:none">Capacity is ${l.capacity.toLocaleString()}</span>
      </div>
      <div class="vrf-field">
        <label class="vrf-label">Notes <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
        <textarea id="vrfNotes" class="vrf-input" rows="2" placeholder="Tech rider, load-in needs, special requests…"></textarea>
      </div>
    </div>

    ${l.roomRentalEnabled && l.roomRentalPrice ? `
    <div class="room-rental-option">
      <div class="room-rental-header">
        <span class="room-rental-title">Room rental available</span>
        <span class="room-rental-price">${formatPrice(l.roomRentalPrice)} / night</span>
      </div>
      ${l.roomRentalDesc ? `<p class="room-rental-desc">${l.roomRentalDesc}</p>` : ''}
    </div>` : ''}

    ${l.cancellationPolicy ? `
    <div class="vrf-cancel-policy-box">
      <div class="vrf-cancel-policy-label">Venue cancellation policy</div>
      <div class="vrf-cancel-policy-text">${l.cancellationPolicy.replace(/\n/g, '<br>')}</div>
    </div>` : ''}
    <label class="vrf-cancel-check">
      <input type="checkbox" id="vrfCancelCheck" onchange="document.getElementById('venueReqBtn').disabled=!this.checked"/>
      <span>I have read and agree to the ${l.cancellationPolicy ? 'venue cancellation policy above and ' : ''}<a href="terms.html#cancellation" target="_blank" onclick="event.stopPropagation()">GigNVenue's cancellation terms</a></span>
    </label>
    <button class="booking-reserve-btn" id="venueReqBtn" onclick="submitVenueRequest()" disabled>Request to book</button>
    ${(()=>{ try { return JSON.parse(localStorage.getItem('vf_booker_session')||'null'); } catch(e){} return null; })()
        ? `<button class="msg-venue-btn" onclick="messageVenue(${JSON.stringify(l.title)})"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>Message venue first</button>`
        : `<button class="msg-venue-btn msg-venue-btn-disabled" disabled title="Log in to send messages"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>Log in to message venue</button>`}
    <div id="modalBookingBreakdown">
      <div class="booking-fee-row"><span>Venue fee <sup style="color:var(--red);font-size:9px">*</sup></span><span>${formatPrice(l.price)} / night</span></div>
      <div class="booking-fee-row"><span>Deposit <span class="fee-note">(20% · held; released post-show)</span></span><span>${formatPrice(deposit)}</span></div>
      <div class="booking-fee-row"><span>Artist booking fee <span class="fee-note">(5% · non-refundable)</span></span><span>$${bookingFee.toLocaleString()}</span></div>
      <div class="booking-fee-total"><span>Due on approval</span><span>$${(deposit + bookingFee).toLocaleString()}</span></div>
    </div>
    <p class="booking-no-charge">No payment required to submit a request. The amount shown is due within 48 hours of venue approval.</p>`;

  renderModalCal();

  // Sync modal save button with current wishlist state
  const inWL = appState.wishlist.has(l.id);
  const modalBtn = document.getElementById('modalSaveBtn');
  if (modalBtn) {
    const modalSvg = modalBtn.querySelector('svg');
    modalBtn.onclick = (e) => toggleWishlist(e, l.id);
    modalBtn.classList.toggle('active', inWL);
    modalSvg.setAttribute('fill',   inWL ? '#EF60A3' : 'none');
    modalSvg.setAttribute('stroke', inWL ? 'none'    : 'currentColor');
    document.getElementById('modalSaveBtnLabel').textContent = inWL ? 'Saved' : 'Save';
  }
}

function messageVenue(venueName) {
  try {
    const session = JSON.parse(localStorage.getItem('vf_booker_session') || 'null');
    if (!session) { window.location.href = 'booker-login.html'; return; }
  } catch(e) {}
  window.location.href = `booker-dashboard.html?msg=${encodeURIComponent(venueName)}`;
}

function closeListing() {
  if (appState.selectedListing) setActiveMapPin(appState.selectedListing.id, false);
  document.getElementById('listingModalOverlay').classList.remove('open');
  document.getElementById('listingModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── USER MENU ────────────────────────────────────────────────────────────────

function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('open');
}
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.contains(e.target)) document.getElementById('userDropdown').classList.remove('open');
});

function copyEmail(email) {
  navigator.clipboard.writeText(email)
    .then(() => showToast(`Email address copied: ${email}`))
    .catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = email; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast(`Email address copied: ${email}`);
    });
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
}

// ─── SCROLL EFFECT ────────────────────────────────────────────────────────────

window.addEventListener('scroll', () => {
  document.getElementById('header').style.boxShadow =
    window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.5)' : 'none';
});

// ─── KEYBOARD ────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeListing(); closeSearch(); closeGuestPicker();
  if (document.getElementById('filterModal').classList.contains('open')) toggleFilters();
});
