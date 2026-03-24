/* ============================================================
   GIGNVENUE CHAT WIDGET — chat-widget.js
   Self-contained Q&A chat with contact fallback.
   Include after <body> on any page.
   ============================================================ */
(function () {
  'use strict';

  // ─── Q&A CORPUS ────────────────────────────────────────────────────────────
  // Each entry: { keywords[], answer (HTML string), label (for chips) }
  const QA = [

    /* ── General / How it works ── */
    {
      label: 'What is GigNVenue?',
      keywords: ['what is gignvenue','what is this','about','how does it work','platform','purpose','what do you do'],
      answer: 'GigNVenue is a booking marketplace that connects independent artists and musicians with live music venues across the US. Artists browse venues, request dates, and manage bookings — venues list their space, review requests, and fill their calendar. No middlemen, no cold calls.',
    },
    {
      label: 'Is it free to browse?',
      keywords: ['free','cost','browse','search','sign up','create account','fee to browse','fee to join','subscription'],
      answer: 'Browsing venues and submitting booking requests is always free. GigNVenue charges artists a 5% booking fee on the listed nightly rate when they book. Venue hosts pay their own 5% only after a show successfully plays off — they retain 95% of their nightly rate. No upfront cost for venues, ever.',
    },

    /* ── Booking requests (artist) ── */
    {
      label: 'How do I request a venue?',
      keywords: ['request','submit','book','booking','how to book','apply','send request','how do i book'],
      answer: 'Search for venues on the main page, open a venue profile, and click <strong>Request to book</strong>. Fill in your event type, date, expected attendance, and any notes, then agree to the terms and submit. No payment is required at this stage — the venue reviews your request and responds, usually within 1–2 business days.',
    },
    {
      label: 'Can I request multiple venues?',
      keywords: ['multiple','same date','two venues','more than one','simultaneous','competing requests'],
      answer: "Yes — you can send requests to multiple venues for the same date simultaneously. There's no penalty. If one venue approves your request and you complete payment, any other pending requests for that date are automatically cancelled and recorded in your history.",
    },
    {
      label: 'How long to hear back?',
      keywords: ['hear back','response time','how long','wait','days','reply','response'],
      answer: "Hosts are strongly encouraged to respond within 1–2 business days. You're free to request other venues in the meantime and can cancel a pending request at any time with no penalty.",
    },

    /* ── Approval & payment (artist) ── */
    {
      label: 'What happens after approval?',
      keywords: ['approved','approval','confirmed','what happens next','after approval','payment window','48 hours','complete payment'],
      answer: 'When a venue approves your request, you\'ll be notified and given <strong>48 hours to complete payment</strong> — a 20% venue deposit plus a booking fee. The same amounts you saw before submitting. Once payment is made, your date is locked and confirmed. If payment isn\'t completed in time, the approval expires and the date is released.',
    },
    {
      label: 'What is the deposit?',
      keywords: ['deposit','20%','hold','security','refund','where does deposit go'],
      answer: 'The deposit is <strong>20% of the venue\'s listed nightly rate</strong>. It\'s collected when you book and held securely until after your event. Within 24 hours of the show playing off, the deposit is released to the venue — GigNVenue\'s 5% platform fee (on the nightly rate) is collected at that point. The deposit is a security hold that protects both you and the venue.',
    },
    {
      label: 'What is the booking fee?',
      keywords: ['booking fee','fee','percent','8%','charge','platform fee','service fee','non-refundable'],
      answer: 'Artists pay a <strong>5% booking fee</strong> on the listed nightly rate — non-refundable, covers payment processing and platform support. Venue hosts retain 95% of their nightly rate — GigNVenue\'s 5% share is only earned once we deliver a booked night and a played-off show. No listing fee, no upfront charges for venues.',
    },

    /* ── Declined / cancelled (artist) ── */
    {
      label: 'My request was declined',
      keywords: ['declined','rejected','denied','not approved','request declined','why declined','why was i declined','why did they decline','why did the venue decline'],
      answer: 'A decline is almost never about the artist. Venues decline for all kinds of reasons — a conflicting booking, a change in their calendar, a different event type they\'re prioritising that period, or simply availability. It\'s not a reflection on you or your act. Your request moves to the <strong>Declined tab</strong> with no penalty to your account, and you\'re free to request other venues right away. You can also tap <strong>Join waitlist</strong> on the declined booking — if that date opens up later, you\'ll be notified.',
    },
    {
      label: 'What is the waitlist?',
      keywords: ['waitlist','wait list','waiting list','date opens','notification','notified when','date become available','if they change their mind'],
      answer: 'On any declined booking, you can tap <strong>Join waitlist</strong>. If that venue\'s date later becomes available (cancellation or change of plans), you\'ll be notified so you can submit a new request. You can leave the waitlist at any time.',
    },
    {
      label: 'A booking was cancelled',
      keywords: ['cancelled','canceled','cancellation','cancel booking','rebook','re-book','date released'],
      answer: 'Cancellations move the booking to your <strong>Cancelled tab</strong> and release the date back to the venue\'s calendar. Use the <strong>Rebook a date →</strong> button on any cancelled booking to return to that venue and request a different date. Refunds follow the venue\'s cancellation policy and GigNVenue\'s cancellation terms — both visible before you submitted.',
    },
    {
      label: 'Cancellation policy',
      keywords: ['cancellation policy','cancel policy','refund policy','terms','window','days before'],
      answer: 'Each venue sets its own cancellation window — typically 21–60 days for a full deposit refund, with partial refunds for later cancellations, and no refund within the final window. You can see a venue\'s exact policy in their profile before you request. GigNVenue\'s booking fee is always non-refundable. Full terms at <a href="terms.html#cancellation">terms.html</a>.',
    },

    /* ── Saved venues & searches ── */
    {
      label: 'Saving venues & searches',
      keywords: ['save','saved','heart','wishlist','favorites','favourite','save venue','save search','notify','alert'],
      answer: 'Click the ♥ heart on any venue to save it — find saved venues in your dashboard\'s <strong>Saved Venues</strong> section anytime. After applying filters on the browse page, a <strong>Save this search</strong> bar appears — tap it to get notified when new venues match your filters.',
    },

    /* ── Artist profile ── */
    {
      label: 'Artist profile & EPK',
      keywords: ['profile','epk','press kit','bio','genre','spotify','soundcloud','artist profile','band profile','social links','setup profile'],
      answer: 'Your artist profile IS your EPK. Fill it out from the <strong>Profile</strong> tab in your dashboard — bio, genre, act type, social links, Spotify or SoundCloud embeds, photos, and a PDF press kit link. Venue hosts can view it from any booking request.',
    },

    /* ── Tour planner ── */
    {
      label: 'Tour Planner',
      keywords: ['tour','tour planner','multi-city','multiple cities','route','stops','tour dates'],
      answer: '<strong>Tour Planner is coming soon.</strong> It will let you add multiple stops — city + date — for an upcoming tour, browse available venues for each stop, and submit booking requests to all of them in one go. For now, browse venues city by city and submit individual requests. Use the "Suggest a venue" option to nominate a space in any market you\'re touring.',
    },

    /* ── Host: approvals & holds ── */
    {
      label: 'Approving or declining requests (host)',
      keywords: ['approve','decline','host','accept request','reject request','confirm booking','how to approve'],
      answer: 'In your <strong>Bookings → Pending tab</strong>, click Details on any request to see full info — event type, attendance, artist notes. Use the status dropdown to Confirm or Cancel. When you confirm, the artist gets 48 hours to complete payment. If multiple artists request the same date, you can approve the best fit and all others are auto-declined.',
    },
    {
      label: 'Multiple requests for the same date',
      keywords: ['hold','first hold','second hold','priority','multiple artists','same date','competing','hold position','other artists','another artist'],
      answer: 'When multiple artists request the same date at a venue, the host evaluates each request and confirms the one that\'s the best fit for their space and calendar. If you\'re waiting on a response, it may simply mean the host is still weighing their options — not that your request has been dismissed. If you\'re a host managing multiple requests for a date, you can privately rank them using hold positions in your Bookings section. No commitment is made until you confirm.',
    },

    /* ── Host: deposit & payment ── */
    {
      label: 'When do I receive the deposit? (host)',
      keywords: ['receive deposit','when paid','payout','when do i get','deposit release','host payment'],
      answer: 'The artist\'s 20% deposit is collected and held by GigNVenue when they book. It\'s <strong>released to you within 24 hours</strong> of you marking the show as played off. On a $1,000 night, your cost is $50 — that\'s it. Your $800 nightly rate is collected directly from the artist on your own terms. Then the deposit lands in your account too — making you whole with nothing but income. GigNVenue handles the $50 fee from the deposit automatically; you never write a check. The fee is also flagged as a deductible business expense in your exported earnings CSV.',
    },
    {
      label: 'Artist misses payment window',
      keywords: ['artist didn\'t pay','no payment','missed payment','payment window','didn\'t complete','expired approval'],
      answer: 'Artists have 48 hours to complete payment after approval. If payment isn\'t made in time, the booking auto-cancels and the date returns to your calendar — free for you to approve another artist. You can also message the artist directly before the window closes.',
    },

    /* ── Host: calendar ── */
    {
      label: 'Blocking dates (host)',
      keywords: ['block','blocked','block date','unavailable','close date','mark unavailable'],
      answer: 'Click any date in your <strong>Availability Calendar</strong> and select <em>Blocked</em>. Blocked dates won\'t accept new booking requests. You can also set a recurring weekly block — for example, every Monday for 12 weeks — using the repeat option.',
    },
    {
      label: 'Featured Night (host)',
      keywords: ['featured night','feature','promote date','open date','special rate','featured','notify artists'],
      answer: 'From your Availability Calendar, click any open future date and select <strong>Feature this night</strong>. Optionally set a reduced rate and add a short pitch. We notify artists who\'ve saved your venue and those whose genre matches. Runs for up to 14 days or until booked.',
    },
    {
      label: 'Add a show manually (host)',
      keywords: ['manual','add show','add to calendar','self-managed','manually add','add booking','add event'],
      answer: 'Click any date in your Availability Calendar and choose a status — <em>Pending</em> (expected but not confirmed) or <em>Booked</em> (confirmed). Enter the artist or event name and save. The show is tracked in your Earnings section once the date passes.',
    },

    /* ── Host: multi-venue & ratings ── */
    {
      label: 'Multiple venues (host)',
      keywords: ['multiple venues','more than one venue','two venues','manage venues','multi-venue','several venues'],
      answer: 'Yes — one host account can manage any number of venue listings. Each listing has its own profile, calendar, and booking history, all accessible from your single dashboard.',
    },
    {
      label: 'Rating system',
      keywords: ['rating','review','rate artist','score','reliability','would book again','star','stars'],
      answer: 'After marking a show as played off, you\'re prompted to rate the artist on three questions: performed as expected, professional, and would you book again. Optional short note included. Ratings lock after 48 hours. Artist ratings from all hosts are visible when you review new incoming requests.',
    },

  ];

  // ─── SUGGESTED QUICK TOPICS ────────────────────────────────────────────────
  const SUGGESTIONS = [
    'How do I request a venue?',
    'What is the booking fee?',
    'What is the deposit?',
    'My request was declined',
    'A booking was cancelled',
    'Approving requests (host)',
  ];

  // ─── MATCHER ───────────────────────────────────────────────────────────────
  function findAnswer(query) {
    const q = query.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const tokens = q.split(/\s+/).filter(t => t.length > 2);
    if (!tokens.length) return null;

    let best = null;
    let bestScore = 0;

    QA.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        // Exact phrase match: high weight
        if (q.includes(kwLower)) {
          score += kwLower.split(' ').length * 2;
          return;
        }
        // Token overlap
        const kwTokens = kwLower.split(/\s+/);
        const overlap = tokens.filter(t => kwTokens.includes(t)).length;
        score += overlap;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    // Require minimum relevance
    return bestScore >= 2 ? best : null;
  }

  // ─── WIDGET HTML ───────────────────────────────────────────────────────────
  function buildWidget() {
    const btn = document.createElement('button');
    btn.id = 'gnv-chat-btn';
    btn.setAttribute('aria-label', 'Open GigNVenue support chat');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      <span id="gnv-chat-badge"></span>`;

    const panel = document.createElement('div');
    panel.id = 'gnv-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'GigNVenue support chat');
    panel.innerHTML = `
      <div class="gnv-chat-header">
        <div class="gnv-chat-avatar">🎸</div>
        <div class="gnv-chat-header-text">
          <div class="gnv-chat-header-name">GigNVenue Support</div>
          <div class="gnv-chat-header-sub">Ask anything about the platform</div>
        </div>
        <button class="gnv-chat-close" id="gnv-chat-close-btn" aria-label="Close chat">✕</button>
      </div>
      <div id="gnv-chat-messages"></div>
      <div class="gnv-chat-input-row">
        <input id="gnv-chat-input" type="text" placeholder="Ask a question…" autocomplete="off" maxlength="200"/>
        <button id="gnv-chat-send" aria-label="Send">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
            <line x1="22" y1="2" x2="11" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white"/>
          </svg>
        </button>
      </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(panel);
    return { btn, panel };
  }

  // ─── MESSAGING HELPERS ─────────────────────────────────────────────────────
  function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
  }

  function addMessage(container, html, type) {
    const div = document.createElement('div');
    div.className = `gnv-msg gnv-msg-${type}`;
    div.innerHTML = html;
    container.appendChild(div);
    scrollToBottom(container);
    return div;
  }

  function showTyping(container) {
    const div = document.createElement('div');
    div.className = 'gnv-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    scrollToBottom(container);
    return div;
  }

  function addChips(container, labels, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'gnv-chips';
    labels.forEach(label => {
      const chip = document.createElement('button');
      chip.className = 'gnv-chip';
      chip.textContent = label;
      chip.onclick = () => onPick(label);
      wrap.appendChild(chip);
    });
    container.appendChild(wrap);
    scrollToBottom(container);
    return wrap;
  }

  // Capture script base path at evaluation time (before DOMContentLoaded)
  const _scriptSrc = (function () {
    const s = document.currentScript;
    return s ? s.src.replace('chat-widget.js', '') : '';
  }());

  // ─── MAIN LOGIC ────────────────────────────────────────────────────────────
  function init() {
    // Inject stylesheet (only once)
    if (!document.getElementById('gnv-chat-css')) {
      const link = document.createElement('link');
      link.id = 'gnv-chat-css';
      link.rel = 'stylesheet';
      link.href = _scriptSrc + 'chat-widget.css';
      document.head.appendChild(link);
    }

    const { btn, panel } = buildWidget();
    const messages  = panel.querySelector('#gnv-chat-messages');
    const input     = panel.querySelector('#gnv-chat-input');
    const sendBtn   = panel.querySelector('#gnv-chat-send');
    const closeBtn  = panel.querySelector('#gnv-chat-close-btn');
    let isOpen = false;
    let hasGreeted = false;

    function openChat() {
      isOpen = true;
      panel.classList.add('open');
      // Switch button icon to X
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="white"><line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`;
      input.focus();
      if (!hasGreeted) {
        hasGreeted = true;
        greet();
      }
    }

    function closeChat() {
      isOpen = false;
      panel.classList.remove('open');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><span id="gnv-chat-badge"></span>`;
    }

    btn.addEventListener('click', () => { isOpen ? closeChat() : openChat(); });
    closeBtn.addEventListener('click', closeChat);

    function greet() {
      const botMsg = addMessage(messages,
        "Hi! I'm the GigNVenue help bot. I can answer questions about bookings, fees, cancellations, and how the platform works. What would you like to know?",
        'bot');
      addChips(botMsg.parentElement, SUGGESTIONS, handleUserInput);
    }

    function handleUserInput(text) {
      const query = text.trim();
      if (!query) return;
      input.value = '';

      addMessage(messages, escapeHtml(query), 'user');

      const typing = showTyping(messages);

      setTimeout(() => {
        typing.remove();
        const match = findAnswer(query);
        if (match) {
          addMessage(messages, match.answer, 'bot');
          // Offer follow-up chips from a different category
          const others = SUGGESTIONS.filter(s => s !== match.label).slice(0, 3);
          if (others.length) {
            const followup = addMessage(messages, 'Anything else I can help with?', 'bot');
            addChips(followup.parentElement, others, handleUserInput);
          }
        } else {
          addMessage(messages,
            `I didn't find a specific answer to that — but our support team can help. <a href="contact.html">Contact us →</a><br><br>You can also browse the <a href="help.html">Help Center</a> for detailed guides.`,
            'bot');
        }
      }, 650);
    }

    function escapeHtml(s) {
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    sendBtn.addEventListener('click', () => handleUserInput(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleUserInput(input.value);
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
