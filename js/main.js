/* Marakit landing page: booking, WhatsApp, and tracking. */
(function () {
  "use strict";

  // Isi semua nilai ini sebelum launch. Nilai kosong berarti script tersebut tidak dimuat.
  var CONFIG = {
    calLink: "marakit/konsultasi-30-menit", // username/event-type di Cal.com
    whatsappNumber: "6281200000000", // format internasional tanpa +
    ga4Id: "", // contoh: G-XXXXXXXXXX
    metaPixelId: "", // contoh: 123456789012345
    clarityId: "" // contoh: abcdefghij
  };

  /* ---------- UTM ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var utm = {};
  (function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("mk_utm") || "{}"); } catch (e) { stored = {}; }
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k) || stored[k];
      if (v) utm[k] = v;
    });
    try { sessionStorage.setItem("mk_utm", JSON.stringify(utm)); } catch (e) { /* storage tidak tersedia */ }
  })();

  function utmSummary() {
    return UTM_KEYS.filter(function (k) { return utm[k]; })
      .map(function (k) { return k.replace("utm_", "") + "=" + utm[k]; })
      .join(", ");
  }

  /* ---------- Analytics loaders ---------- */
  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  if (CONFIG.ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.ga4Id);
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.ga4Id));
  }

  if (CONFIG.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
  }

  if (CONFIG.clarityId) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadScript("https://www.clarity.ms/tag/" + encodeURIComponent(CONFIG.clarityId));
  }

  // Event khusus: cta_click, booking_started, booking_completed, whatsapp_click, scroll_75
  var META_STANDARD = { booking_completed: "Schedule", booking_started: "Lead", whatsapp_click: "Contact" };

  function track(name, params) {
    params = Object.assign({}, utm, params || {});
    if (window.gtag) window.gtag("event", name, params);
    if (window.fbq) {
      window.fbq("trackCustom", name, params);
      if (META_STANDARD[name]) window.fbq("track", META_STANDARD[name]);
    }
    if (window.clarity) window.clarity("event", name);
    if (window.location.hostname === "localhost") console.info("[track]", name, params);
  }

  /* ---------- CTA clicks ---------- */
  document.querySelectorAll("a[data-cta]").forEach(function (el) {
    el.addEventListener("click", function () {
      track("cta_click", { location: el.getAttribute("data-cta") });
    });
  });

  /* ---------- WhatsApp ---------- */
  function waUrl(extra) {
    var text = "Halo Marakit, saya mau konsultasi soal sistem marketing brand saya.";
    if (extra) text += "\n\n" + extra;
    var src = utmSummary();
    if (src) text += "\n\n(" + src + ")";
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waUrl());
    el.addEventListener("click", function () {
      var form = document.getElementById("booking-form");
      var data = form ? formSummary(form) : "";
      if (data) el.setAttribute("href", waUrl(data));
      track("whatsapp_click", { location: el.getAttribute("data-wa") });
    });
  });

  /* ---------- Cal.com ---------- */
  var calReady = false;
  function loadCal() {
    if (calReady) return;
    calReady = true;
    /* Snippet resmi Cal.com embed */
    /* eslint-disable */
    (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
    /* eslint-enable */
    window.Cal("init", { origin: "https://cal.com" });
    window.Cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    var done = false;
    function onBooked() {
      if (done) return;
      done = true;
      track("booking_completed", { method: "cal" });
    }
    window.Cal("on", { action: "bookingSuccessful", callback: onBooked });
    window.Cal("on", { action: "bookingSuccessfulV2", callback: onBooked });
  }

  // Muat embed lebih awal saat pengunjung mendekati form, supaya modal terbuka cepat.
  var bookingSection = document.getElementById("booking");
  if (bookingSection && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { loadCal(); io.disconnect(); }
    }, { rootMargin: "400px" });
    io.observe(bookingSection);
  }

  /* ---------- Form ---------- */
  function formSummary(form) {
    var f = form.elements;
    var parts = [];
    if (f.name.value.trim()) parts.push("Nama: " + f.name.value.trim());
    if (f.brand.value.trim()) parts.push("Brand: " + f.brand.value.trim());
    if (f.whatsapp.value.trim()) parts.push("WhatsApp: " + f.whatsapp.value.trim());
    if (f.omzet.value) parts.push("Omzet: " + f.omzet.value);
    return parts.join("\n");
  }

  var form = document.getElementById("booking-form");
  if (form) {
    var errorEl = document.getElementById("form-error");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll("input, select"));
      var invalid = fields.filter(function (el) {
        var bad = !el.checkValidity();
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        return bad;
      });
      if (invalid.length) {
        errorEl.hidden = false;
        invalid[0].focus();
        return;
      }
      errorEl.hidden = true;

      var f = form.elements;
      var notes = formSummary(form);
      var src = utmSummary();
      if (src) notes += "\nSumber: " + src;

      track("cta_click", { location: "penutup" });
      track("booking_started", { omzet: f.omzet.value });

      var config = { name: f.name.value.trim(), notes: notes, layout: "month_view" };
      loadCal();
      try {
        window.Cal("modal", { calLink: CONFIG.calLink, config: config });
      } catch (e) {
        var q = new URLSearchParams({ name: config.name, notes: notes });
        window.open("https://cal.com/" + CONFIG.calLink + "?" + q.toString(), "_blank", "noopener");
      }
    });

    form.addEventListener("input", function (ev) {
      if (ev.target.getAttribute("aria-invalid") === "true" && ev.target.checkValidity()) {
        ev.target.setAttribute("aria-invalid", "false");
      }
    });
  }

  /* ---------- Scroll 75% ---------- */
  var scrolled75 = false;
  function onScroll() {
    if (scrolled75) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY / max >= 0.75) {
      scrolled75 = true;
      track("scroll_75");
      window.removeEventListener("scroll", onScroll);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
})();
