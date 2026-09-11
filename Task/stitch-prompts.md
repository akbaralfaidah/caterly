# Caterly — Prompt Pack untuk Google Stitch

Versi 1.0 · 11 September 2026  
Dokumen pasangan: `prd.md`.

## Cara menggunakan

1. Buat proyek desain Caterly di Stitch, lalu lampirkan `logo-caterly.webp` dan `favicon-caterly.webp`.
2. Kirim **Prompt 0** untuk membentuk arah visual dan satu layar acuan. Periksa hasilnya sebelum meneruskan agar halaman berikutnya mengikuti gaya yang sama.
3. Kirim **Prompt 1–6 satu per satu**, dalam proyek/konteks yang sama. Masing-masing prompt memiliki kelompok layar dan state terkait. Jika satu keluaran terlalu padat, pecah sesuai ID layar dalam prompt tanpa mengubah aturan produk.
4. Gunakan **Prompt 7** untuk meninjau dan memperbaiki konsistensi hasil. Minta versi desktop dan mobile layar transaksi utama, bukan sekadar mengecilkan screenshot desktop.
5. Berikan `prd.md`, file ini, kedua logo dan hasil desain yang dipilih kepada Antigravity. PRD menentukan perilaku aplikasi; desain menentukan tampilan. Jangan membiarkan teks/aksi tambahan hasil generasi mengubah scope produk.

Prompt ditulis dalam bahasa Inggris untuk instruksi desain, tetapi **seluruh copy antarmuka harus bahasa Indonesia**. Tiap blok di bawah dapat disalin langsung. Prompt ini tidak menjanjikan format ekspor atau kemampuan integrasi tertentu dari Stitch.

Aturan sumber: kedua PDF mewajibkan kode asli yang ditulis sendiri dan melarang penyalinan template/pihak lain. Penggunaan AI untuk tes tidak dijelaskan eksplisit. Desain ini tidak membuktikan izin memakai kode generasi; penggunaan hasil untuk tes mengikuti penjelasan penyelenggara. Jangan menganggap ekspor kode Stitch boleh langsung dijadikan hasil tes.

## Prompt 0 — Identitas, design system, dan layar acuan

```text
Design Caterly, an Indonesian B2B lunch catering marketplace connecting catering businesses with office purchasing coordinators. I have attached the real Caterly logo and favicon. Preserve their exact artwork, aspect ratio and colors; do not redraw the logo or invent a new wordmark.

Create a coherent visual foundation and ONE reference marketplace screen first. The product is a working purchasing and catering operations application. Its visual character should be calm, precise, welcoming and food-focused. All interface copy must be natural Bahasa Indonesia, prices in Indonesian rupiah, and times labeled WIB.

BRAND AND VISUAL SYSTEM
- Main background: #FFFFFF.
- Primary green: #016039; orange accent: #F48317; primary text: #11171E.
- Supporting surface: #F6F8F7; border: #E4E9E6; secondary text: #55635B; pale green: #EDF5F0; pale orange: #FFF3E6.
- Green primary buttons with white text. Use orange sparingly as a brand accent, with readable dark text where appropriate. Check color contrast; do not use orange text on white for small essential labels.
- Typography: Manrope or a restrained system sans-serif alternative. Body 14–16 px, page titles 24–32 px, clear field labels and tabular numeric alignment for amounts.
- Spacing: 4/8 px system. Button/input radius 8 px, card radius 12 px. Thin borders, limited shadows for actual elevation, restrained line icons.
- Use genuine-looking Indonesian boxed meal photography with consistent 4:3 crops. Use images only where they help select food. Asset examples are placeholders for design; do not imply real businesses endorse Caterly.
- Design original compositions for each task. Avoid purple/blue decorative gradients, glassmorphism, mesh backgrounds, floating blobs, giant rounded statistic tiles, emoji navigation, decorative charts and generic dashboard template layouts.
- Do not invent ratings, testimonials, certification badges, customer counts, discount banners, loyalty points or AI features.

PRODUCT RULES THAT APPLY TO EVERY SCREEN
- Exactly two authenticated roles: Kantor and Katering. No admin, employee or courier portal.
- One order contains multiple menus from one merchant, for one address and one delivery date.
- Search context: city/service area, delivery date and total portions. Food category and budget are secondary filters.
- Default minimum order: 10 portions. Delivery window: 11.00–12.00 WIB.
- Booking closes at 16.00 WIB on the previous day. Maximum booking horizon: 30 days.
- A submitted order first waits for merchant confirmation. Payment is available only after acceptance.
- Manual bank transfer is reviewed by the merchant. Order status and payment status are distinct.
- Total = food subtotal + delivery fee. No tax, discount or platform fee in this release.
- Invoice is issued when an order is created. It does not imply payment. Rejected/cancelled/expired orders have a void invoice.
- No wallet, payment gateway, subscription, live chat, live tracking, review system or password-reset UI in this release.

REFERENCE SCREEN: S01 MARKETPLACE
Desktop at 1440 px and a thoughtfully rearranged 390 px mobile version.
Use a compact white header with the Caterly wordmark, navigation Cari Katering, Pesanan, Invoice, and the account menu. Provide contextual cart and notification controls. In guest state show Masuk and Daftar instead of private navigation.
Main heading: “Makan siang untuk tim Anda”. Supporting sentence: “Temukan katering sesuai lokasi, jadwal, dan kebutuhan porsi kantor.”
Immediately below, show a structured search form: Lokasi kantor, Tanggal pengiriman, Jumlah porsi, and Cari katering.
Desktop filter column on the left, food/merchant results on the right. Mobile uses a clearly labeled filter sheet and a single-column results list.
Each merchant result shows a food photo, merchant name, service area, food category, minimum portions, starting menu price and separately stated delivery fee. Availability language must depend on the selected date and portion count; before complete search input, use “Pilih tanggal untuk cek ketersediaan”.
Use fictional Dapur Selaras in Kota Jambi as the primary example: starting at Rp28.000/porsi, minimum 10 porsi, delivery fee Rp25.000. No star ratings or verification badges.
Show an empty-results state with “Belum ada katering yang cocok” and useful actions to change date or reset filters.

ACCESSIBILITY
Visible keyboard focus, labeled controls, 44 px touch targets, sufficient text contrast, and text labels alongside status colors. Avoid page-wide horizontal overflow at 360 px. Sticky elements must not cover content or mobile navigation. Display inline error states, not just colored borders.

Deliver a compact design-token/component reference and the marketplace desktop/mobile reference. Keep the result coherent enough to guide all subsequent screens. This is a visual design request; do not generate Laravel features or change the product rules.
```

## Prompt 1 — Profil katering, pemilihan menu, dan autentikasi

```text
Continue the existing Caterly design. Reuse the attached logo, white background, green #016039, restrained orange #F48317, dark #11171E, typography, spacing, borders and component states from the approved reference. All interface text must remain Bahasa Indonesia. Do not redesign the brand.

Create the following screens and essential variants:

S04 — MERCHANT DETAIL
- Fictional merchant Dapur Selaras, serving Kota Jambi.
- Clear header with merchant name, short description, contact information, area served and lunch delivery window 11.00–12.00 WIB.
- Show minimum 10 portions, order deadline 16.00 WIB the previous day, and delivery fee Rp25.000 to the selected service area.
- Keep selected delivery date and requested portion count visible and editable.
- Food menus have 4:3 photographs, name, short description, category, per-portion price, quantity control and a clear add action.
- Example menu A: Nasi Ayam Bakar, Rp28.000. Example menu B: Nasi Ikan Sambal, Rp30.000.
- Desktop has a restrained sticky order summary to the side. Mobile has a compact “Lihat keranjang” action with portion count and estimated subtotal; no overlay covering content.
- A cart contains one merchant only. Design a confirmation dialog when adding food from a different merchant: keep current cart or replace it. Never silently clear the cart.
- Show selected-date unavailable, merchant closed and capacity-insufficient variants with an actionable explanation.
- Do not invent map tracking, reviews, allergy guarantees or halal certification badges.

S02 — LOGIN
- A focused form with Email, Password, visibility toggle, Masuk and a link to Daftar.
- Use tasteful whitespace and a small food image or simple brand treatment, rather than a large decorative illustration.
- Show generic invalid-credentials error and loading state. No social sign-in and no forgot-password link because they are outside the release.

S03 — REGISTRATION
- Two clear role choices: “Saya mewakili kantor” and “Saya penyedia katering”.
- Fields: Nama perusahaan, Nama PIC, Email, Nomor telepon, Password, Konfirmasi password.
- Explain password length briefly and support visible validation below fields.
- Do not add an admin or individual employee role.
- After merchant registration, show an onboarding checklist for profile, service area, bank account, schedule/capacity and first active menu. The profile is draft until complete; do not add an admin verification step.

Show desktop and 390 px mobile layouts for the merchant detail, and mobile-friendly forms for authentication. Include empty/loading/validation/disabled states as useful component variants. Keep navigation and button labels consistent with the existing marketplace.
```

## Prompt 2 — Keranjang, checkout, pesanan kantor, dan invoice

```text
Continue Caterly in the same design system: white #FFFFFF, green #016039, orange #F48317 used sparingly, text #11171E. Use the original logo. All UI text is Bahasa Indonesia. Design S05, S06, S07 and S08 with connected, consistent data.

FIXED DEMO ORDER
Merchant: Dapur Selaras. Customer: PT Sinar Karya. PIC: Nadia. Area: Kota Jambi.
Delivery: 18 September 2026, 11.00–12.00 WIB.
25 Nasi Ayam Bakar × Rp28.000 = Rp700.000.
15 Nasi Ikan Sambal × Rp30.000 = Rp450.000.
Total portions: 40. Subtotal: Rp1.150.000. Delivery fee: Rp25.000. Grand total: Rp1.175.000.
Order: CTR-20260917-000042. Invoice: INV-20260917-000042.
No taxes, discounts or platform fees. Use placeholder addresses/contact/bank details that are explicitly demo data, not a real account number.

S05 — CART AND CHECKOUT
- Editable menu rows with quantities, prices and remove controls.
- Delivery date, lunch window, saved office address, PIC and optional order note.
- Separate food subtotal and delivery fee; show the exact final total before submission.
- Desktop: main form left and sticky cost summary right. Mobile: logical single-column sequence and final action that does not cover content.
- Primary action “Buat pesanan”. Supporting copy: merchant confirmation is required before payment.
- State variants: below minimum 10 portions; unavailable date; capacity has changed; menu no longer available; price changed and needs reconfirmation; network error with preserved fields; submitting.
- Explain before checkout that online cancellation is limited and cancellation/refund after paid is not supported in this version. Keep the copy short and contextual, not a legal disclaimer wall.

S06 — CUSTOMER ORDERS
- Compact list/table with order number, merchant, delivery date, portions, amount, order status and separate payment status.
- Search by number/merchant, date and status filters, pagination.
- Mobile list rows remain clearly labeled; avoid turning every field into an oversized separate card.

S07 — ORDER DETAIL
- Show the order and invoice identifiers, merchant, delivery snapshot, food items, cost summary and actual status timeline.
- State A: “Menunggu konfirmasi” + “Belum dibayar”. Show an example confirmation deadline of 17 September 2026 at 12.00 WIB for an order placed at 10.00 WIB. Provide “Batalkan pesanan” and “Lihat invoice”. Explicitly tell the customer to wait for merchant confirmation before transferring.
- State B: “Diterima” + “Belum dibayar”. Show transfer instructions and “Unggah bukti pembayaran”. Customer cancellation is no longer available.
- State C: “Dikirim” + “Lunas”. Provide “Konfirmasi diterima”. No live map.
- State D: “Selesai” + “Lunas”. Provide “Pesan lagi” with a note that price and availability will be checked again.
- State E: Rejected, cancelled or expired. Show reason where relevant and a void invoice. Do not show a payment action.
- Separate completed timeline steps from future steps; do not imply events happened when they have not.

S08 — INVOICE LIST AND PRINTABLE DOCUMENT
- Invoice list has invoice/order number, merchant, issue date, amount and payment status.
- Detail is a clean A4-style business document using the Caterly logo, seller/buyer snapshots, invoice/order number, issue date, delivery information, item table and precise totals.
- Provide “Cetak / Simpan PDF” via a print-oriented design. Do not imply a server PDF download feature.
- Show unpaid, paid and “Dibatalkan”/void variants. Invoice issuance is not proof of payment.
- Print design removes app navigation and interactive controls. Ensure long item tables remain legible across pages.

Create desktop and mobile versions of checkout and order detail, with list and print layouts as additional views. Match all amounts and statuses exactly across screens.
```

## Prompt 3 — Portal merchant, menu, dan produksi harian

```text
Continue the existing Caterly visual system and original logo. White backgrounds, restrained green/orange accents, compact typography and practical information density. All interface labels in Bahasa Indonesia. Design a useful catering operations workspace with desktop and mobile layouts.

MERCHANT NAVIGATION
Ringkasan, Menu, Pesanan, Jadwal & Kapasitas, Invoice, Profil Usaha. Notification and account controls in the header. Use an approximately 232 px desktop sidebar and a mobile drawer. No admin portal, courier portal or decorative analytics dashboard.

S10 — MERCHANT OVERVIEW
- Lead with actionable work: orders waiting for confirmation and payment proofs waiting for review.
- Below, show the selected delivery date and the food production summary.
- Use small, clearly labeled operational totals rather than giant colored statistic cards.
- Each pending order has office name, delivery date, portions, total, response deadline and a clear review action.
- Show useful zero-order and loading variants without fake business metrics.

S11 — MENU MANAGEMENT
- Table/list with photo thumbnail, menu name, category, price, active status and row actions.
- Search and category/status filters. Primary action “Tambah menu”.
- Dedicated create/edit form: Nama menu, Deskripsi, Kategori, Harga per porsi, Foto menu, Aktif/nonaktif.
- Image upload with preview, replace/remove, and visible JPG/PNG/WebP, max 3 MB guidance.
- Price formatted in rupiah; show field errors, saving state and success in the updated list.
- Confirm delete and explain existing order history is retained. Do not describe database mechanics in the customer-facing copy.

S16 — DAILY PRODUCTION
- Date selector, “Cetak rekap”, aggregate by menu and a second section grouped by destination office.
- For the main demo order, show 25 Nasi Ayam Bakar and 15 Nasi Ikan Sambal for PT Sinar Karya, 40 portions total.
- Production includes accepted-and-paid, preparing, delivering and completed orders for that date. Exclude unconfirmed, unpaid, cancelled, rejected and expired orders.
- If additional capacity is reserved by unconfirmed orders, it is not part of the production total; use different labels rather than conflating the two numbers.
- Each destination shows PIC, portions, delivery window, address and state. Completed deliveries remain marked complete.
- Print variant removes navigation, has legible rows and clear date/merchant heading.

Make the mobile merchant view appropriate for a person checking orders in a kitchen: large touch targets, compact but legible rows, and direct access to urgent actions. Avoid multiple charts, revenue-growth claims, arbitrary trend percentages and notification counts that do not match the underlying example lists.
```

## Prompt 4 — Pesanan merchant dan pembayaran manual kedua role

```text
Continue Caterly with the same visual system, original logo and Indonesian interface language. Design the order handling and manual payment states for both roles. Use the same Dapur Selaras / PT Sinar Karya order: 40 portions, subtotal Rp1.150.000, shipping Rp25.000, total Rp1.175.000.

S12 — MERCHANT ORDERS
- A compact queue/table with number, office, delivery date, portions, total, order status, payment status and response deadline when pending.
- Search, date and status filters and pagination. Mobile uses concise labeled list rows.
- Detail shows immutable order information, food items, address/PIC, invoice, notes, actual timeline and a contextual action area.

ORDER ACTIONS
- Pending confirmation: “Terima pesanan” and “Tolak pesanan”; rejection requires a reason.
- Accepted and unpaid: show payment waiting state. Merchant may cancel with a reason only if there is no proof waiting for review.
- Accepted and pending payment review: show “Tinjau pembayaran”. Cancellation is unavailable.
- Accepted and paid: “Mulai persiapan” is available on/after the delivery date. Before that, explain when preparation can start.
- Preparing: “Tandai dikirim” on/after the delivery date.
- Delivering: merchant sees “Menunggu konfirmasi penerimaan kantor”; only the customer confirms completion.
- Completed/rejected/cancelled/expired: no action to revive the order.
- An expired order cannot be accepted. Show a conflict message if its status changed while the page was open.
- Do not allow the merchant to mark an order paid through a generic order-status dropdown.

S15 — CUSTOMER PAYMENT UPLOAD
- Available only for accepted orders.
- Show bank name, account holder and account number as explicit demo placeholders, and the exact amount Rp1.175.000.
- Upload JPG/PNG/WebP/PDF up to 5 MB, preview or file details, optional replace before submitting, and “Kirim bukti pembayaran”.
- Submitted state: “Menunggu verifikasi pembayaran”; no second simultaneous pending submission.
- Rejected proof state shows the merchant's reason and allows a new upload; retain the history of the previous submission.
- Paid state: “Pembayaran dikonfirmasi” with timestamp.
- Do not show automatic bank verification, QRIS, card payment, wallet or payment gateway.

S15 — MERCHANT PAYMENT REVIEW
- Preview/file viewer with order number, office, exact amount, upload time and previous proof history.
- Two actions: “Konfirmasi pembayaran” and “Tolak bukti”. Rejection reason required.
- Brief supporting copy reminds merchant to match the transfer with bank records before confirming; an uploaded image itself is not automatic proof that funds arrived.
- Success moves payment state to Lunas while order remains Diterima until preparation starts.
- Sensitive proof access is limited to the customer and merchant involved. Do not place a public sharing control on this screen.

Include readable confirmation dialogs, inline errors, upload progress/loading, successful review, stale-status conflict, and desktop/mobile detail layouts. Keep order status and payment status visually distinct but consistent everywhere.
```

## Prompt 5 — Jadwal, kapasitas, profil, dan alamat

```text
Continue Caterly without changing its white/green/orange identity or typography. All UI text in Bahasa Indonesia. Design S09, S13 and S14 as working settings screens rather than decorative dashboards.

S13 — SCHEDULE AND CAPACITY
- Merchant sets operating weekdays and default capacity in portions per day.
- Default capacity example: 100 portions. A date list/table shows date, open/closed, capacity, reserved portions, remaining portions and edit action.
- Add a date override for capacity or closure through a focused form/dialog.
- Show a valid example: 100 capacity, 75 reserved, 25 remaining; do not display 75 as paid production automatically.
- Explain that pending confirmation orders temporarily reserve capacity. Once rejected/cancelled/expired, their reservation is released.
- Prevent saving a capacity below existing reservations: e.g. attempting 60 when 75 are reserved shows “Kapasitas tidak boleh kurang dari 75 porsi yang sudah dipesan.”
- Show a specific conflict when closing a date/day would contradict future committed orders; do not silently cancel them.
- Display the fixed booking deadline “Pukul 16.00 WIB, sehari sebelum pengiriman”, the 30-day booking horizon, and lunch window 11.00–12.00 WIB. These are read-only global rules in this release, not editable per merchant.
- On mobile use an agenda/date list instead of forcing a dense desktop calendar into a narrow screen.

S14 — BUSINESS PROFILE
- Sections: Identitas usaha, Wilayah layanan & ongkir, Ketentuan pesanan, Rekening pembayaran, Publikasi profil.
- Identity: company name, full business address, contact and description.
- Service areas: city/regency choices and flat delivery fee per area. Example Kota Jambi, Rp25.000.
- Order setting: minimum portions, default example 10. Schedule/capacity can link to S13.
- Bank name, account holder and account number; no real account data in the mockup.
- Publication checklist: profile, service area, account, operating schedule/capacity and at least one active menu. “Terbitkan profil” only when complete. No admin approval or verified badge.
- Clearly distinguish draft vs published profile and preview the public merchant page.

S09 — OFFICE PROFILE AND ADDRESSES
- Office company name, PIC, email/account display and contact number.
- Saved addresses list with label, receiver, telephone, city/regency, detailed address and optional location note.
- Add/edit form, “Jadikan alamat utama”, and delete confirmation.
- The address used for an existing order remains unchanged when saved address details are edited; explain this briefly when relevant.
- No multi-user invitations, employee headcount management or purchasing approval hierarchy in this version.

Include validation, unsaved changes, saving, saved, empty address/service-area list and narrow mobile layouts. Settings should be visually calm, with readable section boundaries and a clear primary save action.
```

## Prompt 6 — Notifikasi, pesan ulang, dan edge states

```text
Continue the established Caterly design and original logo. All copy remains Bahasa Indonesia. Complete S17 and interaction states that make the existing screens usable. Do not introduce new product modules.

S17 — NOTIFICATIONS
- Header notification control with a restrained unread indicator and a readable panel/list.
- Each item has a concise event message, order reference, timestamp and read/unread treatment.
- Customer events: merchant accepted/rejected order, order expired, merchant cancelled, payment approved/proof rejected, order sent.
- Merchant events: new order, customer cancelled pending order, new payment proof, customer confirmed receipt.
- “Tandai semua dibaca” and an empty state. Clicking an item leads to the related order.
- No WhatsApp/email delivery settings or real-time claims in this release.

REORDER FLOW
- “Pesan lagi” from a completed order builds a NEW cart with current prices and active menus.
- Show a change summary when an item is unavailable or a price changed; never imply historical prices are guaranteed.
- If the current cart has items, ask whether to keep it or replace it.
- Require a new valid date and recheck capacity before checkout. Cart creation alone does not reserve portions.

SHARED STATES
- Merchant/menu image failed to load: restrained fallback retaining the name and price.
- Search loading; no search results; empty order/invoice list; empty merchant menu list.
- Session expired: clear sign-in action and safe return to the intended screen.
- Permission denied/not found: concise message with a route back; no private order details.
- Network failure during submit: preserve input and provide retry. Do not show a success page before success.
- Price/capacity/status changed since page load: explain the changed value and provide a review action.
- Paid order cancellation unavailable: explain the scope without presenting a fake refund action.
- Keyboard focus, validation summaries, field errors, disabled reasons and reduced-motion-friendly interaction states.

Create a compact state gallery mapped to the existing screen IDs. Do not fill it with new unrelated illustrations or marketing copy. These states should be reusable with the marketplace, checkout, order detail, settings and merchant tools already designed.
```

## Prompt 7 — Pemeriksaan dan perbaikan konsistensi

```text
Review and refine the existing Caterly screens as one product. Keep the current brand direction; improve consistency and usability rather than redesigning everything.

Check these requirements against the actual screens:

1. Original logo and favicon preserved. White #FFFFFF remains the primary background; green #016039 and orange #F48317 match throughout.
2. Consistent typography, spacing, radii, icon style, table density and component behavior. Distinct page types have compositions appropriate to their tasks.
3. All interface text is natural Bahasa Indonesia. Prices use rupiah formatting, quantities use porsi, and delivery times use WIB.
4. Only two roles: Kantor and Katering. Remove any accidental admin/driver/employee portal, star ratings, verified badges, subscription, wallet, chat, payment gateway, decorative analytics or nonworking password-reset link.
5. The demo arithmetic is identical everywhere: 25 × Rp28.000 + 15 × Rp30.000 = Rp1.150.000; shipping Rp25.000; total Rp1.175.000; 40 portions.
6. One merchant/date/address per order. No payment before merchant acceptance. Separate order status from payment status. Invoice issued does not imply paid.
7. Customer can cancel only pending orders. Merchant can cancel accepted orders only when unpaid and with no proof under review. Preparing requires paid and the delivery date to have arrived. Only the customer confirms receipt.
8. Expired/rejected/cancelled orders show void invoices and no payment actions. Completed orders support new-cart reorder with fresh price/availability checks.
9. Minimum 10 portions, default capacity 100, deadline 16.00 WIB the previous day, delivery window 11.00–12.00 WIB, maximum 30-day booking horizon. Capacity and production counts are not interchangeable.
10. Desktop 1440 px and mobile 390 px are intentionally laid out. Also inspect a 360 px narrow viewport. No whole-page horizontal scrolling or sticky content covering buttons/fields/navigation.
11. Visible keyboard focus, readable color contrast, 44 px touch targets, explicit labels and inline error messages. Status meaning is never color-only.
12. Invoice print is a readable A4 business document with no navigation controls. Payment proof is private with no public sharing action.
13. Empty/loading/error/success/unavailable/confirmation states exist for critical forms and workflows.

Fix concrete inconsistencies you find. Provide a short list of changes and a final screen inventory keyed to S01–S17. If a behavior cannot be expressed by a static design, annotate the intended behavior instead of pretending it already functions. Do not claim accessibility testing or backend verification that has not been performed.
```

## Daftar layar dan prompt pemiliknya

| ID | Layar | Prompt |
|---|---|---|
| S01 | Jelajah | 0 |
| S02 | Login | 1 |
| S03 | Registrasi/onboarding | 1 |
| S04 | Detail merchant | 1 |
| S05 | Keranjang/checkout | 2 |
| S06 | Pesanan customer | 2 |
| S07 | Detail order bersama | 2 dan 4 |
| S08 | Invoice list/detail/print | 2 |
| S09 | Profil kantor/alamat | 5 |
| S10 | Ringkasan merchant | 3 |
| S11 | CRUD menu | 3 |
| S12 | Pesanan merchant | 4 |
| S13 | Jadwal/kapasitas | 5 |
| S14 | Profil usaha | 5 |
| S15 | Upload/review pembayaran | 4 |
| S16 | Rekap produksi/print | 3 |
| S17 | Notifikasi | 6 |

Untuk daftar invoice merchant gunakan struktur S08 dengan kolom pihak lawan berupa nama kantor; invoice detail milik transaksi tetap identik. Untuk menu/profile mobile gunakan state dan token yang sama dengan layar desktop.

## Pemeriksaan sebelum diserahkan ke Antigravity

- Pastikan semua layar inti dan state transaksi ada, bukan hanya landing page.
- Simpan hasil desain yang dipilih dengan ID layar agar mudah dipetakan ke PRD.
- Sertakan kedua logo asli; jangan mengandalkan logo hasil rekonstruksi pada mockup.
- Hapus fitur tambahan yang tidak ada di PRD atau catat sebagai usulan, jangan otomatis masukkan ke implementasi.
- Gunakan instruksi handoff pada bagian 16 `prd.md`. Catat desain yang belum selesai; jangan menganggap desain statis sudah memiliki backend berfungsi.

Referensi sumber perilaku: dua PDF yang diberikan pengguna dan `prd.md`. Situs desain yang dipilih: https://stitch.withgoogle.com/.
