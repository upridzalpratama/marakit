/* Marakit landing page: fade-in halus saat scroll. Mati otomatis kalau pengunjung memilih "kurangi gerakan". */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var REVEAL = [".section__head", ".card", ".step", ".prompt-compare__punch", ".price-note", ".faq", ".about__photo", ".about__copy", ".closing-cta"].join(",");

  var targets = Array.prototype.slice.call(document.querySelectorAll("main " + REVEAL.split(",").join(", main ")));
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  targets.forEach(function (el) {
    // Jeda kecil untuk elemen yang bersebelahan dalam satu grid.
    var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(REVEAL); }) : [];
    el.style.setProperty("--d", Math.min(Math.max(0, siblings.indexOf(el)), 5) * 0.07 + "s");
    el.setAttribute("data-reveal", "");
  });

  var pending = targets.slice();
  function done(el) {
    var i = pending.indexOf(el);
    if (i === -1) return;
    pending.splice(i, 1);
    io.unobserve(el);
    el.classList.add("is-in");
    // Setelah muncul, lepas atribut supaya efek hover kartu bisa jalan.
    window.setTimeout(function () { el.removeAttribute("data-reveal"); el.style.removeProperty("--d"); }, 1200);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) done(e.target); });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  targets.forEach(function (el) { io.observe(el); });

  // Cadangan: elemen yang terlewat karena lompatan scroll (klik link menu) tetap dimunculkan.
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking || !pending.length) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      pending.slice().forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) done(el); });
    });
  }, { passive: true });
})();
