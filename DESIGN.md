# Dokumen Desain Visual & Pedoman Implementasi Caterly

## 1. Ringkasan Arah Visual
Sistem desain Caterly dirancang untuk sebuah marketplace katering B2B. Arah visual yang diusung adalah "Calm Authority" (otoritas yang tenang) dan "Warm Hospitality" (keramahan yang hangat). Aplikasi ini ditujukan untuk memfasilitasi kebutuhan perusahaan dalam pemesanan katering, sehingga antarmuka harus menumbuhkan rasa kepercayaan, kebersihan, efisiensi operasional, dan kepastian transaksi. Antarmuka ini menghindari elemen dekoratif yang berlebihan (seperti *glassmorphism*, gradasi dekoratif, atau statistik yang tidak relevan), melainkan fokus pada kejernihan tipografi dan navigasi.

## 2. Sumber Desain
*   **Project ID**: `projects/10162001608890941644` (Stitch)
*   **Nama Proyek**: Caterly B2B Catering Marketplace
*   **Dokumen Acuan**: `prd.md`, `stitch-prompts.md`, logo & favicon Caterly.

*Nilai-nilai desain di dokumen ini diekstrak dari desain yang dipilih di Stitch, Metadata Proyek (Design Tokens / `designMd`), dan penyesuaian aturan produk dari PRD.*

## 3. Inventaris dan Pemetaan Layar

Berikut ini adalah pemetaan layar dari sistem desain ke kebutuhan fitur di PRD (S01–S17):

| ID PRD | Layar | Screen ID (Stitch) | Ketersediaan |
| :--- | :--- | :--- | :--- |
| **S01** | Marketplace / Jelajah Katering | `ab2e1126d1264c1383699baf6bc8c104` | Tersedia (Acuan Utama) |
| **S02** | Login | `f2e7f7bc7f9a41f9b0a05550d906ec08` | Tersedia (Tergabung dgn S03) |
| **S03** | Registrasi / Onboarding | `f2e7f7bc7f9a41f9b0a05550d906ec08` | Tersedia (Tergabung dgn S02) |
| **S04** | Detail Merchant | Desktop: `fe3542a9b39a401cbf80411d92b2e28d`, Mobile: `ee607ade568b4a9eb23347be7b788498` | Tersedia (Desktop & Mobile) |
| **S05** | Keranjang & Checkout | `d4808e30f68f47a494cfa697a7530b14` | Tersedia |
| **S06** | Daftar Pesanan Customer | `5d2f664e2ecd491e89a538a1b36077cc` | Tersedia |
| **S07** | Detail Pesanan Bersama | `cb8746bf4c7941e68187e71c9550b8a3` | Tersedia |
| **S08** | Invoice List / Dokumen Cetak | `dfcab073b5f3458cb5f4378ea59d690d` | Tersedia |
| **S09** | Profil Kantor & Alamat | Desktop: `544bab7731284b1097d0c51996b393b8`, Mobile: `918c1f207ace42b7acf355b6794fa440` | Tersedia |
| **S10** | Ringkasan Operasional Merchant | Desktop: `6fb5d124fd6341f98a711ec835f3e4f2`, Mobile: `aa3c0fa8463c41a9ac7a247a5280c06f` | Tersedia |
| **S11** | Manajemen Menu (CRUD) | `83926d5c994d47678c3d31b753273d50` | Tersedia |
| **S12** | Daftar & Penanganan Pesanan (Merchant)| `626599904bf240b286044ca2ae20c580` | Tersedia |
| **S13** | Jadwal & Kapasitas | Desktop: `5e5fa1ca67354bd9842fb57690f6c9dc`, Mobile: `66b1dd75069b4635b3c77fdc2d3151eb` | Tersedia |
| **S14** | Profil Usaha Merchant | Desktop: `adb4440fdfde47dc91a4a7e4f02df029`, Mobile: `5114f37f7e2c467182cd7390f153c96c` | Tersedia |
| **S15** | Upload / Review Pembayaran Manual | `bdb878bd28ff4fb6b4dca303707487f1` | Tersedia |
| **S16** | Lembar Produksi Harian | Desktop: `48ca8ceb1d7241d6a8e0a68993297a5b`, Mobile: `aa3c0fa8463c41a9ac7a247a5280c06f` | Tersedia |
| **S17** | Notifikasi & Galeri State | `337bb14e716347fea0c9f5d689ecd67e` | Tersedia |

**Status Kepastian Pemilihan:**
Layar `S01` (Marketplace) menjadi *reference screen* utama yang memimpin bahasa visual (warna, tombol, spacing, typography) untuk sisa layar lainnya. Keputusan ini berstatus final secara acuan desain. Seluruh layar `S01` hingga `S17` saat ini telah dirancang dan tersedia sebagai acuan implementasi.

## 4. Design Tokens (Warna & Radius)

Berdasarkan *metadata* hasil parsing dari proyek Stitch.

| Kategori | Nama Variabel | Kode Warna / Nilai | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Background** | `surface` | `#FFFFFF` | Latar utama halaman aplikasi. |
| **Surface/Card** | `surface-dim` / `surface-container` | `#F6F8F7` / `#F8F9FF` | Latar *container* (seperti filter drawer, header tabel). |
| **Primary** | `primary` | `#016039` | Tombol utama, tautan aktif, aksen badge, state *confirmed*. |
| **Accent / Warn**| `accent` | `#F48317` | Fokus/Peringatan, alert penting, badge tertunda (background light `#FFF3E6`). |
| **Text (Dark)** | `on-surface` | `#11171E` | Teks utama, label, paragraf, angka tabular. |
| **Text (Muted)** | `on-surface-variant` | `#55635B` | Teks tambahan, header tabel, info porsi. |
| **Border** | `outline-variant` | `#E4E9E6` | Garis pemisah, bingkai form, border tabel/card. |
| **Semantic: Success** | `green-tint` | `#EDF5F0` | Background badge sukses/konfirmasi (teks tetap `#016039`). |
| **Semantic: Error** | `error` | `#BA1A1A` | Validasi gagal, status pembatalan, peringatan destruktif. |
| **Semantic: Info** | `blue-tint` | `#EBF3FB` | Background state pengiriman (In Transit) dengan teks `#0B5CAB`. |

**Bentuk & Corner Radius**:
- **Tombol & Input Controls**: `8px` (`rounded-md`).
- **Cards & Data Containers**: `12px` (`rounded-lg`).
- **Modals / Dialog**: `16px` (`rounded-xl`).
- **Badge Operasional / Status**: `6px` (`rounded-sm`) atau pil bulat penuh untuk tag makanan (mis. Halal).

## 5. Tipografi & Hierarki Informasi
- **Font Utama**: **Manrope** (fallback: `sans-serif` standar).
- Seluruh penulisan Rupiah dan *qty* menggunakan `tabular-nums` agar sejajar dengan rapi.

| Tingkat | Ukuran | Weight | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Headline XL** | 36px (Desktop), 28px (Mobile) | Bold (700) | Judul hero, halaman *Marketplace* / Landing |
| **Headline Lg** | 28px (Desktop), 24px (Mobile) | Bold (700) | Judul utama halaman *dashboard* |
| **Headline Md/Sm**| 22px / 18px | SemiBold (600) | Judul seksi, nama menu di *card*, nama katering |
| **Body Lg** | 16px | Reguler (400) | Teks pendukung lebar |
| **Body Md** | 14px | Reguler (400) | Paragraf default, isi tabel data |
| **Body Sm** | 12px | Reguler (400) | Teks sub-info (mis: `Rp 25.000 /porsi`), timestamp |
| **Label Lg / Button**| 14px / 16px | SemiBold (600) | Teks tombol, *tabs* |
| **Label Md / Header**| 12px | SemiBold (600) | Header kolom tabel (Uppercase), label form |
| **Currency Lg** | 18px | Bold (700) | Nominal total harga di checkout / keranjang |

## 6. Pola Layout
Sistem grid menggunakan pola `8pt` (*spacing* kelipatan 8).

### Desktop (> 1024px)
- Lebar halaman maksimum `1440px`.
- Layout utama **Marketplace**: 12-kolom grid. Filter statis di sebelah kiri (~25% lebar), *grid* kartu katering di kanan (~75%).
- Layout **Merchant Dashboard**: Menggunakan *Side Navigation* selebar kurang lebih `232px`, sisa layar digunakan untuk kanvas konten tabel / laporan.
- Layout **Checkout**: 2-kolom asimetris (Form/Alamat di kiri, *Sticky Order Summary* di sebelah kanan).

### Mobile (< 768px, target ideal 390px)
- Navigasi berpindah menjadi sistem *Drawer* / *Hamburger menu* (Merchant) atau Navigasi Bawah maksimal 4 *tab* (Customer).
- Filter pencarian berubah menjadi *Bottom Sheet* / Dialog agar tidak menghalangi tampilan barang.
- Keranjang menjadi *Floating Button* yang *compact* dan menempel di batas layar bawah (tidak memblokir konten krusial).
- Tabel dengan banyak kolom di-*stack* menjadi kartu-kartu antrean berlabel (hindari *horizontal scroll* pada form).

## 7. Spesifikasi Komponen

- **Tombol Utama (Primary)**: Background `#016039`, Teks `#FFFFFF`. Radius `8px`. Tinggi `40px` (Desktop) / `44px` (Mobile untuk tap-target).
- **Tombol Akses Darurat (Aksi Khusus)**: Background `#F48317`, teks putih. Eksklusif untuk CTAs *Checkout* akhir ("Buat Pesanan", "Konfirmasi").
- **Tombol Sekunder (Secondary)**: Background transparan atau hijau pucat `#EDF5F0`, Teks `#016039`, border ringan.
- **Input Field**: Tinggi `40px`, border `#E4E9E6`. Saat mendapat *focus*, border menjadi solid `#016039`. Prefiks mata uang (Rp) menggunakan warna `#55635B`.
- **Cart/Katering Card**: Rasio foto selalu **4:3**. Judul di tengah, harga rata kanan bawah. Tidak menggunakan bayangan berat (drop shadow statis), melainkan border 1px solid.
- **Status Badges**:
    - **Pending**: Latar `#FFF3E6`, Teks `#B35600`.
    - **Dikonfirmasi/Proses**: Latar `#EDF5F0`, Teks `#016039`.
    - **Selesai**: Latar `#F6F8F7`, Teks `#11171E`.
- **Tabel**: Header tinggi `36px` abu-abu terang `#F6F8F7`. Tinggi baris `48px`. Angka rupiah dan porsi sejajar rata kanan (*right-aligned*).

## 8. Catatan Desain Khusus Per Halaman
- **S04 (Merchant Detail)**: Jangan buat fitur ulasan bintang atau lokasi *map live*. Gunakan foto dengan kualitas 4:3. Jika beda *merchant* di-*add* ke *cart*, *prompt* konfirmasi reset *cart* harus muncul.
- **S05 (Checkout)**: Total akhir sudah harus termasuk Ongkir. Sediakan pesan ringkas tanpa *checkbox* validasi panjang (disclaimer) bahwa pesanan tak dapat di-*refund* via aplikasi setelah dibayar.
- **S08 (Invoice)**: Pastikan layoutnya memadai untuk fungsi `window.print()` (hilangkan UI Navigasi, pastikan latar tetap berwarna jika user mencentang 'print backgrounds', perhatikan pagination batas tabel).

## 9. State Interaksi & Aksesibilitas
- *Hover*: Beri efek penggelapan warna tombol 8-12% pada desktop. Di tabel, *row hover* menggunakan background `#F6F8F7`.
- *Disabled*: Form dan tombol *checkout* harus dikunci (*disabled*) jika kuota tak cukup atau input tidak valid, lengkapi dengan keterangan tekstual tambahan (bukan hanya efek *graying out*).
- Form validasi wajib secara *inline* dan jelas.
- Target sentuh mobile minimal `44x44px` agar mematuhi WCAG.

## 10. Konflik, Kekurangan Desain, & Rekomendasi
*   **S09, S13, S14**: Sekarang sudah tersedia versi Desktop dan Mobile, mengikuti identitas form dan tabel vertikal dari antarmuka Merchant.
*   **Konflik Potensial Mobile & Tabel Merchant**: Pada S12 (Pesanan Merchant) dan S16 (Rekap Produksi), versi desain mobile memadatkan terlalu banyak info angka.
    *   *Rekomendasi*: Implementasikan tampilan list berbasis *card* di layar `<768px` dan posisikan status badge secara *prominent* di sudut atas kartu agar mudah dibaca sekilas.

## 11. Aturan Penggunaan Logo & Aset
Gunakan file `logo-caterly.webp` untuk *Wordmark* di *header* dan *Invoice*. `favicon-caterly.webp` digunakan sebagai aset `<link rel="icon">`. Rasio aspek tidak boleh diganggu.

## 12. Checklist Kesesuaian Visual untuk Implementasi
- [ ] Font Manrope diintegrasikan (`sans-serif` default).
- [ ] Latar putih murni `#FFFFFF` diterapkan dengan konsisten.
- [ ] Tombol *primary* hijau `#016039`.
- [ ] Gambar katalog secara eksplisit memotong dengan rasio 4:3 (`object-cover`).
- [ ] Format nilai uang menggunakan lokalisasi IDR (`Rp XX.XXX`) *tanpa* desimal.
- [ ] Border dan radius menggunakan token yang tepat (`rounded-md`, `rounded-lg`).
- [ ] Form Input dan Tabel merespon pada interaksi *hover/focus/error*.
- [ ] Halaman invoice (`S08`) mendukung fitur cetak yang bersih (*media print CSS*).
- [ ] Responsivitas teruji untuk ukuran `390px` (Mobile) dan `1024px+` (Desktop).
- [ ] Tidak ada fitur ekstensi/tambahan seperti login sosial, chat, rating, dll yang melanggar batasan PRD.
