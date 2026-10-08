/* Marakit landing page: booking lewat WhatsApp, dan tracking. */
(function () {
  "use strict";

  // Isi semua nilai ini sebelum launch. Nilai kosong berarti script tersebut tidak dimuat.
  var CONFIG = {
    whatsappNumber: "6281220694447", // nomor booking, format internasional tanpa +
    ga4Id: "", // contoh: G-XXXXXXXXXX
    metaPixelId: "", // contoh: 123456789012345
    clarityId: "" // contoh: abcdefghij
  };

  /* ---------- Bahasa ---------- */
  var LANG = document.documentElement.lang === "en" ? "en" : "id";
  var T = {
    id: {
      wa: "Halo Marakit, saya mau konsultasi soal sistem marketing brand saya.",
      name: "Nama", brand: "Brand", whatsapp: "WhatsApp", omzet: "Omzet", source: "Sumber"
    },
    en: {
      wa: "Hi Marakit, I'd like a consultation about my brand's marketing system.",
      name: "Name", brand: "Brand", whatsapp: "WhatsApp", omzet: "Revenue", source: "Source"
    }
  }[LANG];

  // Link ganti bahasa membawa UTM, supaya sumber traffic tidak hilang saat pindah halaman.
  document.querySelectorAll("[data-lang-switch]").forEach(function (el) {
    if (window.location.search) el.setAttribute("href", el.getAttribute("href") + window.location.search);
    el.addEventListener("click", function () {
      track("language_switch", { to: el.getAttribute("data-lang-switch") });
    });
  });

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

  /* ---------- WhatsApp ---------- */
  function waUrl(extra) {
    var text = T.wa;
    if (extra) text += "\n\n" + extra;
    var src = utmSummary();
    if (src) text += "\n\n(" + src + ")";
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  // Semua tombol booking langsung membuka WhatsApp dengan pesan sudah terisi.
  document.querySelectorAll("a[data-cta]").forEach(function (el) {
    el.setAttribute("href", waUrl());
    el.addEventListener("click", function () {
      var loc = el.getAttribute("data-cta");
      track("cta_click", { location: loc });
      track("booking_started", { location: loc, method: "whatsapp" });
      track("whatsapp_click", { location: loc });
    });
  });

  document.querySelectorAll("a[data-wa]").forEach(function (el) {
    el.setAttribute("href", waUrl());
    el.addEventListener("click", function () {
      track("whatsapp_click", { location: el.getAttribute("data-wa") });
    });
  });

  /* ---------- Form ---------- */
  function formSummary(form) {
    var f = form.elements;
    var parts = [];
    if (f.name.value.trim()) parts.push(T.name + ": " + f.name.value.trim());
    if (f.brand.value.trim()) parts.push(T.brand + ": " + f.brand.value.trim());
    if (f.whatsapp.value.trim()) parts.push(T.whatsapp + ": " + f.whatsapp.value.trim());
    if (f.omzet.value) parts.push(T.omzet + ": " + f.omzet.value);
    return parts.join("\n");
  }

  // Form penutup: data kualifikasi ikut terkirim di pesan WhatsApp.
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

      track("cta_click", { location: "penutup" });
      track("booking_started", { location: "penutup", method: "whatsapp", omzet: form.elements.omzet.value });
      track("whatsapp_click", { location: "penutup" });

      var url = waUrl(formSummary(form));
      var win = window.open(url, "_blank");
      if (win) win.opener = null;
      else window.location.href = url; // popup diblokir

    });

    form.addEventListener("input", function (ev) {
      if (ev.target.getAttribute("aria-invalid") === "true" && ev.target.checkValidity()) {
        ev.target.setAttribute("aria-invalid", "false");
      }
    });
  }

  /* ---------- Paket: Build and run / Build only ---------- */
  document.querySelectorAll("[data-model]").forEach(function (section) {
    var buttons = section.querySelectorAll("[data-model-btn]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var model = btn.getAttribute("data-model-btn");
        section.setAttribute("data-model", model);
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        track("pricing_model", { model: model });
      });
    });
  });

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
