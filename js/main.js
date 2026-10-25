/* Marakit landing page AI Marketing Worksheet: link beli (Lynk.id), demo, daftar tunggu WhatsApp, dan tracking. */
(function () {
  "use strict";

  // Isi semua nilai ini sebelum launch. Nilai kosong aman: lihat catatan di tiap baris.
  var CONFIG = {
    whatsappNumber: "6281220694447", // format internasional tanpa +
    lynk: {
      basic: "", // GANTI: URL Lynk.id versi Basic. Selama kosong, tombol beli membuka WhatsApp.
      pro: ""    // GANTI: URL Lynk.id versi Pro. Selama kosong, tombol beli membuka WhatsApp.
    },
    demoUrl: "", // GANTI: link video demo (YouTube, Google Drive, atau file .mp4). Selama kosong, modal menampilkan placeholder.
    social: {
      instagram: "",        // GANTI: Instagram Marakit (footer). Link disembunyikan selama kosong.
      tiktok: "",           // GANTI: TikTok Marakit (footer).
      creatorInstagram: "", // GANTI: Instagram Ridzal (section Tentang Pembuat).
      creatorTiktok: ""     // GANTI: TikTok Ridzal.
    },
    // Testimoni: tampil hanya kalau showTestimonials true DAN ada isinya. Hanya testimoni asli.
    // Contoh format: { quote: "...", name: "...", business: "..." }
    showTestimonials: false,
    testimonials: [],
    ga4Id: "",       // contoh: G-XXXXXXXXXX
    metaPixelId: "", // contoh: 123456789012345
    clarityId: ""    // contoh: abcdefghij
  };

  var PRODUCT_NAME = "AI Marketing Worksheet untuk UMKM";
  var PRICES = { basic: 49000, pro: 99000 };

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

  // Tambahkan UTM dari URL halaman ke link keluar (Lynk.id), supaya sumber pembeli terlihat.
  function withUtm(url) {
    try {
      var u = new URL(url);
      UTM_KEYS.forEach(function (k) { if (utm[k] && !u.searchParams.has(k)) u.searchParams.set(k, utm[k]); });
      return u.toString();
    } catch (e) { return url; }
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

  // Event khusus: click_buy_basic, click_buy_pro, click_demo, click_waitlist, scroll_75.
  function track(name, params) {
    params = Object.assign({}, utm, params || {});
    if (window.gtag) window.gtag("event", name, params);
    if (window.fbq) {
      window.fbq("trackCustom", name, params);
      if (name === "click_buy_basic" || name === "click_buy_pro") {
        window.fbq("track", "InitiateCheckout", { content_name: params.product, value: params.value, currency: "IDR" });
      }
      if (name === "click_waitlist") window.fbq("track", "Lead", { content_name: params.product });
    }
    if (window.clarity) window.clarity("event", name);
    if (window.location.hostname === "localhost") console.info("[track]", name, params);
  }

  /* ---------- WhatsApp ---------- */
  function waUrl(text) {
    var src = utmSummary();
    if (src) text += "\n\n(" + src + ")";
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  document.querySelectorAll("a[data-wa]").forEach(function (el) {
    el.setAttribute("href", waUrl("Halo Marakit, saya mau tanya soal " + PRODUCT_NAME + "."));
  });

  /* ---------- Tombol beli (Lynk.id) ---------- */
  document.querySelectorAll("a[data-buy]").forEach(function (el) {
    var tier = el.getAttribute("data-buy");
    var url = CONFIG.lynk[tier];
    el.setAttribute("href", url
      ? withUtm(url)
      : waUrl("Halo Marakit, saya mau beli " + PRODUCT_NAME + " versi " + (tier === "pro" ? "Pro" : "Basic") + "."));
    el.addEventListener("click", function () {
      track(tier === "pro" ? "click_buy_pro" : "click_buy_basic", {
        product: PRODUCT_NAME + " " + (tier === "pro" ? "Pro" : "Basic"),
        value: PRICES[tier],
        currency: "IDR",
        location: el.getAttribute("data-loc"),
        via: url ? "lynk" : "whatsapp"
      });
    });
  });

  /* ---------- Daftar tunggu produk berikutnya ---------- */
  document.querySelectorAll("a[data-waitlist]").forEach(function (el) {
    var product = el.getAttribute("data-waitlist");
    el.setAttribute("href", waUrl("Halo Marakit, saya mau dikabari saat " + product + " rilis."));
    el.addEventListener("click", function () { track("click_waitlist", { product: product }); });
  });

  // Klik internal yang perlu dicatat (announcement bar, link Pro di CTA penutup).
  document.querySelectorAll("a[data-track]").forEach(function (el) {
    el.addEventListener("click", function () { track("cta_click", { location: el.getAttribute("data-track") }); });
  });

  /* ---------- Link sosial: disembunyikan selama URL kosong ---------- */
  document.querySelectorAll("a[data-social]").forEach(function (el) {
    var url = CONFIG.social[el.getAttribute("data-social")];
    if (url) { el.setAttribute("href", url); return; }
    var item = el.closest("li") || el;
    item.hidden = true;
  });
  document.querySelectorAll(".about__links").forEach(function (box) {
    if (!box.querySelector("a[data-social]:not([hidden])")) box.hidden = true;
  });

  /* ---------- Modal demo ---------- */
  var modal = document.getElementById("demo-modal");
  var demoBody = modal && modal.querySelector("[data-demo-body]");
  var placeholderHTML = demoBody ? demoBody.innerHTML : "";

  function demoEmbed(url) {
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return '<iframe src="https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&rel=0" title="Demo AI Marketing Worksheet" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    var gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (gd) return '<iframe src="https://drive.google.com/file/d/' + gd[1] + '/preview" title="Demo AI Marketing Worksheet" allow="autoplay" allowfullscreen></iframe>';
    if (/\.(mp4|webm)(\?|$)/i.test(url)) return '<video src="' + url + '" controls autoplay playsinline></video>';
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)) return '<img src="' + url + '" alt="Preview AI Marketing Worksheet">';
    return '<iframe src="' + url + '" title="Demo AI Marketing Worksheet" allowfullscreen></iframe>';
  }

  function openDemo() {
    if (!modal) return;
    if (CONFIG.demoUrl) demoBody.innerHTML = demoEmbed(CONFIG.demoUrl);
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    track("click_demo", { product: PRODUCT_NAME, has_video: !!CONFIG.demoUrl });
  }
  function closeDemo() {
    if (!modal) return;
    if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open");
  }
  document.querySelectorAll("[data-demo]").forEach(function (el) { el.addEventListener("click", openDemo); });
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeDemo); });
    // Klik di luar kotak modal menutupnya.
    modal.addEventListener("click", function (e) { if (e.target === modal) closeDemo(); });
    // Hentikan video saat modal ditutup.
    modal.addEventListener("close", function () { demoBody.innerHTML = placeholderHTML; });
  }

  /* ---------- Menu mobile (hamburger) ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    menu.classList.toggle("is-open", open);
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Sticky bar beli di mobile ---------- */
  var buybar = document.querySelector(".buybar");
  var hero = document.getElementById("hero");
  var footer = document.querySelector(".footer");
  if (buybar && hero && "IntersectionObserver" in window) {
    var heroVisible = true, footerVisible = false;
    var update = function () {
      var show = !heroVisible && !footerVisible;
      buybar.classList.toggle("is-visible", show);
      buybar.setAttribute("aria-hidden", show ? "false" : "true");
      buybar.querySelectorAll("a").forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; update(); }).observe(hero);
    if (footer) new IntersectionObserver(function (entries) { footerVisible = entries[0].isIntersecting; update(); }).observe(footer);
  }

  /* ---------- Testimoni (disembunyikan sampai ada yang asli) ---------- */
  var testiSection = document.getElementById("testimoni");
  var testiTpl = document.getElementById("testimonial-card");
  if (testiSection && testiTpl && CONFIG.showTestimonials && CONFIG.testimonials.length) {
    var list = testiSection.querySelector("[data-testimonials]");
    CONFIG.testimonials.forEach(function (t) {
      var node = testiTpl.content.cloneNode(true);
      node.querySelector(".testimonial__quote").textContent = t.quote;
      node.querySelector(".testimonial__name").textContent = t.name;
      node.querySelector(".testimonial__biz").textContent = t.business || "";
      list.appendChild(node);
    });
    testiSection.hidden = false;
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
