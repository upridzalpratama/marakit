# Marakit landing page

One-page landing site built from the PRD, in Bahasa Indonesia at `/` and English at `/en/`. It is plain HTML, CSS and JS with no build step, so it can be deployed to Vercel, Netlify, Cloudflare Pages or any static host.

```
index.html         Indonesian page (main, 13 sections in PRD order)
en/index.html      English page (separate page, per the PRD's /en guidance)
css/styles.css     design tokens, typography, components (shared)
js/main.js         WhatsApp booking, GA4, Meta Pixel, Clarity, pricing switch (shared)
js/fx.js           subtle motion: reveal on scroll, counters, logo marquee, scroll progress line
assets/            favicons, og-image.png, og-image-en.png, brand/ (logo), clients/ (client logos, WebP)
tools/             OG image templates and render script
```

Local preview: `npx serve .` then open http://localhost:3000 and http://localhost:3000/en/.

## Languages
- The ID/EN button in the navbar (and the link in the footer) moves between `/` and `/en/`. UTM parameters carry over.
- Both pages set `hreflang` alternates; `x-default` points to the Indonesian page.
- The PRD says the English page should be its own page, not a straight translation, because foreign clients need different proof, prices and cases. The English page currently mirrors the Indonesian content (prices in IDR). Tailor it before targeting foreign clients.
- Any copy change has to be made in both files, including the FAQPage JSON-LD in each `<head>`.

## Must do before launch

1. **`js/main.js` → `CONFIG`**: `ga4Id`, `metaPixelId`, `clarityId`. Empty IDs are not loaded. `whatsappNumber` is set to 6281220694447.
2. **Replace sample content with real data** (marked `GANTI` / `REPLACE` in the HTML):
   - Social proof bar: 2,000+ assets and 5 days. (10+ brands managed is real data.)
   - Proof section: the Ghovigha case (10,000+ TikTok followers in 3 months, millions of views, over Rp10.000.000 in sales) is real. The other 2 case studies (one with ROAS/CPA) and the testimonial are still samples. The PRD forbids launching with placeholders. Write metrics exactly as they are (ROAS 3,2x, CPA Rp45.000), never rounded up.
   - Pricing: all Build and run / Build only figures. Write them in full (Rp15.000.000), never "15jt".
   - About: photo (replace the `.about__photo` content with an `<img>`) and story.
   - Closing CTA: the audit refund guarantee is a business commitment.
   - Footer and schema: email `halo@marakit.com`, city.
   - TikTok and Instagram links are removed for now. Add them back in the About section, footer, and `sameAs` in the schema once the accounts are ready.
3. **Domain**: marakit.com as primary; redirect marakit.id, merakit.com and www to it.
4. **Meta Conversions API** needs a server or a partner integration. It can't run from a static page.

## Brand history and client logos
- Marakit was previously **Startiq Digital**, founded in 2025. This is mentioned in About, the footer, and the schema (`alternateName`, `foundingDate`) on both pages.
- Client logos live in `assets/clients/` (trimmed, transparent background, 120px tall WebP). They show in grayscale and turn full colour on hover. To add one, drop a WebP in that folder and add an `<li>` to `.logos__list` in both HTML files. If a logo looks too small next to the others, add `class="logo--tall"`. A brand without a logo can be written as text: `<li><span class="logo-text">Name</span></li>` (Ghovigha uses this).

## Digital products
Marakit sells digital products first; agency services open later.
- Section **Produk** (`#produk`, English `#products`) sits right after How It Works. One featured card for the available product, plus smaller "coming soon" cards.
- **Buy and preview links** live in `js/main.js` → `CONFIG.products.worksheet.buyUrl` (Lynk.id) and `demoUrl` (video or preview image). While they are empty, "Beli sekarang" and "Lihat isinya" open WhatsApp with a prefilled message, so the buttons always work.
- "Kabari saya" (coming soon) and "Masuk daftar tunggu" (Paket) are plain links with `data-wa-text="..."`; `main.js` turns them into WhatsApp links with that message (plus UTM source if present).
- To add a product: copy a `.product--soon` card in both HTML files. When it launches, move it into a `.product--featured` card and add its links to `CONFIG.products`.
- Prices, product names and release dates are marked `GANTI` in the HTML.

## Booking
Every booking button opens `wa.me/6281220694447` with a pre-written message, in the page's language. The form in the closing section adds the visitor's name, WhatsApp number, brand and monthly revenue to that message.

`booking_completed` can't be tracked on the page anymore, because the booking happens inside WhatsApp. Count completed bookings manually from WhatsApp chats.

## Tracking

| Event | When |
|---|---|
| `cta_click` | Any booking button (`location`: navbar, hero, after_bukti, paket_*, penutup) |
| `booking_started` | Any booking button clicked, or the 4-field form sent (opens WhatsApp) |
| `whatsapp_click` | WhatsApp button clicked |
| `scroll_75` | Visitor scrolls 75% of the page |
| `pricing_model` | Visitor switches between Build and run and Build only |
| `language_switch` | Visitor switches between ID and EN |
| `product_buy_click` / `product_demo_click` | "Beli sekarang" / "Lihat isinya" (`via`: link or whatsapp) |
| `notify_click` | "Kabari saya" on a coming soon product |
| `waitlist_click` | "Masuk daftar tunggu" on a Paket tier |

UTM parameters are kept for the session and sent with every event. They are also added to the WhatsApp message.

## Logo
`assets/brand/` holds the Marakit logo, cut from the master image with transparent backgrounds:
- `logo-mark.png` (512px) and `logo-mark.webp` (128px): the "m" icon, recoloured to the exact palette plum.
- `wordmark-plum.*` for light backgrounds and `wordmark-white.*` for plum backgrounds.
- The favicons (`favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`) are made from the same icon.
For the sharpest result at large sizes, replace these with exports from the original vector file (SVG) if you have it.

## Design (PRD v3)
- Palette: Plum `#3A1F3D` (headlines, dark sections, CTA), Plum Soft `#5A3360` (cards on plum, hover), Putih Hangat `#FBFAF8` (page), White (cards), Mint `#7FD8BE` only on plum, Mint Deep `#1F7A63` on light backgrounds, Mint Wash `#E3F6F0` (badges, quote, headline highlight), Abu Plum `#5B5560` (body), Garis `#ECE7EC` (borders).
- Sections alternate light and plum: hero, problem, proof and pricing are light; How It Works and the closing CTA are plum. Case-study cards are plum with mint numbers.
- Fonts: Plus Jakarta Sans for headlines, numbers and the wordmark; Inter 400/600 for body.
- No gradients, glow or particles. Motion is limited to a subtle reveal on scroll, counting stats, a slow client-logo marquee and a scroll progress line. "Reduce motion" turns all of it off.

## PRD rules applied
- 13 sections in order; light/dark section pattern; booking CTA in navbar, hero, after Proof, Pricing and closing.
- Two systems (Content System, Ads Management System), shown in Solution, Deliverables and Pricing. Three tiers with Full System marked most popular. Build and run is selected by default, with Build only one click away.
- "AI" appears twice per page, only in How It Works and the FAQ, never in the hero, Problem or Solution. How It Works shows which steps machines do and which people do.
- Reader addressed as "kamu"; no em dashes; none of the banned words; meta title, description and OG text in Indonesian on the main page.
- One H1, meta title under 60 characters, LocalBusiness (ProfessionalService) and FAQPage schema, custom OG image per language.

OG images: edit `tools/og-image.html` / `tools/og-image-en.html`, then run `node tools/render-og.mjs` (needs Playwright).
