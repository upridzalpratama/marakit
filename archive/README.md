# Arsip

Konten yang tidak lagi tampil di halaman utama, disimpan supaya bisa dipakai lagi.

## agency/
Landing page layanan agensi Marakit (versi sebelum website fokus ke AI Marketing Worksheet), lengkap dalam Bahasa Indonesia dan Inggris:

- `agency/index.html` dan `agency/en/index.html`: halaman penuh dengan section Masalah, Solusi (Content System dan Ads Management System), Cara Kerja agensi, Deliverable, Bukti (studi kasus Ghovigha dan logo klien), Paket (Build and run, Build only), Tentang, FAQ, dan CTA booking konsultasi.
- `agency/css/styles.css`, `agency/js/main.js`, `agency/js/fx.js`: salinan style dan script saat diarsipkan, jadi halaman arsip tetap tampil persis seperti dulu walaupun halaman utama berubah.
- Gambar (logo, logo klien, favicon, OG image lama) tetap di `/assets` dan dipakai bersama.

Halaman arsip bisa dibuka di `/archive/agency/` tapi diberi `noindex` dan diblokir di `robots.txt`, jadi tidak muncul di Google.

Untuk memakai lagi sebuah section: salin blok `<section>` dari arsip ke `index.html`, lalu salin style yang dibutuhkan dari `agency/css/styles.css`.
