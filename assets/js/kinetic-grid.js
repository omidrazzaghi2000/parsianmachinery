/* ============================================================
   PARSIAN — kinetic grid (home hero background)
   A canvas grid that warps toward the pointer and ripples on click,
   after the "Kinetic Grid" component: same cell size, influence
   radius, warp, easing, colours and ripple timing. It draws over the
   hero's navy gradient instead of painting its own charcoal fill.
   Redraws only while something moves, and sleeps while the hero is
   off-screen or the tab is hidden.
   ============================================================ */
(function () {
  var CELL_SIZE = 55;
  var INFLUENCE_RADIUS = 260;
  var MAX_WARP = 24;
  var DOT_SPACING = 28;
  var LERP_SPEED = 0.08;

  var LINE_BASE   = { r: 255, g: 255, b: 255, a: 0.13 };
  var LINE_ACTIVE = { r: 74,  g: 158, b: 255, a: 0.9 };
  var NODE_BASE   = { r: 255, g: 255, b: 255, a: 0.2 };
  var NODE_ACTIVE = { r: 74,  g: 158, b: 255, a: 1 };
  var GLOW = '74,158,255';
  var RIPPLE = '100,180,255';
  var NODE_BASE_RADIUS = 1.8;
  var NODE_ACTIVE_RADIUS = 3.2;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(a, b, t) {
    return 'rgba(' + Math.round(lerp(a.r, b.r, t)) + ',' + Math.round(lerp(a.g, b.g, t)) + ',' +
      Math.round(lerp(a.b, b.b, t)) + ',' + lerp(a.a, b.a, t).toFixed(3) + ')';
  }
  function smooth(x) { return x * x * (3 - 2 * x); }

  var current = null;   // the hero is re-rendered on language switch

  function mount(canvas, host) {
    if (current) { current(); current = null; }
    if (!canvas || !host || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0, H = 0, dpr = 1, dots = null;
    var client = null;                        // last pointer position (viewport coords)
    var mouse = { x: -9999, y: -9999 }, target = { x: -9999, y: -9999 };
    var presence = 0, inside = false;         // eases the warp in/out as the pointer enters/leaves
    var ripples = [];
    var raf = 0, visible = true, dirty = true;

    /* ---- warp (edge-pinned, bell falloff, ripple push) ---- */
    function warped(gx, gy, col, row, cols, rows) {
      var edge = 1.5;
      var colPin = Math.min(col / edge, (cols - 1 - col) / edge, 1);
      var rowPin = Math.min(row / edge, (rows - 1 - row) / edge, 1);
      var pin = colPin * colPin * rowPin * rowPin;

      var dx = gx - mouse.x, dy = gy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin * presence;

      var rx = 0, ry = 0;
      for (var i = 0; i < ripples.length; i++) {
        var r = ripples[i];
        var rdx = gx - r.x, rdy = gy - r.y;
        var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        var diff = rdist - r.radius;
        if (Math.abs(diff) < 55) {
          var strength = (1 - Math.abs(diff) / 55) * r.opacity * 18 * pin;
          var a = Math.atan2(rdy, rdx), sign = diff < 0 ? -1 : 1;
          rx -= Math.cos(a) * strength * sign;
          ry -= Math.sin(a) * strength * sign;
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0 && presence > 0) {
        var t = dist / INFLUENCE_RADIUS;
        var eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        var amt = eased * MAX_WARP * pin * presence;
        var ang = Math.atan2(dy, dx);
        return { x: gx - Math.cos(ang) * amt + rx, y: gy - Math.sin(ang) * amt + ry, p: proximity };
      }
      return { x: gx + rx, y: gy + ry, p: proximity };
    }

    /* ---- draw ---- */
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (dots) ctx.drawImage(dots, 0, 0, W, H);

      for (var i = ripples.length - 1; i >= 0; i--) {
        var age = (now - ripples[i].born) / 1000;
        ripples[i].radius = Math.max(0, age * 400);
        ripples[i].opacity = Math.max(0, 1 - age * 1.2);
        if (ripples[i].opacity <= 0) ripples.splice(i, 1);
      }

      var cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1;
      var rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1;
      var cw = W / (cols - 1), ch = H / (rows - 1);
      var pts = [], row, col;
      for (row = 0; row < rows; row++) {
        pts[row] = [];
        for (col = 0; col < cols; col++) pts[row][col] = warped(col * cw, row * ch, col, row, cols, rows);
      }

      // resting segments share one stroke; lit ones are drawn individually on top
      var lit = [];
      ctx.lineCap = 'butt';
      ctx.beginPath();
      function seg(a, b) {
        var t = smooth((a.p + b.p) / 2);
        if (t > 0) { lit.push([a, b, t]); return; }
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      }
      for (row = 0; row < rows; row++) for (col = 0; col < cols - 1; col++) seg(pts[row][col], pts[row][col + 1]);
      for (col = 0; col < cols; col++) for (row = 0; row < rows - 1; row++) seg(pts[row][col], pts[row + 1][col]);
      ctx.strokeStyle = mix(LINE_BASE, LINE_ACTIVE, 0);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (i = 0; i < lit.length; i++) {
        var L = lit[i];
        ctx.beginPath();
        ctx.moveTo(L[0].x, L[0].y); ctx.lineTo(L[1].x, L[1].y);
        ctx.strokeStyle = mix(LINE_BASE, LINE_ACTIVE, L[2]);
        ctx.lineWidth = lerp(0.8, 1.5, L[2]);
        ctx.stroke();
      }

      // intersection nodes — resting ones in one fill, glowing ones individually
      var hot = [];
      ctx.beginPath();
      for (row = 0; row < rows; row++) for (col = 0; col < cols; col++) {
        var p = pts[row][col];
        if (p.p > 0) { hot.push(p); continue; }
        ctx.moveTo(p.x + NODE_BASE_RADIUS, p.y);
        ctx.arc(p.x, p.y, NODE_BASE_RADIUS, 0, Math.PI * 2);
      }
      ctx.fillStyle = mix(NODE_BASE, NODE_ACTIVE, 0);
      ctx.fill();
      for (i = 0; i < hot.length; i++) {
        var q = hot[i], t = smooth(q.p);
        var rad = lerp(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
        if (t > 0.3) {
          var glowR = rad + lerp(0, 6, (t - 0.3) / 0.7);
          var grd = ctx.createRadialGradient(q.x, q.y, rad * 0.5, q.x, q.y, glowR);
          grd.addColorStop(0, 'rgba(' + GLOW + ',' + (t * 0.3).toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(' + GLOW + ',0)');
          ctx.beginPath(); ctx.arc(q.x, q.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = mix(NODE_BASE, NODE_ACTIVE, t);
        ctx.fill();
      }

      for (i = 0; i < ripples.length; i++) {
        ctx.beginPath();
        ctx.arc(ripples[i].x, ripples[i].y, Math.max(0, ripples[i].radius), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + RIPPLE + ',' + (ripples[i].opacity * 0.28).toFixed(3) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    /* ---- loop: only runs while the pointer eases, presence fades or ripples play ---- */
    function toCanvas(pt) {
      var rect = canvas.getBoundingClientRect();
      return { x: pt.x - rect.left, y: pt.y - rect.top };
    }
    function frame(now) {
      raf = 0;
      if (!visible || document.hidden || !W || !H) return;
      if (client) target = toCanvas(client);   // the hero scrolls under a still cursor
      var easing = Math.abs(mouse.x - target.x) > 0.1 || Math.abs(mouse.y - target.y) > 0.1;
      mouse.x = lerp(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerp(mouse.y, target.y, LERP_SPEED);
      var goal = inside ? 1 : 0;
      var fading = Math.abs(presence - goal) > 0.002;
      presence = fading ? lerp(presence, goal, LERP_SPEED) : goal;
      var live = (easing && presence > 0) || fading || ripples.length > 0;
      if (live || dirty) { draw(now); dirty = false; }
      if (live) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    /* ---- sizing (crisp on high-DPI screens; dot texture pre-rendered once) ---- */
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = w; H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      dots = document.createElement('canvas');
      dots.width = canvas.width; dots.height = canvas.height;
      var d = dots.getContext('2d');
      d.setTransform(dpr, 0, 0, dpr, 0, 0);
      d.fillStyle = 'rgba(255,255,255,0.05)';
      d.beginPath();
      for (var x = DOT_SPACING / 2; x < w; x += DOT_SPACING)
        for (var y = DOT_SPACING / 2; y < h; y += DOT_SPACING) {
          d.moveTo(x + 0.7, y); d.arc(x, y, 0.7, 0, Math.PI * 2);
        }
      d.fill();
      dirty = true; kick();
    }

    /* ---- input ---- */
    function onMove(e) {
      if (e.pointerType === 'touch') return;
      client = { x: e.clientX, y: e.clientY };
      if (!inside) {                      // enter where the pointer is — no sweep from far away
        inside = true;
        if (presence < 0.01) { target = toCanvas(client); mouse.x = target.x; mouse.y = target.y; }
      }
      kick();
    }
    function onLeave() { inside = false; kick(); }
    function onClick(e) {
      var at = toCanvas({ x: e.clientX, y: e.clientY });
      ripples.push({ x: at.x, y: at.y, radius: 0, opacity: 1, born: performance.now() });
      kick();
    }
    function onScroll() { if (inside) kick(); }
    function onVisibility() { if (!document.hidden) { dirty = true; kick(); } }

    if (!reduced) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('click', onClick);
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);

    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { dirty = true; kick(); }
    }) : null;
    if (io) io.observe(host);
    resize();

    current = function () {
      if (raf) cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      if (io) io.disconnect();
    };
  }

  window.KineticGrid = { mount: mount };
})();
