/* COSMOS · campo de estrellas, barra superior y contadores */
(function () {
  'use strict';
  var B = document.body;
  B.classList.add('cosmos');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Campo de estrellas ---------- */
  var cv = document.createElement('canvas');
  cv.id = 'cosmosSky';
  cv.setAttribute('aria-hidden', 'true');
  B.insertBefore(cv, B.firstChild);
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [], shooters = [], scrollY = 0;
  var TINTS = ['255,255,255', '200,215,255', '255,230,200', '190,170,255', '170,235,255'];

  function resize() {
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(220, (W * H) / 7500));
    stars = [];
    for (var i = 0; i < n; i++) {
      var depth = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: .35 + depth * 1.25, d: .15 + depth * .85,
        a: .25 + Math.random() * .6, t: Math.random() * 6.28,
        s: .4 + Math.random() * 1.6, c: TINTS[(Math.random() * TINTS.length) | 0]
      });
    }
  }
  function frame(now) {
    ctx.clearRect(0, 0, W, H);
    var t = now / 1000;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = (s.y - scrollY * .06 * s.d) % H; if (y < 0) y += H;
      var tw = reduce ? 1 : .55 + .45 * Math.sin(t * s.s + s.t);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = 'rgb(' + s.c + ')';
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.283); ctx.fill();
      if (s.r > 1.1) {
        ctx.globalAlpha = s.a * tw * .25;
        ctx.beginPath(); ctx.arc(s.x, y, s.r * 3.2, 0, 6.283); ctx.fill();
      }
    }
    if (!reduce) {
      if (Math.random() < .004 && shooters.length < 2) {
        shooters.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .45, l: 0, v: 9 + Math.random() * 6 });
      }
      for (var k = shooters.length - 1; k >= 0; k--) {
        var m = shooters[k];
        m.x -= m.v; m.y += m.v * .55; m.l += 1;
        var g = ctx.createLinearGradient(m.x, m.y, m.x + 110, m.y - 60);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(143,125,255,0)');
        ctx.globalAlpha = Math.max(0, 1 - m.l / 55);
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 110, m.y - 60); ctx.stroke();
        if (m.l > 55 || m.x < -150 || m.y > H + 50) shooters.splice(k, 1);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('scroll', function () { scrollY = window.pageYOffset; }, { passive: true });
  requestAnimationFrame(frame);

  /* ---------- Barra superior ---------- */
  var nav = document.querySelector('.topnav');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.topnav .nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.pageYOffset > 24); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Contadores animados ---------- */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length) {
    var run = function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reduce) { el.textContent = end; return; }
      var t0 = performance.now(), dur = 1500;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
      }, { threshold: .5 });
      counters.forEach(function (c) { io.observe(c); });
    } else { counters.forEach(run); }
  }
})();
