# Marakit landing page

Landing page satu halaman sesuai PRD. Static HTML, CSS, dan JS tanpa build step, jadi bisa di-deploy ke Vercel, Netlify, Cloudflare Pages, atau hosting statis mana pun.

```
index.html         halaman (13 section sesuai urutan PRD)
css/styles.css     design token, tipografi, komponen
js/main.js         Cal.com, WhatsApp, GA4, Meta Pixel, Clarity, event tracking
assets/            favicon.svg, og-image.png (1200x630)
tools/             template dan script untuk render ulang OG image
```

Preview lokal: `npx serve .` lalu buka http://localhost:3000.

## Wajib diisi sebelum launch

1. **`js/main.js` → `CONFIG`**: `calLink`, `whatsappNumber`, `ga4Id`, `metaPixelId`, `clarityId`. ID yang kosong tidak dimuat.
2. **Konten contoh yang harus diganti dengan data nyata** (ditandai komentar `GANTI` di `index.html`):
   - Social proof bar: 40+ brand, 2.000+ aset, 5 hari.
   - Section Bukti: 3 studi kasus dan testimoni. PRD melarang launch dengan placeholder. Kalau belum ada, ganti dengan screenshot hasil kerja nyata (WebP, `loading="lazy"`) dan testimoni teks.
   - Section Paket: harga "mulai dari" (Rp4,5 jt, Rp18 jt, Rp30 jt) dan durasi.
   - Section Cara Kerja: estimasi minggu per langkah.
   - Section Tentang: foto (ganti isi `.about__photo` dengan `<img>`) dan cerita.
   - CTA penutup: garansi audit. Pastikan ini komitmen bisnis yang memang mau dipegang.
   - Footer dan schema: email `halo@marakit.com`, kota, handle sosial.
   - Kalau harga/FAQ diubah, samakan juga JSON-LD FAQPage di `<head>`.
3. **Domain**: marakit.com sebagai utama, redirect marakit.id, merakit.com, dan www ke sana (atur di DNS/hosting).
4. **Meta Conversions API**: perlu server atau integrasi partner (mis. lewat Cal.com webhook). Tidak bisa dari halaman statis.

## Tracking

| Event | Kapan |
|---|---|
| `cta_click` | Klik tombol booking mana pun (`location`: navbar, hero, after_bukti, paket_*, penutup) |
| `booking_started` | Form 4 field valid dan modal Cal.com dibuka |
| `booking_completed` | Cal.com mengirim event booking sukses |
| `whatsapp_click` | Klik tombol WhatsApp |
| `scroll_75` | Pengunjung scroll 75 persen halaman |

Parameter UTM disimpan per sesi, ikut dikirim di setiap event, dan disisipkan ke catatan booking Cal.com serta pesan WhatsApp. Jadi asal booking (TikTok atau Instagram) tetap terlihat.

## Aturan PRD yang sudah diterapkan

- Urutan 13 section, pola terang/gelap, CTA muncul di navbar, hero, setelah Bukti, Paket, dan penutup.
- Palet 9 warna, CTA Ink Navy teks putih, tanpa gradien dan glow.
- Fraunces untuk headline, Inter 400/600 untuk body, JetBrains Mono untuk angka.
- Kata "AI" muncul 2 kali, tidak di hero. Tanpa em dash dan tanpa kata terlarang.
- Satu H1, meta title di bawah 60 karakter, schema LocalBusiness (ProfessionalService) dan FAQPage, OG image.
- Tanpa gambar berat di hero, Cal.com dimuat saat pengunjung mendekati form, supaya LCP tetap rendah.

OG image: edit `tools/og-image.html`, lalu jalankan `node tools/render-og.mjs` (butuh Playwright).
