/* Marakit landing page: animasi halus (reveal saat scroll, hitung angka, logo berjalan, garis progres). */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

})();
