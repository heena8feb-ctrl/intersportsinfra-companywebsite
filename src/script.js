/* ============================================================
   INTER SPORTS INFRA LLP — global behaviour
   Vanilla JS. No dependencies. Safe to load with `defer`.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile drawer ---------------------------------- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('data-open', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDrawer(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setDrawer(false);
    });
  }

  /* ---------- sticky header shadow --------------------------- */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- scroll reveal (Intersection Observer) ---------- */
  var revealables = document.querySelectorAll('.rv, .steps');
  if (!('IntersectionObserver' in window) || reduce) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-in');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
    }, 1400);
  }

  /* ---------- count-up stats -------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 1150;
    var t0 = null;
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = target % 1 === 0
        ? Math.round(val).toLocaleString('en-IN')
        : val.toFixed(1);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      Array.prototype.forEach.call(counters, function (el) {
        var t = parseFloat(el.getAttribute('data-count'));
        el.textContent = t % 1 === 0 ? Math.round(t).toLocaleString('en-IN') : t.toFixed(1);
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (entry.target.dataset.ran) { cio.unobserve(entry.target); return; }
          entry.target.dataset.ran = '1';
          runCount(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
      setTimeout(function () {
        Array.prototype.forEach.call(counters, function (el) {
          if (el.dataset.ran) return;
          el.dataset.ran = '1';
          runCount(el);
        });
      }, 1400);
    }
  }

  /* ---------- SVG line-drawing: set real path lengths -------- */
  var strokes = document.querySelectorAll('[data-draw] path, [data-draw] circle, [data-draw] line');
  Array.prototype.forEach.call(strokes, function (el, i) {
    var len = 1200;
    try { len = Math.ceil(el.getTotalLength()); } catch (e) {}
    el.style.setProperty('--len', len);
    el.style.animationDelay = (0.1 + i * 0.13) + 's';
  });

  /* ---------- project filter -------------------------------- */
  var filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-sport]');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var want = btn.getAttribute('data-filter');
      Array.prototype.forEach.call(filterBar.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      Array.prototype.forEach.call(items, function (item) {
        var match = want === 'all' || item.getAttribute('data-sport') === want;
        item.hidden = !match;
      });
    });
  }

  /* ---------- accordion ------------------------------------- */
  var accBtns = document.querySelectorAll('.acc__btn');
  Array.prototype.forEach.call(accBtns, function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
    });
    window.addEventListener('resize', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- before / after slider ------------------------- */
  var bas = document.querySelectorAll('.ba');
  Array.prototype.forEach.call(bas, function (ba) {
    var range = ba.querySelector('.ba__range');
    if (!range) return;
    var apply = function () { ba.style.setProperty('--split', range.value + '%'); };
    range.addEventListener('input', apply);
    apply();
  });

  /* ---------- multi-step form ------------------------------- */
  var mform = document.querySelector('[data-multistep]');
  if (mform) {
    var sets = mform.querySelectorAll('fieldset');
    var crumbs = mform.querySelectorAll('.form__steps li');
    var done = mform.querySelector('.form__done');
    var at = 0;

    var paint = function () {
      Array.prototype.forEach.call(sets, function (fs, i) { fs.hidden = i !== at; });
      Array.prototype.forEach.call(crumbs, function (li, i) {
        li.setAttribute('data-on', String(i === at));
      });
    };
    paint();

    mform.addEventListener('click', function (e) {
      var next = e.target.closest('[data-next]');
      var prev = e.target.closest('[data-prev]');
      if (next) {
        var fs = sets[at];
        var bad = null;
        Array.prototype.forEach.call(fs.querySelectorAll('[required]'), function (f) {
          if (!bad && !f.checkValidity()) bad = f;
        });
        if (bad) { bad.reportValidity(); return; }
        if (at < sets.length - 1) { at++; paint(); mform.scrollIntoView ? null : null; }
      }
      if (prev && at > 0) { at--; paint(); }
    });

    mform.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!mform.checkValidity()) { mform.reportValidity(); return; }
      Array.prototype.forEach.call(sets, function (fs) { fs.hidden = true; });
      var nav = mform.querySelector('.form__nav');
      if (nav) nav.hidden = true;
      Array.prototype.forEach.call(crumbs, function (li) { li.setAttribute('data-on', 'true'); });
      if (done) done.setAttribute('data-on', 'true');
    });
  }

  /* ---------- project filters: sport + type ----------------- */
  var multiBar = document.querySelector('[data-filters-multi]');
  if (multiBar) {
    var mItems = document.querySelectorAll('[data-sport][data-type]');
    var state = { sport: 'all', type: 'all' };
    multiBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-key]');
      if (!btn) return;
      var key = btn.getAttribute('data-key');
      state[key] = btn.getAttribute('data-val');
      Array.prototype.forEach.call(multiBar.querySelectorAll('button[data-key="' + key + '"]'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      Array.prototype.forEach.call(mItems, function (item) {
        var ok = (state.sport === 'all' || item.getAttribute('data-sport') === state.sport) &&
                 (state.type === 'all' || item.getAttribute('data-type') === state.type);
        item.hidden = !ok;
      });
    });
  }

  /* ---------- current year ---------------------------------- */
  var yr = document.querySelectorAll('[data-year]');
  Array.prototype.forEach.call(yr, function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
