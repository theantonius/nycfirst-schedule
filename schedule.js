// Build stamp. deploy.sh rewrites the date on every deploy, so the console
// tells you exactly which version a page is running.
var SCHEDULE_BUILD = '2026-09-04 12:28';
console.log('[schedule] build ' + SCHEDULE_BUILD);

document.addEventListener('DOMContentLoaded', function () {
  var list = document.querySelector('.announce-list');
  if (!list) return;
  var rows = [].slice.call(list.querySelectorAll('.announce-row'));
  if (!rows.length) return;

  // Multi-day closures. The Figma spec writes "CLOSED ALL WEEK" for a Mon-Fri
  // span. A two-day closure is not a week, so the wording is chosen by length.
  // Set to false to always say CLOSED ALL DAY.
  var USE_ALL_WEEK = true;

  var WD  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  var MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  function txt(el) { return el ? el.textContent.trim() : ''; }
  function visible(el) { return !!el && el.offsetParent !== null; }

  // "2026-09-21" -> a date built in local time, so no UTC day-shift
  function parseYMD(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  // "2:00 pm - 6:00 pm" -> "2PM TO 6PM"; "10:30 am - 1:00 pm" -> "10:30AM TO 1PM"
  function tidyHours(s) {
    return (s || '')
      .replace(/:00\b/g, '')
      .replace(/\s*[-–—]\s*/, ' TO ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function whenLine(start, end, type, hours) {
    if (!start) return '';
    var multi = end && end.getTime() > start.getTime();
    var when;

    if (!multi) {
      when = WD[start.getDay()] + ' ' + start.getDate() + ' ' + MON[start.getMonth()];
    } else if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      // same month: month named once, at the end
      when = WD[start.getDay()] + ' ' + start.getDate() +
             ' TO ' + WD[end.getDay()] + ' ' + end.getDate() + ' ' + MON[end.getMonth()];
    } else {
      when = WD[start.getDay()] + ' ' + start.getDate() + ' ' + MON[start.getMonth()] +
             ' TO ' + WD[end.getDay()] + ' ' + end.getDate() + ' ' + MON[end.getMonth()];
    }

    var tail;
    if (type === 'closed') {
      var days = multi ? Math.round((end - start) / 86400000) + 1 : 1;
      tail = (multi && USE_ALL_WEEK && days >= 5) ? 'CLOSED ALL WEEK' : 'CLOSED ALL DAY';
    } else {
      tail = hours ? tidyHours(hours) : 'ALL DAY';
    }
    return when + ' · ' + tail;
  }

  // ---------- teaser mode ----------
  // Opt-in via .sc-teaser on the wrapper (the home page). Shows only what
  // starts inside the window, capped, as a flat list with no month headings.
  // The Collection List itself must stay UNLIMITED: the Today's Hours script
  // reads every announcement row to find closures, so trimming the list in
  // Webflow would silently stop a closure from overriding a centre's hours.
  var TEASER_DAYS = 30, TEASER_MAX = 5;
  var teaser = !!(list.closest && list.closest('.sc-teaser'));
  var today0 = new Date(); today0.setHours(0, 0, 0, 0);
  var horizon = new Date(today0.getTime() + TEASER_DAYS * 86400000);
  var teaserShown = 0;

  var stack = document.createElement('div');
  stack.className = 'month-stack';
  list.parentNode.insertBefore(stack, list);

  var card = null, seenMonth = null;

  rows.forEach(function (row) {
    // ---- read what Webflow rendered ----
    var month   = txt(row.querySelector('.month-label'));
    var centre  = txt(row.querySelector('.row-center'));
    var start   = parseYMD(txt(row.querySelector('.row-date')));
    var end     = parseYMD(txt(row.querySelector('.row-enddate')));
    // The title and the announcement are two sibling elements whose classes both
    // begin "announce-body" — sometimes exactly that, sometimes announce-body-name
    // / announce-body-announcement. Order tells them apart, so a class rename in
    // the Designer cannot silently blank the title. Webflow tags an unfilled bind
    // with w-dyn-bind-empty; drop those first so the title never lands in desc.
    var bodies = [].slice.call(row.querySelectorAll('[class*="announce-body"]'))
      .filter(function (e) {
        return !/w-dyn-bind-empty/.test(e.className) && e.textContent.trim();
      });
    var name    = txt(bodies[0]);
    var desc    = txt(bodies[1]);
    // Programs arrive as a delimited list of short codes, e.g. "FLL|FTC".
    // Monday's dropdown hands us comma-separated labels, so accept either.
    // These codes ARE the keys: rename a label on the board and the mapping
    // breaks, which is why they stay short.
    var programs = txt(row.querySelector('.row-programs, .row-program'))
      .split(/[|,]/)
      .map(function (s) { return s.trim().toUpperCase(); })
      .filter(Boolean);
    var regEl   = row.querySelector('.row-reglink');

    if (teaser) {
      if (!start) return;
      var last = end || start;
      if (last < today0) return;              // already finished
      if (start > horizon) return;            // past the window
      if (teaserShown >= TEASER_MAX) return;  // rows arrive date-sorted
      teaserShown++;
    }

    var pillClosed = row.querySelector('.status-pill.is-closed');
    var pillAlt    = row.querySelector('.status-pill.is-alt');
    var pillEvent  = row.querySelector('.status-pill.is-event');

    var type = 'event', pillText = 'EVENT', hours = '';
    if (visible(pillClosed))      { type = 'closed'; pillText = 'CLOSED'; }
    else if (visible(pillAlt))    { type = 'alt';    pillText = 'ALT HOURS'; hours = txt(pillAlt); }
    else if (visible(pillEvent))  { type = 'event';  pillText = 'EVENT';     hours = txt(pillEvent); }
    else {
      // no pill rendered: fall back to the type label
      var t = txt(row.querySelector('.type-label')).toLowerCase();
      if (t.indexOf('clos') === 0) { type = 'closed'; pillText = 'CLOSED'; }
      else if (t.indexOf('alt') === 0) { type = 'alt'; pillText = 'ALT HOURS'; }
    }
    // an event pill carries the hours string, not the word EVENT
    if (type !== 'closed' && /\d/.test(hours) === false) hours = '';

    // ---- month card ----
    if (teaser) {
      card = stack;
    } else if (month !== seenMonth) {
      card = document.createElement('div');
      card.className = 'month-card';
      var h = document.createElement('div');
      h.className = 'month-head';
      h.textContent = month;
      card.appendChild(h);
      stack.appendChild(card);
      seenMonth = month;
    }

    // ---- build the Option C row ----
    var el = document.createElement('div');
    el.className = 'c-row is-' + type;
    el.setAttribute('data-type', type);
    if (programs.length) el.setAttribute('data-programs', programs.join('|'));
    if (centre) el.setAttribute('data-center', centre);

    var stripe = document.createElement('span');
    stripe.className = 'c-stripe';
    el.appendChild(stripe);

    var body = document.createElement('div');
    body.className = 'c-body';

    var top = document.createElement('div');
    top.className = 'c-top';

    var when = document.createElement('span');
    when.className = 'c-when';
    when.textContent = whenLine(start, end, type, hours);
    top.appendChild(when);

    var pill = document.createElement('span');
    pill.className = 'c-pill';
    pill.textContent = pillText;
    top.appendChild(pill);

    body.appendChild(top);

    if (name)   { var n = document.createElement('div'); n.className = 'c-name'; n.textContent = name;   body.appendChild(n); }
    if (centre) { var c = document.createElement('div'); c.className = 'c-loc';  c.textContent = centre; body.appendChild(c); }

    if (programs.length) {
      var tags = document.createElement('div');
      tags.className = 'c-tags';
      programs.forEach(function (pr) {
        var tag = document.createElement('span');
        // unknown codes still render, just in the neutral colour, so adding a
        // programme on the board needs no code change
        tag.className = 'c-tag prog-' + pr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        tag.textContent = pr;
        tags.appendChild(tag);
      });
      body.appendChild(tags);
    }
    if (desc)   { var d = document.createElement('div'); d.className = 'c-desc'; d.textContent = desc;   body.appendChild(d); }

    if (regEl && regEl.getAttribute('href')) {
      var a = document.createElement('a');
      a.className = 'c-reg';
      a.href = regEl.getAttribute('href');
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Register';
      body.appendChild(a);
    }

    el.appendChild(body);
    card.appendChild(el);
  });


  // ---------- filters ----------
  // Opt-in. Only a page whose Upcoming wrapper carries .sc-filters gets a bar,
  // so forgetting the class leaves the previous behaviour untouched rather
  // than putting chips on a three-row teaser.
  var host = list.closest && list.closest('.sc-filters');
  if (host) {
    var allRows = [].slice.call(stack.querySelectorAll('.c-row'));
    var TYPE_LABEL = { event: 'All Events', closed: 'Closures', alt: 'Alt Hours' };
    var typesPresent = [], centresPresent = [], programsPresent = [];

    allRows.forEach(function (r) {
      var ty = r.getAttribute('data-type'), ce = r.getAttribute('data-center');
      if (ty && typesPresent.indexOf(ty) < 0) typesPresent.push(ty);
      if (ce && centresPresent.indexOf(ce) < 0) centresPresent.push(ce);
      (r.getAttribute('data-programs') || '').split('|').forEach(function (pr) {
        if (pr && programsPresent.indexOf(pr) < 0) programsPresent.push(pr);
      });
    });
    programsPresent.sort();
    centresPresent.sort();

    var bar = document.createElement('div');
    bar.className = 'sc-bar';

    // chips are built from what is actually on the page, so a type with no
    // items never offers a filter that returns nothing
    var chipWrap = document.createElement('div');
    chipWrap.className = 'sc-chips';
    ['event', 'closed', 'alt'].forEach(function (ty) {
      if (typesPresent.indexOf(ty) < 0) return;
      var b2 = document.createElement('button');
      b2.type = 'button';
      b2.className = 'sc-chip is-' + ty;
      b2.setAttribute('data-type', ty);
      b2.setAttribute('aria-pressed', 'false');
      b2.textContent = TYPE_LABEL[ty];
      chipWrap.appendChild(b2);
    });
    bar.appendChild(chipWrap);

    var progWrap = null;
    if (programsPresent.length) {
      progWrap = document.createElement('div');
      progWrap.className = 'sc-chips sc-chips-prog';
      programsPresent.forEach(function (pr) {
        var b3 = document.createElement('button');
        b3.type = 'button';
        b3.className = 'sc-chip is-prog prog-' + pr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        b3.setAttribute('data-prog', pr);
        b3.setAttribute('aria-pressed', 'false');
        b3.textContent = pr;
        progWrap.appendChild(b3);
      });
      bar.appendChild(progWrap);
    }

    var sel = document.createElement('select');
    sel.className = 'sc-select';
    sel.setAttribute('aria-label', 'Filter by STEM Center');
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = 'All centers';
    sel.appendChild(opt0);
    centresPresent.forEach(function (ce) {
      var o = document.createElement('option');
      o.value = ce;
      o.textContent = ce;
      sel.appendChild(o);
    });
    bar.appendChild(sel);

    var count = document.createElement('div');
    count.className = 'sc-count';
    bar.appendChild(count);

    var none = document.createElement('div');
    none.className = 'sc-none';
    none.textContent = 'Nothing matches those filters.';
    none.hidden = true;

    stack.parentNode.insertBefore(bar, stack);
    stack.parentNode.insertBefore(none, stack.nextSibling);

    var active = [], activeProg = [];   // empty means no filter on that axis

    function apply() {
      var centre = sel.value, shown = 0;

      allRows.forEach(function (r) {
        var okType = !active.length || active.indexOf(r.getAttribute('data-type')) > -1;
        var okCentre = !centre || r.getAttribute('data-center') === centre;
        // a row matches if it carries ANY of the selected programmes
        var rowProgs = (r.getAttribute('data-programs') || '').split('|');
        var okProg = !activeProg.length || activeProg.some(function (pr) {
          return rowProgs.indexOf(pr) > -1;
        });
        var show = okType && okCentre && okProg;
        r.style.display = show ? '' : 'none';
        if (show) shown++;
      });

      // a month card with nothing left in it is noise
      [].slice.call(stack.querySelectorAll('.month-card')).forEach(function (card) {
        var any = [].slice.call(card.querySelectorAll('.c-row')).some(function (r) {
          return r.style.display !== 'none';
        });
        card.style.display = any ? '' : 'none';
      });

      // One constant phrasing. Switching between "4 items" and "Showing 1 of 4"
      // changed the width of this element, which reflowed the whole bar.
      count.textContent = 'Showing ' + shown + ' of ' + allRows.length;
      none.hidden = (shown !== 0);
    }

    function toggle(list, value, el) {
      var i = list.indexOf(value);
      if (i > -1) { list.splice(i, 1); el.setAttribute('aria-pressed', 'false'); }
      else { list.push(value); el.setAttribute('aria-pressed', 'true'); }
      apply();
    }

    bar.addEventListener('click', function (e) {
      var hit = e.target.closest ? e.target.closest('.sc-chip') : null;
      if (!hit) return;
      if (hit.hasAttribute('data-prog')) toggle(activeProg, hit.getAttribute('data-prog'), hit);
      else toggle(active, hit.getAttribute('data-type'), hit);
    });

    sel.addEventListener('change', apply);
    apply();
  }


  // ---------- teaser layout ----------
  // The home page section was built as two grid columns, but the left one only
  // holds a subtitle, so it rendered as a tall empty white box with a sliver of
  // the background photo showing through the gap. Fold whatever is in the other
  // columns into the panel that holds the list, then remove the emptied ones.
  // Content is MOVED, never discarded. CSS collapses the grid to one column.
  if (teaser) {
    var grid = list.closest && list.closest('.sc-teaser');
    var keep = grid && [].slice.call(grid.children).filter(function (c) {
      return c.contains(list);
    })[0];

    if (grid && keep) {
      keep.classList.add('sc-keep');
      [].slice.call(grid.children).forEach(function (col) {
        if (col === keep) return;
        var frag = document.createDocumentFragment();
        while (col.firstChild) frag.appendChild(col.firstChild);
        keep.insertBefore(frag, keep.firstChild);   // fragment preserves order
        col.parentNode.removeChild(col);
      });
    }
  }

  list.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function () {
  var DAYS  = ['sun','mon','tue','wed','thu','fri','sat'];
  var NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // The announcements collection and the hours collection do not name centers the same
  // way. Canonicalise both sides to an abbreviation before matching, or a closed center
  // silently shows its normal opening hours. Unlisted names fall back to matching
  // themselves, so a ninth center degrades gracefully.
  var ALIASES = {
    'washington heights': 'WH',
    'cornell tech': 'CT',
    'andrew freedman home': 'AFH',
    'hudson yards': 'HY',
    'd13': 'D13',
    'school district 13': 'D13',
    'district 13 stem center': 'D13',
    'qpl far rockaway': 'FR',
    'far rockaway': 'FR',
    'qpl jamaica central': 'JA',
    'jamaica': 'JA',
    'qpl cambria heights': 'CH',
    'cambria heights': 'CH'
  };
  function ckey(s) {
    var k = String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return ALIASES[k] || k;
  }

  // Card order, matching the nav menu on the internal site. Done here rather than with a
  // CMS sort field, because adding a field is a collection structure change and that
  // blocks Webflow's publish-one-item-at-a-time, forcing a full site publish.
  var ORDER = ['CT','WH','D13','AFH','FR','CH','JA','HY'];

  // Public-facing name overrides, keyed on the canonical abbreviation. Lets a card read
  // differently from the CMS item name without editing items we do not own.
  var DISPLAY = {
    'D13': 'D13'
  };

  // Public wording for the labels that are not clock hours, keyed on the CMS text
  // lowercased. Lets the pill and the sentence differ from what the hours field says.
  var SPECIALS = {
    'by appointment': {
      pill: 'SCHEDULED PROGRAMS',
      detail: 'Open for scheduled student and educator programs. No public drop-in hours.'
    }
  };

  function nyParts() {
    var f = new Intl.DateTimeFormat('en-US', { timeZone:'America/New_York', hour12:false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', weekday:'short' });
    var o = {};
    f.formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    var wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
    var hh = parseInt(o.hour, 10) % 24;   // hour12:false can report 24 at midnight
    return { iso: o.year + '-' + o.month + '-' + o.day, wd: wd, min: hh * 60 + parseInt(o.minute, 10) };
  }

  function toMin(s) {
    var m = s.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!m) return null;
    var h = parseInt(m[1],10), mi = m[2] ? parseInt(m[2],10) : 0, ap = m[3];
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    var v = h * 60 + mi;
    return v === 0 ? 1440 : v;          // midnight as an end time means end of day
  }

  function parseRange(raw) {
    if (!raw) return { kind:'closed' };
    var s = raw.trim();
    if (!s || /^closed$/i.test(s)) return { kind:'closed' };
    var parts = s.split(/\s*(?:-|–|—|to)\s*/i);
    if (parts.length === 2) {
      var a = toMin(parts[0]), b = toMin(parts[1]);
      if (a !== null && b !== null) return { kind:'range', start:a, end:b, label:s };
    }
    return { kind:'special', label:s };
  }

  function fmt(min) {
    var h = Math.floor(min / 60) % 24, mi = min % 60;
    var ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (mi < 10 ? '0' + mi : mi) + ' ' + ap;
  }

  function visible(el) { return !!el && getComputedStyle(el).display !== 'none'; }

  // Read today's announced changes off the rendered Upcoming rows.
  var overrides = {};
  document.querySelectorAll('.announce-row').forEach(function (row) {
    var c = row.querySelector('.row-center'), d = row.querySelector('.row-date');
    if (!c || !d) return;

    // An Event is informational and has no effect on hours. Skip it entirely — writing
    // an override here would mark the center closed, since anything that is not a
    // visible alt-hours pill is treated as a closure below.
    if (visible(row.querySelector('.status-pill.is-event'))) return;

    var altPill = row.querySelector('.status-pill.is-alt');
    var k = ckey(c.textContent) + '|' + d.textContent.trim();
    if (overrides[k] && overrides[k].kind === 'closed') return;   // a closure outranks alt hours
    overrides[k] = visible(altPill)
      ? { kind:'alt', label: altPill.textContent.trim() }
      : { kind:'closed' };
  });

  function isoPlus(iso, n) {
    var p = iso.split('-');
    var dt = new Date(Date.UTC(+p[0], +p[1]-1, +p[2]));
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.toISOString().slice(0,10);
  }

  var hoursList = document.querySelector('.hours-list');
  if (hoursList) {
    [].slice.call(hoursList.querySelectorAll('.center-card'))
      .map(function (card) {
        var el = card.querySelector('.center-name-today');
        var idx = ORDER.indexOf(ckey(el ? el.textContent : ''));
        return { card: card, idx: idx < 0 ? 999 : idx };
      })
      .sort(function (a, b) { return a.idx - b.idx; })
      .forEach(function (o) { hoursList.appendChild(o.card); });
  }

  var now = nyParts();

  document.querySelectorAll('.center-card').forEach(function (card) {
    var nameEl = card.querySelector('.center-name-today');
    var pill   = card.querySelector('.status-pill');
    var detail = card.querySelector('.center-detail');
    if (!nameEl || !pill || !detail) return;

    var ck = ckey(nameEl.textContent);
    if (DISPLAY[ck]) nameEl.textContent = DISPLAY[ck];

    function dayInfo(offset) {
      var iso = isoPlus(now.iso, offset);
      var ov = overrides[ck + '|' + iso];
      if (ov && ov.kind === 'closed') return { kind:'closed', over:true };
      if (ov && ov.kind === 'alt') { var r = parseRange(ov.label); r.over = true; return r; }
      var el = card.querySelector('.h-' + DAYS[(now.wd + offset) % 7]);
      return parseRange(el ? el.textContent : '');
    }

    function dayLabel(i) {
      if (i === 0) return 'today';
      if (i === 1) return 'tomorrow';
      if (i < 7) return NAMES[(now.wd + i) % 7];
      return 'on ' + isoPlus(now.iso, i);
    }

    // Next day this center is usable, as a phrase that includes the closing time.
    function nextOpenPhrase() {
      for (var i = 0; i < 14; i++) {
        var d = dayInfo(i);
        if (d.kind === 'closed') continue;
        if (d.kind === 'special') {
          if (i === 0) continue;
          return 'Scheduled programs ' + dayLabel(i);
        }
        if (i === 0 && now.min >= d.start) continue;
        return 'Open ' + fmt(d.start) + ' – ' + fmt(d.end) + ' ' + dayLabel(i);
      }
      return 'Reopening to be announced';
    }

    function setPill(cls, text) {
      pill.className = 'status-pill ' + cls;
      pill.textContent = text;
    }

    var today = dayInfo(0);

    // No clock hours today — by appointment, scheduled programs, and similar.
    if (today.kind === 'special') {
      var sp = SPECIALS[today.label.trim().toLowerCase()];
      setPill('is-special', sp ? sp.pill : today.label.toUpperCase());
      detail.textContent = sp ? sp.detail : today.label;
      return;
    }

    // Shut all day: the CMS says Closed, or a closure was announced.
    if (today.kind === 'closed') {
      setPill('is-closed', 'CLOSED TODAY');
      detail.textContent = 'Closed today · ' + nextOpenPhrase() + '.';
      return;
    }

    // An announced alt-hours day keeps the yellow pill all day, showing the actual hours.
    // Rare and important enough to outrank the pill-describes-right-now rule below.
    if (today.over) {
      setPill('is-alt', today.label.toUpperCase());
      if (now.min >= today.start && now.min < today.end) {
        detail.textContent = 'Open until ' + fmt(today.end) + ' · Special hours today.';
      } else if (now.min < today.start) {
        detail.textContent = 'Closed now · Special hours today, opens ' + fmt(today.start) + '.';
      } else {
        detail.textContent = 'Closed for the day · ' + nextOpenPhrase() + '.';
      }
      return;
    }

    // Regular hours. The pill stays REGULAR HOURS all day — it answers "is this center
    // running its normal schedule", not "is the door open this minute". The detail line
    // carries the right-now status.
    setPill('is-open', 'REGULAR HOURS');
    if (now.min >= today.start && now.min < today.end) {
      detail.textContent = 'Open until ' + fmt(today.end) + '.';
    } else if (now.min < today.start) {
      detail.textContent = 'Closed now · Open ' + fmt(today.start) + ' – ' + fmt(today.end) + ' today.';
    } else {
      detail.textContent = 'Closed for the day · ' + nextOpenPhrase() + '.';
    }
  });
});

// Today's Hours works out closures by reading the Upcoming rows. A page with
// the hours block but no announcement rows will quietly show normal hours for
// a closed centre, which is worse than an error. Say so in the console.
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.hours-list') && !document.querySelector('.announce-row')) {
    console.warn('[schedule] Today\'s Hours is on this page but the announcements '
      + 'Collection List is not. Closures and alternate hours will NOT override '
      + 'the regular hours. Add the announcements list to this page.');
  }
});
