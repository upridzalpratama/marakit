# Marakit

Landing page untuk satu produk: **AI Marketing Worksheet untuk UMKM**, satu versi seharga Rp59.000 yang berisi semua tab. Tujuan utama: pengunjung membeli lewat Lynk.id. Tujuan sekunder: pengunjung masuk daftar tunggu produk berikutnya lewat WhatsApp.

Plain HTML, CSS, dan JS tanpa build step. Bisa di-deploy ke Vercel, Netlify, Cloudflare Pages, atau hosting statis mana pun.

```
index.html          landing page produk (15 section, urutan sesuai brief)
css/styles.css      design token dan komponen
js/main.js          CONFIG, link Lynk.id + UTM, demo modal, daftar tunggu, menu mobile, sticky bar, tracking
js/fx.js            fade-in halus saat scroll (mati kalau "kurangi gerakan" aktif)
assets/             logo (brand/), favicon, OG image, gambar produk
archive/            landing page layanan agensi yang lama (lihat archive/README.md)
en/index.html       redirect ke halaman utama (halaman Inggris lama ada di arsip)
tools/              template dan script render OG image
```

Preview lokal: `npx serve .` lalu buka http://localhost:3000.

## Wajib diisi sebelum launch

Semua di `js/main.js`, objek `CONFIG`:

| Kunci | Isi | Kalau masih kosong |
|---|---|---|
| `lynkUrl` | URL produk di Lynk.id | Tombol beli membuka WhatsApp dengan pesan "mau beli AI Marketing Worksheet" |
| `demoUrl` | Video demo 60 detik (YouTube, Google Drive, .mp4, atau gambar) | Modal demo menampilkan placeholder "VIDEO DEMO 60 DETIK" |
| `social.instagram`, `social.tiktok` | Akun Marakit (footer) | Link disembunyikan |
| `social.creatorInstagram`, `social.creatorTiktok` | Akun Ridzal (Tentang Pembuat) | Link disembunyikan |
| `ga4Id`, `metaPixelId`, `clarityId` | ID tracking | Script tidak dimuat |

Gambar, cukup taruh file di path ini (placeholder otomatis hilang):
- `assets/worksheet-preview.png`: screenshot worksheet, rasio 16:10, tampil di frame laptop di hero.
- `assets/ridzal.jpg`: foto pembuat, potret 4:5.

Konten yang ditandai `GANTI` di `index.html`:
- FAQ "Bisa refund?" masih disembunyikan (`hidden`) sampai kebijakan refund ditulis. Tambahkan juga ke FAQPage JSON-LD di `<head>`.
- FAQ "Apakah ada update?": pastikan jawabannya benar.
- Deskripsi singkat tiap tab di section Isi Produk.
- Harga Rp59.000 tertulis di tombol, kartu harga, sticky bar, schema Product, dan `PRICE` di `js/main.js`. Kalau harga berubah, ganti semuanya (cari `59.000` dan `59000`), lalu render ulang OG image.

## Testimoni
Komponennya sudah ada tapi disembunyikan. Untuk menampilkan, isi `CONFIG.testimonials` dengan testimoni asli (`{ quote, name, business }`) lalu set `showTestimonials: true`. Section hanya muncul kalau keduanya terpenuhi. Jangan isi dengan contoh atau nama karangan.

## Tracking

| Event | Kapan | Parameter |
|---|---|---|
| `click_buy` | Semua tombol beli (navbar, hero, harga, penutup, sticky bar) | `product`, `value` (59000), `currency`, `location`, `via` (lynk/whatsapp) |
| `click_demo` | Tombol "Lihat demo 60 detik" | `product`, `has_video` |
| `click_waitlist` | "Kabari saya" di section Segera Hadir | `product` |
| `scroll_75` | Scroll 75 persen halaman | |

Di Meta Pixel, klik beli juga dikirim sebagai `InitiateCheckout` dan daftar tunggu sebagai `Lead`.

UTM dari URL halaman (misalnya `?utm_source=tiktok`) disimpan per sesi, dikirim di setiap event, ditempel ke link Lynk.id, dan disisipkan ke pesan WhatsApp. Jadi asal pembeli tetap terlihat.

## Aturan desain dan copy
- Palette: Plum `#3A1F3D`, Plum Soft `#5A3360`, Putih `#FBFAF8`, Mint `#7FD8BE` (hanya di atas plum), Mint Deep `#1F7A63` (di latar terang), Mint Wash `#E3F6F0`, Lilac `#F1ECF3`, border `#ECE7EC`.
- Font: Plus Jakarta Sans (judul, angka), Inter (isi). Kartu radius 14px, border tipis, tanpa shadow tebal.
- Tanpa gradien, glow, partikel, atau ilustrasi robot dan otak. Animasi hanya fade-in saat scroll.
- Mobile first. Sticky bar "Beli Rp59.000" muncul di mobile setelah melewati hero.
- Bahasa Indonesia, panggil pembaca "kamu", tanpa em dash, harga ditulis lengkap (Rp59.000).
- Jangan membuat klaim hasil produk. Angka 7x ROAS dan 700 ribu views hanya di section Tentang Pembuat, sebagai pengalaman pembuatnya.

## OG image
`assets/og-worksheet.png` dibuat dari `tools/og-worksheet.html`. Edit templatenya lalu jalankan `node tools/render-og.mjs` (butuh Playwright).
