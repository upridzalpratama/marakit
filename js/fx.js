/* Marakit landing page: visual effects (reveal, counters, marquee, spotlight, tilt, particles). */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var root = document.documentElement;

  /* ---------- Reveal on scroll ---------- */
  var REVEAL = [
    ".section__head", ".proofbar .stat", ".logos", ".card:not(.system-card)", ".step",
    ".compare__col", ".compare__arrow", ".pillars__note", ".split", ".quote", ".inline-cta",
    ".models", ".faq details", ".about__photo", ".about__copy", ".closing__copy", ".guarantee"
  ].join(",");

  var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL));
  targets.forEach(function (el) {
    // Stagger elemen yang bersebelahan dalam satu grid.
    var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(REVEAL); }) : [];
    var i = Math.max(0, siblings.indexOf(el));
    el.style.setProperty("--d", Math.min(i, 6) * 0.09 + "s");
    el.setAttribute("data-reveal", "");
  });

  function reveal(el) {
    el.classList.add("is-in");
    // Setelah muncul, lepas atribut reveal supaya efek hover (transform) bisa jalan.
    window.setTimeout(function () { el.removeAttribute("data-reveal"); el.style.removeProperty("--d"); }, 1600);
    if (el.matches(".proofbar .stat")) countUp(el.querySelector(".stat__num"));
  }

  var pending = targets.slice();
  var io = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { done(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(reveal);
    pending = [];
  }
  function done(el) {
    var i = pending.indexOf(el);
    if (i === -1) return;
    pending.splice(i, 1);
    if (io) io.unobserve(el);
    reveal(el);
  }
  // Cadangan: elemen yang terlewat karena lompatan scroll (link anchor, scroll cepat) tetap dimunculkan.
  function sweep() {
    if (!pending.length) return;
    var limit = window.innerHeight;
    pending.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < limit) done(el);
    });
  }

  /* ---------- Count up ---------- */
  function countUp(el) {
    if (!el || reduceMotion) return;
    var text = el.textContent.trim();
    var m = text.match(/^([\d.,]+)(.*)$/);
    if (!m) return;
    var raw = m[1];
    var sep = /[.,]\d{3}/.test(raw) ? raw.replace(/\d/g, "").charAt(0) : "";
    var target = parseInt(raw.replace(/[.,]/g, ""), 10);
    var suffix = m[2];
    var start = performance.now();
    var dur = 1600;
    function fmt(n) {
      var s = String(n);
      return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s;
    }
    function frame(t) {
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Logo marquee ---------- */
  var list = document.querySelector(".logos__list");
  if (list && !reduceMotion) {
    var viewport = document.createElement("div");
    viewport.className = "logos__viewport";
    list.parentNode.insertBefore(viewport, list);
    viewport.appendChild(list);
    var items = Array.prototype.slice.call(list.children);
    // Gandakan isi sampai cukup lebar, lalu gandakan sekali lagi untuk loop mulus.
    var copies = Math.max(1, Math.ceil(6 / items.length));
    for (var c = 1; c < copies * 2; c++) {
      items.forEach(function (li) {
        var clone = li.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        list.appendChild(clone);
      });
    }
    list.classList.add("is-marquee");
  }

  /* ---------- Card spotlight ---------- */
  if (finePointer) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".card");
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });
  }

  /* ---------- Hero card: scan line + 3D tilt ---------- */
  var sys = document.querySelector(".system-card");
  if (sys) {
    var scan = document.createElement("div");
    scan.className = "scan";
    sys.appendChild(scan);
    var visual = sys.closest(".hero__visual");
    if (finePointer && !reduceMotion && visual) {
      visual.addEventListener("pointermove", function (e) {
        var r = visual.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        sys.style.transform = "rotateY(" + (x * 14).toFixed(2) + "deg) rotateX(" + (-y * 14).toFixed(2) + "deg) translateZ(0)";
      });
      visual.addEventListener("pointerleave", function () { sys.style.transform = ""; });
    }
  }

  /* ---------- Cursor glow ---------- */
  var glow = document.querySelector(".cursor-glow");
  if (glow && finePointer && !reduceMotion) {
    var gx = 0, gy = 0, tx = 0, ty = 0, glowRaf = 0;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      root.classList.add("has-pointer");
      if (!glowRaf) glowRaf = requestAnimationFrame(moveGlow);
    }, { passive: true });
    function moveGlow() {
      gx += (tx - gx) * 0.18; gy += (ty - gy) * 0.18;
      glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
      glowRaf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(moveGlow) : 0;
    }
  }

  /* ---------- Scroll progress on navbar ---------- */
  var nav = document.querySelector(".nav");
  var ticking = false;
  function updateProgress() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    if (nav) nav.style.setProperty("--progress", (max > 0 ? (window.scrollY / max) * 100 : 0) + "%");
    sweep();
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------- Particles ---------- */
  var canvas = document.getElementById("fx-particles");
  if (!canvas || reduceMotion || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, pts = [], mouse = { x: -9999, y: -9999 }, running = true, raf = 0;
  var COLORS = ["255,181,71", "62,240,255", "255,107,44"];
  var LINK = 130;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(W < 768 ? 32 : 80, (W * H) / 16000));
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        c: COLORS[i % COLORS.length]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

      // Partikel ditarik halus ke arah kursor.
      var mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 180) { p.x += mdx * 0.004; p.y += mdy * 0.004; }

      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = "rgba(" + p.c + "," + (0.18 * (1 - d / LINK)).toFixed(3) + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      if (md < 180) {
        ctx.strokeStyle = "rgba(" + p.c + "," + (0.35 * (1 - md / 180)).toFixed(3) + ")";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      // Halo tipis sebagai pengganti shadowBlur, yang jauh lebih berat.
      ctx.fillStyle = "rgba(" + p.c + ",0.15)";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(" + p.c + ",0.95)";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (running) raf = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", function () { resize(); }, { passive: true });
  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
  });
  resize();
  raf = requestAnimationFrame(draw);
})();
