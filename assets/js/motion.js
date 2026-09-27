/* ============================================================
   PARSIAN — motion layer (scroll reveal, parallax, counters)
   Additive only: observes the DOM that common.js/site.js render
   and layers entrance animation + parallax on top. Never touches
   data.json or the markup those files produce.
   ============================================================ */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var processed = new WeakSet();
  var counted = new WeakSet();

  /* ---------------- scroll progress bar ---------------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(bar);
  });

  function updateProgress() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var height = (h.scrollHeight - h.clientHeight) || 1;
    bar.style.width = Math.min(100, Math.max(0, (scrollTop / height) * 100)) + '%';
  }

  /* ---------------- header shrink on scroll ---------------- */
  function updateHeader() {
    var header = document.querySelector('header.site');
    if (!header) return;
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
  }

  /* ---------------- hero parallax ----------------
     Layered depth on scroll (after Osmo's parallax header): progress runs
     0 → 1 from the top of the page until the hero has scrolled away, and is
     published as --hero-p / --hero-y for motion.css to spread across the
     layers. It eases toward the scroll position every frame, so the layers
     glide like a smooth-scrolled page without taking over native scrolling. */
  var heroP = 0, heroRaf = 0, heroLast = 0;
  function heroStep(now) {
    heroRaf = 0;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var y = window.scrollY || window.pageYOffset;
    var height = hero.offsetHeight;
    var span = hero.getBoundingClientRect().top + y + height;
    var target = span > 0 ? Math.min(1, Math.max(0, y / span)) : 0;
    var dt = heroLast ? Math.min(64, now - heroLast) : 16;
    heroLast = now;
    heroP += (target - heroP) * (1 - Math.exp(-dt / 90));
    if (Math.abs(target - heroP) < 0.0004) heroP = target;
    hero.style.setProperty('--hero-p', heroP.toFixed(4));
    hero.style.setProperty('--hero-y', (heroP * height).toFixed(1) + 'px');
    if (heroP !== target) heroRaf = requestAnimationFrame(heroStep);
    else heroLast = 0;
  }
  function updateHeroParallax() {
    if (reduced || heroRaf) return;
    heroRaf = requestAnimationFrame(heroStep);
  }

  var rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      updateProgress();
      updateHeader();
      updateHeroParallax();
      rafPending = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------------- number counters ---------------- */
  function toLatinDigits(s) {
    var fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩';
    return s.replace(/[۰-۹٠-٩]/g, function (d) {
      var i = fa.indexOf(d); if (i > -1) return String(i);
      i = ar.indexOf(d); return i > -1 ? String(i) : d;
    });
  }

  function animateCounter(el) {
    if (counted.has(el)) return;
    var raw = (el.textContent || '').trim();
    var latin = toLatinDigits(raw);
    var m = latin.match(/^([+\-±]?)(\d+(?:[.,]\d+)?)(.*)$/);
    if (!m) return; // non-numeric value (e.g. "IP54", "HV±") — leave as static reveal
    counted.add(el);
    var prefix = m[1] || '';
    var target = parseFloat(m[2].replace(',', '.'));
    var suffix = m[3] || '';
    var decimals = (m[2].split('.')[1] || m[2].split(',')[1] || '').length;
    if (reduced) { el.textContent = raw; return; }
    var start = null;
    var dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }

  /* ---------------- reveal + stagger setup ---------------- */
  var REVEAL_SELECTOR = [
    '.section-head', '.highlight-banner', '.industries .industry',
    '.portfolio-grid .portfolio-tile', '.stats-row .st', '.svc-grid .svc-card',
    '.news-grid .news-card', '.team-grid .team-card', '.aux-list .aux-tile',
    '.overview-grid .overview-tile', '.gal-grid .gal-item', '.cta-strip',
    '.timeline .row', '.contact-info .item', '.contact-form',
    '.spec-stats-row .st', '.prod-head', '.service-detail', '.aux-detail'
  ].join(',');

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add('is-visible');
          var counter = el.matches('.st, .spec-stats-row .st') ? el.querySelector('b') : null;
          if (counter) animateCounter(counter);
          io.unobserve(el);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    : null;

  function prepareElement(el, index, groupSize) {
    if (processed.has(el)) return;
    processed.add(el);
    el.classList.add('reveal');
    var delay = Math.min(index % 8, 8) * 60;
    el.style.transitionDelay = delay + 'ms';
    if (reduced || !io) {
      el.classList.add('is-visible');
      var counter = el.matches('.st, .spec-stats-row .st') ? el.querySelector('b') : null;
      if (counter) counter.textContent = counter.textContent; // no-op, keep static
      return;
    }
    io.observe(el);
  }

  function scanAndPrepare(root) {
    var scope = root || document;
    scope.querySelectorAll(REVEAL_SELECTOR).forEach(function (el, i) {
      // index relative to siblings within its own parent, for a natural stagger
      var siblings = Array.prototype.slice.call(el.parentElement ? el.parentElement.children : []);
      var idx = siblings.indexOf(el);
      prepareElement(el, idx < 0 ? i : idx);
    });
  }

  /* mounts render asynchronously after fetch(data.json); watch for that */
  var mo = new MutationObserver(function (mutations) {
    var shouldScan = mutations.some(function (m) { return m.addedNodes && m.addedNodes.length; });
    if (shouldScan) scanAndPrepare(document);
  });

  function boot() {
    scanAndPrepare(document);
    mo.observe(document.body, { childList: true, subtree: true });
    updateProgress();
    updateHeader();
    updateHeroParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
