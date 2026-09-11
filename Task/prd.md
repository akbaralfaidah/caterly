# Caterly — Product Requirements Document

Versi: 1.0  
Tanggal: 11 September 2026  
Bahasa produk: Indonesia  
Status: baseline implementasi hasil diskusi; nilai default yang belum diberikan pengguna dicatat sebagai asumsi.  
Dokumen pendamping: `stitch-prompts.md`, `logo-caterly.webp`, `favicon-caterly.webp`.

## 1. Ringkasan dan tujuan

Caterly adalah marketplace katering makan siang untuk kantor. PIC kantor mencari katering berdasarkan wilayah, tanggal, dan jumlah porsi; memilih menu; membuat pesanan; dan mengakses invoice. Merchant mengelola profil, menu, kapasitas, pesanan, produksi harian, dan invoice.

Pengalaman inti harus menjawab empat pertanyaan: siapa yang dapat melayani kantor ini, apakah tersedia pada tanggal yang dibutuhkan, berapa biaya akhirnya, dan bagaimana perkembangan pesanannya.

Keberhasilan versi pertama dinilai melalui alur yang berjalan dari registrasi sampai pesanan selesai, ketepatan data transaksi, pembatasan akses antar-akun, serta antarmuka desktop dan ponsel yang mudah dipakai. Angka pertumbuhan atau konversi bisnis belum ditetapkan karena belum tersedia data pengguna nyata.

## 2. Sumber dan batasan pengerjaan

### 2.1 Sumber utama

1. `1. Ketentuan Pengerjaan Tes Kemampuan Bidang.pdf`, satu halaman: Laravel wajib; tidak memakai builder seperti Filament atau library pembuat CRUD otomatis; kode asli, ditulis sendiri, tidak menyalin template atau pihak lain; riset diizinkan tetapi bantuan orang lain/komunitas dilarang; hasil dipertanggungjawabkan saat interview; repository GitHub harus dapat diakses penilai. Tenggat mengikuti briefing Google Meet.
2. `2. Soal Programming(1).pdf`, satu halaman: dua portal, merchant dan kantor; autentikasi; profil merchant; CRUD menu dengan deskripsi/foto/harga; pencarian; pembelian berdasarkan menu/porsi/tanggal; invoice bersama; keamanan, penanganan error, UI intuitif dan responsif; sertakan kode dan file SQL. Penambahan kebutuhan diperbolehkan.
3. Keputusan pengguna: nama Caterly, backend Laravel, latar putih, warna mengikuti logo, desain khusus, rancangan melalui Stitch, dan dokumen untuk Antigravity.

### 2.2 Ketentuan untuk penggunaan dokumen

Dokumen ini adalah spesifikasi perencanaan, bukan pernyataan bahwa penggunaan AI telah disetujui penyelenggara. PDF tidak secara eksplisit menjelaskan bantuan AI untuk desain atau pemrograman. Jika digunakan sebagai tes rekrutmen, ikuti batas bantuan yang dijelaskan penyelenggara; jangan mengklaim kode hasil generasi sebagai kode yang ditulis sendiri. Jangan menyalin ekspor kode Stitch ke hasil tes dengan menganggapnya otomatis sesuai aturan.

Jangan memakai Filament, Backpack, Nova, generator CRUD, template dashboard jadi, atau starter kit yang menyalin fitur autentikasi/aplikasi lengkap. Framework dan alat build dalam stack tidak menggantikan implementasi fitur aplikasi. Implementasi autentikasi menggunakan fasilitas keamanan bawaan Laravel; jangan membuat algoritma password sendiri.

### 2.3 Batas cakupan

- Dua role: `customer` dan `merchant`. Pengunjung dapat melihat katalog publik.
- Satu akun mewakili satu kantor atau satu merchant. Banyak staf dalam satu perusahaan belum masuk versi pertama.
- Satu order = satu merchant + satu tanggal + satu alamat + satu slot makan siang, dengan banyak item menu.
- Mata uang IDR; nominal disimpan sebagai integer rupiah, bukan floating point.
- Pembayaran transfer manual langsung ke merchant; Caterly tidak menahan dana.
- Tidak ada akun admin platform, kurir, payment gateway, wallet, refund otomatis, chat realtime, langganan otomatis, kupon, ulasan, atau peta pelacakan langsung pada rilis ini.
- Tidak menambah fitur berlabel AI. Fokus pada kebutuhan kantor dan dapur katering.

## 3. Keputusan dan asumsi baseline

| ID | Keputusan / asumsi | Dampak implementasi |
|---|---|---|
| D01 | Laravel + React + TypeScript + Inertia + Tailwind + MySQL | Satu aplikasi dan repository; tidak membuat Next.js/API frontend terpisah |
| D02 | Dua role, satu akun per perusahaan | Tidak ada undangan anggota atau pilihan ganti role setelah registrasi |
| D03 | Wilayah layanan tingkat kota/kabupaten | Pilihan wilayah dari referensi database; tidak memakai radius GPS |
| D04 | Zona waktu operasional `Asia/Jakarta` | Simpan timestamp UTC; tanggal pengiriman adalah tanggal bisnis WIB; tampilkan WIB |
| D05 | Minimum order default 10 porsi per merchant | Dapat diubah merchant menjadi integer positif; jumlah dihitung dari seluruh item order |
| D06 | Kapasitas default merchant 100 porsi/hari | Merchant wajib meninjau sebelum menerbitkan profil; dapat diubah per tanggal |
| D07 | Batas pesan pukul 16.00 WIB satu hari sebelum pengiriman | Nilai global rilis awal; tanggal hari ini dan masa lalu tidak dapat dipilih |
| D08 | Slot pengiriman tunggal 11.00–12.00 WIB | Bukan estimasi GPS; ditampilkan sebelum checkout dan disimpan di order |
| D09 | Merchant punya waktu maksimal 2 jam untuk menerima pesanan | Kedaluwarsa pada waktu paling awal antara `created_at + 2 jam` dan batas pesan |
| D10 | Ongkir tetap per wilayah layanan merchant | Tidak bergantung jumlah item; tampil jelas sebelum checkout |
| D11 | Pajak/diskon/platform fee belum dimodelkan | Total = subtotal + ongkir; tidak menampilkan klaim invoice pajak |
| D12 | Bukti pembayaran diunggah setelah merchant menerima | Menghindari pembayaran untuk pesanan yang masih bisa ditolak/kedaluwarsa |
| D13 | Invoice HTML dengan stylesheet cetak A4 | Tombol “Cetak / Simpan PDF” menggunakan dialog cetak browser; tidak menjanjikan unduhan PDF server |
| D14 | Notifikasi dalam aplikasi | Email, WhatsApp otomatis, dan websocket ditunda |
| D15 | Batas pemesanan 30 hari ke depan, inklusif | Batas global yang dapat dikonfigurasi; konsisten pada pencarian dan checkout |

Nilai default di atas adalah keputusan produk untuk menutup detail yang tidak disebut soal, bukan ketentuan tambahan dari penyelenggara. Tenggat, hosting, domain, rekening nyata, dan cakupan wilayah produksi belum diberikan. Lanjutkan pengembangan lokal tanpa mengarang data tersebut.

## 4. Stack dan struktur aplikasi

### 4.1 Teknologi

| Bagian | Pilihan |
|---|---|
| Backend | Laravel versi stabil yang kompatibel dengan PHP dan lingkungan pengerjaan |
| Frontend | React + TypeScript, Inertia; versi saling kompatibel |
| Build/styling | Vite + Tailwind CSS; desain komponen khusus |
| Database | MySQL dengan InnoDB, foreign key, indeks dan transaksi |
| Autentikasi | Session/cookie Laravel, hashing bawaan, CSRF, rate limiting |
| Otorisasi | Middleware role + Laravel Policies untuk kepemilikan resource |
| Upload | Disk publik untuk foto menu; disk privat untuk bukti pembayaran |
| Scheduler | Laravel scheduler untuk kedaluwarsa; pemeriksaan sinkron sebagai pengaman |
| Notifikasi | Laravel database notifications atau tabel setara dengan perilaku teruji |
| Pengujian | Fasilitas pengujian Laravel; pengujian transaksi kritis pada MySQL |

Periksa versi di lingkungan sebelum memilih dependensi; kunci hasil pilihan dalam lockfile dan catat kebutuhan PHP/Node/MySQL pada README. Jangan mengganti stack menjadi Supabase/Firebase tanpa perubahan keputusan pengguna. Jangan memakai starter kit aplikasi jadi. Jangan memulai proyek Sites atau framework lain hanya karena alatnya tersedia.

### 4.2 Pembagian tanggung jawab

- Controller tipis: menerima request, memanggil aturan aplikasi, mengembalikan respons Inertia.
- Form Request: validasi input, termasuk tipe, batas panjang, tanggal, jumlah dan upload.
- Policy: akses milik sendiri; ID yang tidak berhak diakses tidak membocorkan data.
- Service/action terfokus: checkout, reservasi kapasitas, perubahan status, pembayaran dan invoice.
- Model/Eloquent: relasi, query scope, casting dan persistensi.
- React: menampilkan data server dan interaksi form; bukan sumber kebenaran harga, role atau status.
- Shared component: field, button, status badge, table, dialog, empty state, pagination dan toast.
- Hindari abstraksi generik berlebihan; tidak membutuhkan microservice, CQRS, event sourcing atau repository untuk setiap model.

## 5. Pengguna, akses, dan navigasi

| Aktor | Dapat melakukan | Tidak dapat melakukan |
|---|---|---|
| Pengunjung | Jelajah merchant/menu terbit, pencarian, registrasi/login | Checkout, invoice, data privat merchant/kantor |
| Customer | Kelola profil/alamat sendiri; checkout; lihat order/invoice sendiri; upload pembayaran; konfirmasi penerimaan; pesan ulang | CRUD menu, lihat pembeli lain, konfirmasi pembayaran sendiri |
| Merchant | Kelola profil/menu/kapasitas sendiri; lihat order yang ditujukan kepadanya; status operasional; verifikasi pembayaran; invoice dan rekap produksi sendiri | Memesan sebagai customer, melihat order merchant lain, mengubah nominal transaksi lama |

Navigasi customer: Cari Katering, Pesanan, Invoice, Profil Kantor. Alamat berada di Profil Kantor. Keranjang dan notifikasi di header.

Navigasi merchant: Ringkasan, Menu, Pesanan, Jadwal & Kapasitas, Invoice, Profil Usaha. Rekap produksi ada pada Ringkasan dengan tautan tampilan penuh yang dapat dicetak. Notifikasi di header.

Di mobile, customer memakai header ringkas dan navigasi bawah maksimal empat tujuan; keranjang berupa tombol kontekstual. Merchant memakai header dan drawer navigasi yang dapat diakses keyboard. Logout mudah ditemukan pada menu akun.

## 6. Matriks persyaratan

P0 adalah cakupan soal dan integritas transaksi yang wajib. P1 adalah pengembangan terpilih dalam baseline rilis ini. Kerjakan P0 dahulu, kemudian P1. Jangan menandai rilis lengkap jika P1 belum selesai; jika tenggat kemudian menuntut pengurangan, catat perubahan cakupan secara eksplisit.

| ID | Prioritas | Kebutuhan | Bukti penerimaan utama |
|---|---|---|---|
| FR01 | P0 | Registrasi/login/logout kedua role | Email unik, session aman, role tetap, redirect sesuai role |
| FR02 | P0 | Profil merchant | Nama, alamat, kontak, deskripsi tersimpan dan tampil di profil publik |
| FR03 | P0 | CRUD menu | Nama/deskripsi/foto/harga wajib; hanya pemilik dapat mengubah |
| FR04 | P0 | Pencarian merchant | Nama, lokasi dan jenis makanan; filter dapat digabung; pagination |
| FR05 | P0 | Keranjang dan checkout | Menu, jumlah, tanggal dan alamat valid; total dihitung ulang server |
| FR06 | P0 | Daftar/detail pesanan | Merchant dan customer melihat transaksi relevan dengan data identik |
| FR07 | P0 | Invoice bersama | Satu invoice per order, nomor unik, snapshot, akses terbatas, cetak A4 |
| FR08 | P0 | Error dan keamanan | Validasi field, akses resource, upload aman dan penanganan gagal yang jelas |
| FR09 | P1 | Profil kantor dan alamat | PIC, kontak, alamat default; perubahan alamat tidak mengubah order lama |
| FR10 | P1 | Layanan dan ketersediaan | Area/ongkir, minimum, hari kerja, tanggal tutup dan kapasitas |
| FR11 | P1 | Reservasi kapasitas | Tidak overbooking pada dua checkout bersamaan; kedaluwarsa melepas reservasi |
| FR12 | P1 | Status operasional | Transisi sesuai matriks, alasan penolakan/pembatalan tercatat |
| FR13 | P1 | Pembayaran manual | Bukti privat, review merchant, revisi bukti ditolak, status terpisah |
| FR14 | P1 | Rekap produksi | Total per menu dan per kantor untuk tanggal pilihan, tanpa hitung ganda |
| FR15 | P1 | Pesan ulang | Membentuk keranjang baru dengan harga/ketersediaan terbaru dan peringatan perubahan |
| FR16 | P1 | Notifikasi | Penerima tepat, hanya akses miliknya, dapat ditandai dibaca |

## 7. Spesifikasi fitur

### 7.1 Registrasi dan profil

- Halaman registrasi meminta pilihan “Saya mewakili kantor” atau “Saya penyedia katering”, nama perusahaan, nama PIC, email, nomor telepon, password dan konfirmasi.
- Email dinormalisasi untuk pemeriksaan keunikan. Password minimal 12 karakter; izinkan paste dan password manager. Tidak menambahkan aturan komposisi yang tidak diperlukan.
- Login menggunakan email/password; error tidak mengungkap apakah email terdaftar. Batasi percobaan login. Regenerasi session sesudah login; invalidasi session saat logout.
- Merchant baru berstatus draft sampai profil, wilayah layanan, rekening, jadwal, kapasitas dan minimal satu menu aktif lengkap. Merchant dapat menerbitkan sendiri; tidak ada klaim sudah diverifikasi admin.
- Rekening merchant berisi bank, nama pemilik dan nomor rekening. Simpan snapshot instruksi pembayaran pada order saat dibuat.
- Customer melengkapi alamat dan PIC sebelum checkout. Satu alamat terdiri dari label, penerima, telepon, wilayah kota/kabupaten, alamat rinci dan catatan lokasi opsional.
- Tidak ada self-service forgot password di baseline. Jangan menampilkan tautan yang tidak bekerja. Fitur ini boleh ditambah kemudian dengan alur email yang sungguh berfungsi.

### 7.2 Menu

- Field: nama maksimal 100 karakter, deskripsi maksimal 1.000, satu foto, kategori jenis makanan, harga integer positif, status aktif/nonaktif.
- Kategori makanan berupa referensi terkontrol, contoh Nasi Box, Menu Nusantara, Vegetarian; jangan menambahkan label sertifikasi halal tanpa data pendukung.
- Foto: JPEG/PNG/WebP maksimal 3 MB. Periksa MIME dan isi gambar, simpan dengan nama acak. SVG dan file executable tidak diterima.
- Harga aktif dibatasi maksimum Rp10.000.000 per porsi sebagai batas validasi aplikasi; jumlah item maksimum 10.000 porsi dan tetap harus lolos kapasitas.
- Menu dapat dihapus dari katalog dengan soft delete. Order item memakai snapshot sehingga riwayat tetap lengkap.
- Nonaktif/hapus/harga baru tidak boleh diam-diam mengubah order yang sudah dibuat. Perubahan memengaruhi checkout baru.
- Preview foto, konfirmasi penghapusan, validasi dekat field, dan peringatan perubahan form yang belum disimpan.

### 7.3 Pencarian dan profil publik

- Input utama: wilayah kantor, tanggal pengiriman, jumlah porsi. Pengunjung boleh menjelajah tanpa seluruh input, tetapi hasil tidak boleh mengklaim tersedia sebelum konteks lengkap.
- Filter: nama merchant, kategori makanan, anggaran maksimum per porsi. Sort: relevansi nama sederhana/default, harga menu termurah naik/turun, nama A–Z. Tidak ada sort “terpopuler” tanpa data.
- Lokasi berarti merchant melayani wilayah pengiriman itu, bukan sekadar alamat usaha berada di sana.
- Harga “mulai dari” menggunakan menu aktif yang cocok filter. Minimum order dan ongkir disajikan terpisah; jangan menyebut harga termurah sebagai total order.
- Kapasitas pada hasil adalah indikasi saat diperiksa; validasi final di checkout.
- Default 12 merchant per halaman. Simpan filter dalam query string dan pertahankan saat kembali dari detail.
- Profil merchant: identitas, deskripsi, area layanan, jadwal, minimum porsi, slot pengiriman, kategori dan daftar menu aktif.
- Jika tidak tersedia: jelaskan sebab relevan, misalnya tutup, melewati batas pesan, atau kapasitas kurang; tawarkan ganti tanggal/filter.

### 7.4 Keranjang

- Keranjang tersimpan server per customer untuk mempertahankan isi setelah refresh/login ulang. Pengunjung diarahkan login sebelum menambahkan; kembalikan ke halaman asal setelah login.
- Satu keranjang aktif per customer dan hanya satu merchant. Menambah merchant lain memunculkan pilihan batal atau ganti keranjang; jangan menghapus tanpa konfirmasi.
- Satu menu hanya satu baris; penambahan menaikkan kuantitas.
- Keranjang memuat tanggal, wilayah, menu, porsi, subtotal perkiraan dan minimum order. Tidak menahan kapasitas.
- Harga/ketersediaan selalu diperiksa ulang sebelum checkout. Perubahan harga ditampilkan dan membutuhkan konfirmasi ulang pada ringkasan terbaru.
- Tombol tidak cukup dinonaktifkan: alasan minimum belum tercapai/tanggal tidak tersedia harus terlihat.

### 7.5 Checkout

1. Pilih alamat milik customer; wilayah harus dilayani merchant.
2. Tinjau tanggal dan slot; tidak boleh melewati cutoff atau horizon 30 hari.
3. Tinjau item, jumlah total porsi, minimum order, subtotal dan ongkir.
4. Catatan pesanan opsional maksimal 500 karakter; bukan janji bahwa kebutuhan alergi dapat dipenuhi.
5. Server memeriksa versi ringkasan checkout, harga, status menu, merchant, kapasitas dan ongkir.
6. Dalam satu transaksi database: simpan order, item snapshot, invoice, reservasi dan event awal. Gagal salah satu berarti rollback seluruhnya.
7. Tampilkan nomor order dan invoice, status “Menunggu konfirmasi”, serta tenggat merchant untuk merespons. Pembayaran belum dapat dilakukan.

Gunakan token idempotensi unik milik customer: double click, retry jaringan atau request paralel dengan token sama menghasilkan order yang sama. Token sama dengan payload berbeda ditolak sebagai konflik. Penghitungan total, invoice dan kapasitas tidak boleh bergantung input nominal dari browser.

### 7.6 Pesanan dan invoice

- Daftar pesanan: nomor, pihak lawan, tanggal pengiriman, jumlah porsi, total, status order, status pembayaran. Pencarian nomor/nama pihak lawan; filter tanggal dan status; pagination 20 baris.
- Detail: timeline aktual, alamat/PIC snapshot, item, instruksi pembayaran, biaya, catatan, invoice dan tindakan yang sah.
- Invoice: nomor `INV-YYYYMMDD-XXXXXX` dan nomor order `CTR-YYYYMMDD-XXXXXX`; suffix unik yang tidak didapat dari `count + 1`. Tanggal mengikuti WIB; unique constraint wajib.
- Isi invoice: snapshot identitas merchant/kantor, nomor/tanggal terbit, order, tanggal/slot pengiriman, alamat penerima, item/harga/jumlah, subtotal, ongkir, total IDR, instruksi transfer dan status pembayaran.
- Satu invoice diterbitkan saat order dibuat. Nominal dan identitas snapshot immutable. Status invoice boleh berubah menjadi void ketika order ditolak/dibatalkan/kedaluwarsa; dokumen tidak dihapus.
- Invoice merupakan dokumen tagihan aplikasi; tidak mengklaim sebagai faktur pajak atau bukti lunas saat belum dikonfirmasi.
- Halaman print menghilangkan navigasi/tombol, menjaga tabel tidak terpotong secara tidak masuk akal dan mengulang header tabel bila multi-halaman.

### 7.7 Jadwal dan kapasitas

- Merchant menetapkan hari operasional mingguan dan kapasitas default; override per tanggal boleh menutup tanggal atau mengganti kapasitas.
- Kapasitas berlaku total semua menu pada satu tanggal. Tidak membuat stok terpisah per menu dalam rilis ini.
- `reserved_portions` mencakup pending yang belum expired, accepted, preparing, delivering, completed. Completed tetap memakai kapasitas pada tanggal pengiriman tersebut.
- Reject/cancel/expire melepas reservasi tepat sekali. Tidak boleh ada angka kapasitas negatif atau lebih besar dari kapasitas maksimum.
- Update kapasitas di bawah porsi terpesan aktif ditolak. Menutup tanggal/hari atau menonaktifkan layanan harus tidak membatalkan komitmen lama; jika membuat jadwal bertentangan dengan reservasi masa depan, tolak perubahan dan jelaskan tanggal terdampak.
- Untuk jadwal mingguan, validasi seluruh tanggal masa depan dengan reservasi; jadwal baru diterapkan ke baris kapasitas yang belum memiliki komitmen. Jangan biarkan dua sumber kapasitas berbeda saling bertentangan.
- Tabel kapasitas per merchant/tanggal mempunyai unique constraint. Gunakan row lock pada baris tersebut saat reservasi/perubahan/release. Inisialisasi baris harus aman terhadap race condition melalui insert/upsert dan penanganan unique conflict.
- Checkout dan update kapasitas memakai urutan locking yang sama. Scheduler bukan satu-satunya pelindung: checkout membersihkan hold expired untuk tanggal terkait, dan accept memeriksa `expires_at` kembali dalam transaksi.
- Scheduler memproses pending expired minimal setiap menit. Saat belum ada scheduler lokal, README menyediakan perintah menjalankannya; request tetap tidak dapat menerima order expired.

### 7.8 Pembayaran manual

- Instruksi transfer aktif hanya setelah order diterima. Sebelum itu tampil “Tunggu konfirmasi katering sebelum melakukan pembayaran”.
- Customer mengunggah JPG/PNG/WebP atau PDF maksimal 5 MB. MIME/isi diperiksa; file di disk privat, akses unduh via controller ber-policy, `nosniff`, disposition aman.
- Satu pengajuan menunggu review per order. Riwayat bukti lama tetap tersedia untuk audit kepada pemilik order dan merchant terkait.
- Merchant melihat bukti dan mengonfirmasi hanya setelah pengecekan mutasi secara manual. Bukti gambar sendiri bukan verifikasi bank otomatis.
- Jika ditolak, alasan wajib, customer dapat mengunggah ulang. Tidak ada penolakan merchant terhadap bukti yang sudah berstatus approved.
- Hanya order accepted yang dapat mengajukan pembayaran. Persiapan dimulai setelah pembayaran berstatus paid.
- Tidak menyediakan refund atau perubahan status paid kembali ke unpaid. Jika order sudah paid, pembatalan melalui aplikasi tidak tersedia dalam versi ini; keterbatasan ini dijelaskan pada checkout dan detail, tanpa mengklaim sebagai kebijakan hukum refund.

### 7.9 Produksi, pesan ulang, notifikasi

- Ringkasan merchant: pesanan perlu konfirmasi, bukti menunggu review, dan total porsi produksi tanggal pilihan.
- Rekap dapur memuat accepted+paid, preparing, delivering dan completed pada tanggal itu; completed ditandai sudah selesai. Pending/unpaid/terminal gagal tidak masuk produksi. Label angka menyebut lingkupnya.
- Agregasi produksi menggunakan snapshot nama menu/harga dari item; grouping berdasarkan identitas menu dan snapshot nama agar menu yang berganti nama tidak tercampur tanpa penjelasan. Tampilkan rincian kantor/PIC/porsi/alamat.
- Pesan ulang dapat dimulai dari order completed; buat keranjang baru hanya setelah konfirmasi jika ada keranjang aktif. Harga terbaru, menu aktif, kapasitas dan tanggal baru wajib diperiksa. Item yang dihapus ditandai tidak tersedia, tidak diganti otomatis.
- Notifikasi peristiwa: order baru ke merchant; accepted/rejected/expired ke customer; cancelled ke pihak lawan; bukti baru ke merchant; paid/rejected proof ke customer; delivering ke customer; completed ke merchant.
- Notifikasi dicatat setelah transaksi berhasil; retry tidak menghasilkan duplikat untuk event yang sama. Klik membawa ke detail yang tetap memeriksa akses. Tidak mengirim email/WhatsApp pada baseline.

## 8. Mesin status dan aturan transisi

### 8.1 Status order

| Dari | Ke | Aktor | Syarat dan dampak |
|---|---|---|---|
| — | pending_confirmation | Customer | Checkout sah; tahan kapasitas; invoice issued; payment unpaid |
| pending_confirmation | accepted | Merchant pemilik | Belum expires_at; pembayaran mulai tersedia; kapasitas tetap ditahan |
| pending_confirmation | rejected | Merchant pemilik | Belum expires_at; alasan wajib; release kapasitas; invoice void |
| pending_confirmation | cancelled | Customer pemilik | Belum expires_at; alasan opsional; release kapasitas; invoice void |
| pending_confirmation | expired | Sistem | `now >= expires_at`; release kapasitas; invoice void |
| accepted | cancelled | Merchant pemilik | Payment unpaid dan tidak ada bukti pending review; alasan wajib; release; invoice void |
| accepted | preparing | Merchant pemilik | Payment paid; pada atau setelah tanggal pengiriman; catat keterlambatan bila ada |
| preparing | delivering | Merchant pemilik | Pada atau setelah tanggal pengiriman; catat waktu |
| delivering | completed | Customer pemilik | Konfirmasi makanan diterima; catat waktu |

Customer tidak dapat membatalkan setelah accepted. Merchant tidak dapat membatalkan accepted ketika ada bukti pending review atau pembayaran paid. Penolakan bukti mengembalikan status pembayaran ke unpaid dan memungkinkan pembatalan accepted oleh merchant. Tidak ada transisi balik; terminal gagal tidak dapat dihidupkan lagi. Pengiriman yang terlambat tetap dapat diselesaikan customer setelah tanggal pengiriman, tetapi preparing/delivering yang terlambat perlu tetap bisa dicatat: izinkan pada atau setelah tanggal pengiriman dan tampilkan indikator terlambat. Tindakan sebelum tanggal pengiriman ditolak.

### 8.2 Status pembayaran dan invoice

| Entitas | Status | Arti |
|---|---|---|
| Payment | unpaid | Belum ada bukti aktif / bukti sebelumnya ditolak |
| Payment | pending_review | Bukti sedang ditinjau merchant |
| Payment | paid | Merchant mengonfirmasi penerimaan dana |
| Proof | submitted / approved / rejected | Riwayat pengajuan dengan waktu dan reviewer |
| Invoice | issued / void | Tagihan aktif atau dibatalkan; lunas ditampilkan dari status payment |

Upload sah: unpaid -> pending_review. Merchant approve: pending_review -> paid. Merchant reject: pending_review -> unpaid dengan proof rejected. Semua transisi memakai transaksi dan lock order; request status usang harus mendapat error konflik tanpa menulis event ganda. Order terminal gagal tidak menerima upload, review atau pembayaran baru.

## 9. Model data konseptual

Seluruh tabel aplikasi memiliki primary key dan timestamp yang sesuai. Nama tabel boleh disesuaikan secara konsisten, tetapi relasi dan invariant berikut wajib dipertahankan.

| Tabel | Field inti / relasi |
|---|---|
| users | name, email unique, password, role enum customer/merchant |
| merchant_profiles | user_id unique FK, company_name, address, contact, description, publication_status, minimum_portions, default_daily_capacity, bank fields |
| customer_profiles | user_id unique FK, company_name, pic_name, phone |
| regions | code unique, city_name, province_name; data referensi lokal |
| merchant_service_areas | merchant_id FK, region_id FK, delivery_fee; unique pasangan |
| merchant_operating_days | merchant_id FK, weekday, is_open; unique pasangan |
| merchant_date_capacities | merchant_id FK, delivery_date, capacity, reserved_portions, is_closed, is_override; unique merchant/date |
| categories | name, slug unique |
| menus | merchant_id FK, category_id FK, name, description, image_path, price_idr, is_active, deleted_at |
| customer_addresses | customer_id FK, region_id FK, label, receiver, phone, address, notes, is_default |
| carts | customer_id unique FK, merchant_id FK nullable, delivery_date, region_id |
| cart_items | cart_id FK, menu_id FK, quantity; unique cart/menu |
| orders | public_id/order_number unique, customer_id FK, merchant_id FK, region_id FK, delivery_date, slot snapshot, order_status, payment_status, portions, subtotal_idr, delivery_fee_idr, total_idr, expires_at, notes, identity/address/bank snapshots, idempotency_key, request_fingerprint |
| order_items | order_id FK, menu_id FK nullable, menu_name_snapshot, category_snapshot, unit_price_idr, quantity, line_total_idr |
| capacity_reservations | order_id unique FK, capacity_date_id FK, portions, released_at nullable; release idempotent |
| invoices | order_id unique FK, invoice_number unique, issued_at, status, voided_at; memakai snapshot immutable order/items |
| payment_proofs | order_id FK, storage_path private, mime_type, status, submitted_by, reviewed_by nullable, reviewed_at, rejection_reason |
| order_status_events | order_id FK, from_status, to_status, actor_id nullable, reason, event_key unique, created_at |
| notifications | recipient user, type, resource_id, event_key, payload minimum, read_at; dedup penerima/event |

### 9.1 Integritas dan indeks

- Unique `(customer_id, idempotency_key)`; request_fingerprint memverifikasi payload retry.
- Unique order/invoice number; invoice satu-ke-satu order; reservation satu-ke-satu order.
- Index order `(merchant_id, delivery_date, order_status)`, `(customer_id, created_at)`, `(order_status, expires_at)`.
- Index menu `(merchant_id, is_active, category_id)` dan layanan `(region_id, merchant_id)`.
- Nominal/jumlah nonnegatif; quantity > 0; line total = unit price × quantity; total = sum(line total) + ongkir.
- Tidak cascade delete order/invoice ketika menu atau profil berubah. User deletion bukan fitur baseline.
- Semua perubahan default address dilakukan transaksi agar tepat satu alamat default untuk customer yang memiliki alamat.
- `reserved_portions` hanya diubah melalui operasi reservasi/release dalam transaksi. Sediakan pemeriksaan rekonsiliasi terhadap reservation aktif untuk mendeteksi bug; jangan menulis ulang counter diam-diam.
- Foreign key menu pada order_items dapat dipertahankan dengan soft delete. Snapshot tetap sumber isi historis.

## 10. Halaman dan tindakan utama

| ID layar | Halaman | Isi/tindakan utama |
|---|---|---|
| S01 | Jelajah publik/customer | Search wilayah/tanggal/porsi, filter, hasil merchant, pagination |
| S02 | Login | Email/password, pesan error, tautan registrasi |
| S03 | Registrasi | Pemilihan role dan form perusahaan/PIC |
| S04 | Detail merchant | Profil, ketentuan order, menu, quantity, ringkasan keranjang |
| S05 | Keranjang & checkout | Item, alamat, tanggal, biaya, catatan, konfirmasi |
| S06 | Pesanan customer | Tabel/filter, tautan detail |
| S07 | Detail pesanan bersama | Snapshot transaksi, timeline, tindakan sesuai role/status |
| S08 | Invoice | Daftar invoice + dokumen detail/print |
| S09 | Profil kantor & alamat | Edit profil, tambah/edit/hapus alamat/default |
| S10 | Ringkasan merchant | Antrean tindakan, produksi tanggal pilihan |
| S11 | Pengelolaan menu | Daftar, tambah/edit, aktif/nonaktif, hapus |
| S12 | Pesanan merchant | Antrean, filter, detail, terima/tolak/status |
| S13 | Jadwal & kapasitas | Jadwal mingguan, tabel tanggal, override, kapasitas tersisa |
| S14 | Profil usaha | Identitas, layanan/ongkir, minimum, rekening, publikasi |
| S15 | Bukti pembayaran | Upload customer dan review merchant sebagai bagian detail order |
| S16 | Rekap produksi | Agregasi menu + pengiriman per kantor + cetak |
| S17 | Notifikasi | Panel/halaman list, unread, tandai dibaca |

Route names disarankan konsisten seperti `marketplace.index`, `merchants.show`, `customer.orders.*`, `merchant.orders.*`, `invoices.show/print`. Invoice bukan route publik. Semua mutasi menggunakan POST/PATCH/DELETE yang dilindungi CSRF; GET tidak mengubah status bisnis.

## 11. Design system dan pengalaman pengguna

### 11.1 Identitas

- Gunakan logo asli yang disediakan. Wordmark di header dan invoice; favicon untuk browser atau navigasi sempit. Pertahankan rasio; jangan menggambar ulang, mengubah warna, atau menambah slogan ke file logo.
- Background utama putih. Perkiraan warna sampel logo: hijau `#016039`, oranye `#F48317`, teks gelap `#11171E`.
- Tokens: surface `#F6F8F7`, border `#E4E9E6`, text secondary `#55635B`, green tint `#EDF5F0`, orange tint `#FFF3E6`. Error memakai warna merah semantik terpisah dan teks, tidak dicampur dengan oranye brand.
- Tombol utama hijau dengan teks putih; aksen oranye menggunakan teks gelap bila relevan. Periksa kontras pasangan warna final.
- Font usulan Manrope dengan fallback system sans-serif. Jika font tidak tersedia, gunakan system; tidak boleh merusak layout atau memerlukan jaringan agar terbaca.
- Body 14–16 px, heading halaman 24–32 px, line-height 1.45–1.6. Label di atas field. Angka harga mudah dibandingkan dan sejajar kanan pada tabel.
- Spacing berbasis 4/8 px; radius field/button 8 px dan card 12 px. Border ringan, shadow hanya saat membantu hierarki/lapisan.

### 11.2 Karakter visual

Antarmuka terasa seperti layanan katering kantor yang rapi: foto makanan nyata, ruang putih, informasi harga/jadwal yang jelas, dan komposisi yang mengikuti tugas pengguna. Hindari gradient dekoratif, glassmorphism, blob/mesh background, emoji sebagai ikon aplikasi, kartu statistik raksasa, efek glow, chart tanpa kebutuhan, atau template dashboard generik.

Marketplace: header ringkas, search kontekstual, filter desktop di kiri, hasil dengan foto makanan rasio 4:3. Merchant: sidebar desktop sekitar 232 px, header tindakan dan tabel kerja. Checkout: ringkasan biaya sticky desktop; mobile satu kolom dengan tombol akhir yang tidak menutupi isi. Invoice: gaya dokumen cetak, bukan kartu dashboard.

Ikon garis satu gaya, ukuran 18–20 px dengan label jelas untuk tindakan penting. Foto contoh harus aset yang hak pakainya jelas; seed menandainya sebagai data demo. Jangan menciptakan rating, jumlah pelanggan, sertifikasi, diskon, atau badge verifikasi tanpa sumber data aplikasi.

### 11.3 Aksesibilitas dan responsivitas

- Target desktop 1440 px, tablet 768 px, mobile 390 px; tetap berfungsi pada lebar 360 px.
- Kontras teks normal minimal 4,5:1; komponen/focus yang relevan minimal 3:1. Status memakai teks selain warna.
- Semua kontrol keyboard-accessible, focus terlihat, dialog menjaga focus dan mengembalikannya saat ditutup; Escape menutup dialog non-destruktif.
- Label field, error terhubung ke input, live region untuk status submit, alt text foto bermakna.
- Area sentuh minimal 44 × 44 px. Pada zoom 200%, tindakan utama tidak hilang.
- Tabel mobile dapat menjadi list berlabel; bila scroll horizontal perlu, hanya area tabel yang scroll, bukan seluruh halaman.
- Tombol submit menampilkan loading, mencegah klik ganda di UI, dan tetap dilindungi idempotensi backend.
- Empty state menjelaskan tindakan berikutnya. Error jaringan mempertahankan isian. Sukses ditunjukkan oleh hasil nyata, bukan toast palsu.
- Respect prefers-reduced-motion. Animasi singkat untuk umpan balik; tidak ada animasi wajib agar transaksi dapat digunakan.

## 12. Data contoh yang konsisten untuk desain dan demo

Semua nama berikut fiktif untuk demo. Jangan memberi badge bahwa usaha nyata sudah diverifikasi.

| Field | Nilai demo |
|---|---|
| Merchant | Dapur Selaras |
| Customer | PT Sinar Karya, PIC Nadia |
| Wilayah | Kota Jambi |
| Menu A | Nasi Ayam Bakar, Rp28.000 × 25 = Rp700.000 |
| Menu B | Nasi Ikan Sambal, Rp30.000 × 15 = Rp450.000 |
| Jumlah | 40 porsi |
| Subtotal | Rp1.150.000 |
| Ongkir | Rp25.000 |
| Total | Rp1.175.000 |
| Minimum | 10 porsi |
| Kapasitas tanggal | 100 porsi; reservasi lain 35; setelah order demo tersisa 25 |
| Slot | 11.00–12.00 WIB |

Mockup statis boleh memakai tanggal 18 September 2026 dan nomor `CTR-20260917-000042` / `INV-20260917-000042`. Pada seed runnable gunakan tanggal relatif besok/lusa agar tidak kedaluwarsa ketika penilai menjalankan. Untuk order demo pending, buat waktu sebelum cutoff dan expiry di masa depan secara konsisten. Data rekening/telepon berupa placeholder demo yang jelas, bukan data pribadi nyata. Seed minimal dua customer dan dua merchant agar isolasi akses dapat diuji.

## 13. Keamanan dan reliabilitas

- Hash password melalui fasilitas Laravel; cookie/session aman, CSRF seluruh mutasi, rate limit login dan upload.
- Server mengambil role dan identitas organisasi dari session; jangan percaya merchant_id/customer_id milik pihak lain dari browser.
- Policy berlaku juga pada invoice print, bukti pembayaran, notifikasi dan endpoint aksi status; menyembunyikan tombol tidak cukup.
- Eloquent/query binding untuk input pencarian; escape output React; tidak render deskripsi sebagai HTML mentah.
- Bukti pembayaran tidak berada pada public storage dan URL tidak dapat ditebak untuk melewati otorisasi.
- Transaksi database dan row locking untuk checkout, kapasitas, perubahan status serta review pembayaran; retry deadlock terbatas dan idempotent.
- Konflik harga/kapasitas/status mengembalikan pesan dapat ditindaklanjuti. Stale request tidak menimpa hasil request lain.
- Secrets hanya di environment; `.env`, bukti pembayaran nyata dan data pribadi tidak masuk repository.
- Log memuat identifier transaksi dan sebab error tanpa password/token/isi bukti. Pesan pengguna tidak menampilkan stack trace.
- Tidak ada ketergantungan pembayaran/email/map eksternal untuk menjalankan demo lokal. Foto dan logo punya fallback saat gagal dimuat.

## 14. Acceptance tests kritis

Gunakan test data deterministik. Uji transaksi/locking pada MySQL karena SQLite tidak merepresentasikan perilaku locking MySQL. Jangan menyatakan pengujian concurrency berhasil hanya dengan dua request berurutan.

| ID | Skenario | Hasil yang wajib |
|---|---|---|
| AT01 | Registrasi dua role; email duplikat; login salah; logout | Role tepat, email unik, error aman, session tidak bisa dipakai sesudah logout |
| AT02 | Customer A membuka order/invoice/bukti Customer B; merchant lain mencoba CRUD menu | Tidak ada data bocor atau perubahan; 403/404 konsisten |
| AT03 | Tambah/edit/hapus menu termasuk upload tidak valid | Validasi jelas; file berbahaya ditolak; snapshot order lama tetap |
| AT04 | Filter wilayah+jenis+tanggal+porsi digabung | Hasil sesuai semua filter; empty state bila tidak ada |
| AT05 | Order demo 25×28.000 + 15×30.000 + 25.000 | Total Rp1.175.000 pada checkout, kedua portal dan invoice |
| AT06 | Browser memalsukan harga, ongkir, role, atau alamat milik akun lain | Server menolak/menghitung sendiri; tidak ada transaksi tidak sah |
| AT07 | Dua checkout benar-benar bersamaan: sisa 50, masing-masing 40 | Tepat satu berhasil; reserved tidak melebihi kapasitas |
| AT08 | Dua submit/retry dengan idempotency key sama | Satu order, satu invoice dan satu reservasi; payload berbeda mendapat konflik |
| AT09 | Gagal setelah simpan order sebelum simpan invoice | Seluruh transaksi rollback; tidak ada order yatim/reservasi bocor |
| AT10 | Pending expired dan merchant mencoba accept; scheduler terlambat | Accept gagal; release tepat sekali; invoice void |
| AT11 | Release dijalankan scheduler dan request bersamaan | Counter berkurang sekali; tidak negatif |
| AT12 | Ubah kapasitas di bawah reserved / tutup hari berkomitmen | Perubahan ditolak dengan penjelasan tanggal/porsi |
| AT13 | Harga/menu/alamat/profil berubah setelah order dibuat | Invoice dan detail historis tidak berubah; checkout baru memakai nilai baru |
| AT14 | Bukti upload sebelum accepted / akses URL privat tanpa hak | Ditolak; tidak ada file privat terbuka |
| AT15 | Proof ditolak, upload ulang, approved; double approve | Riwayat benar; satu paid transition; tidak ada persetujuan ganda |
| AT16 | Preparing sebelum paid; cancel saat proof pending/paid | Ditolak sesuai matriks; tidak ada perubahan kapasitas/status |
| AT17 | Alur accepted→paid→preparing→delivering→completed | Aktor/syarat tepat; timestamp dan timeline benar; dua portal konsisten |
| AT18 | Rekap produksi dengan pending, unpaid, paid, completed, cancelled | Hanya lingkup yang didefinisikan dihitung; item tidak terhitung ganda |
| AT19 | Pesan ulang ketika menu dihapus/harga berubah/keranjang berisi | Peringatan dan konfirmasi; order lama utuh; kapasitas tidak ditahan sebelum checkout |
| AT20 | Print invoice banyak item dan invoice void | A4 terbaca; total utuh; badge/status jelas; navigasi tidak tercetak |
| AT21 | 360/390/768/1440 px, keyboard, focus, dialog, error/loading/empty | Tidak ada aksi penting tertutup, overflow halaman, tombol tanpa label atau fokus hilang |
| AT22 | Fresh setup dari README + SQL/migration | Dua akun demo dapat menyelesaikan alur tanpa credential eksternal |
| AT23 | Tepat cutoff, tengah malam WIB, horizon hari ke-30/31 | Boundary konsisten server/UI; hari ke-31 dan cutoff terlewati ditolak |

## 15. Tahap implementasi dan keluaran

### Tahap 1 — Fondasi

Periksa lingkungan/repository; setup stack, design tokens, layout, schema, autentikasi, role/policy, seed referensi dan profil. Keluaran: dua role login dengan pemisahan akses dan halaman dasar yang sesuai identitas Caterly.

### Tahap 2 — Cakupan utama

Profil merchant, CRUD menu, katalog/filter, profil/alamat customer, keranjang, checkout atomik, order/invoice bersama dan print. Terapkan struktur snapshot/idempotensi sejak awal, bukan patch akhir.

### Tahap 3 — Operasional

Layanan/kapasitas, reservasi dan expiry, transisi status, pembayaran manual privat, produksi, pesan ulang dan notifikasi. Integrasikan pemeriksaan kapasitas sebelum menganggap checkout selesai.

### Tahap 4 — Verifikasi dan serah terima

Uji risiko kritis, responsivitas, aksesibilitas, print dan fresh setup; perbaiki kegagalan; catat hasil aktual serta batasan yang tersisa.

Keluaran proyek yang diperlukan:

- Kode Laravel/React asli sesuai ketentuan yang berlaku, lockfile, migrations dan seeders.
- `.env.example` tanpa rahasia, petunjuk storage publik/privat dan scheduler.
- `database/caterly.sql`: schema dan data demo tersanitasi, bisa diimpor ke database kosong. Dokumentasikan jalur instalasi migration+seed atau SQL sebagai alternatif; jangan menjalankan keduanya sampai data dobel. Pastikan metadata migration sinkron dengan dump.
- README: versi runtime, setup, akun demo, build, run, scheduler, tests, aturan status, asumsi, keterbatasan pembayaran, dan penjelasan keputusan teknis.
- Pengujian otomatis yang bermakna, hasil pengujian aktual, screenshot alur utama dan mobile.
- Repository GitHub yang bisa diakses penilai sesuai PDF. Jangan mengunggah/deploy/mengirim email dari dokumen ini; tindakan eksternal dilakukan hanya ketika diminta pengguna.

Definition of Done: semua FR pada baseline terpenuhi; acceptance kritis lulus; tidak ada tombol dummy; data invoice/order konsisten; isolasi akun terbukti; fresh setup bekerja; SQL tersedia; tidak ada secret/data pribadi; semua keterbatasan nyata dicatat. Dokumentasi harus membedakan implementasi yang sudah diuji dari rencana.

## 16. Instruksi handoff untuk Antigravity

Gunakan bagian berikut sebagai instruksi awal bersama file ini, prompt Stitch, logo dan hasil desain yang dipilih:

> Baca seluruh `prd.md` sebagai sumber kebutuhan Caterly. Baca `stitch-prompts.md` untuk sistem visual dan lihat hasil desain Stitch yang saya lampirkan. Backend harus Laravel, frontend React + TypeScript melalui Inertia, styling Tailwind dan database MySQL. Pertahankan seluruh fitur, business rules, snapshot invoice, otorisasi, idempotensi dan reservasi kapasitas dalam PRD. Jika gambar desain tidak memuat suatu state, PRD tetap menentukan perilakunya. Jika belum ada desain, gunakan design tokens dalam PRD dan komposisi layar yang dijelaskan; jangan meniru template dashboard jadi.
>
> Mulai dengan memeriksa repository dan runtime, lalu tuliskan rencana implementasi singkat yang memetakan tahap terhadap FR/AT. Bila ada kode, pahami dan pertahankan perubahan pengguna sebelum mengedit. Kerjakan tahap secara berurutan sampai baseline selesai, verifikasi alur kritis, dan laporkan hasil nyata. Jangan mengganti stack, menambah role, atau memperluas fitur tanpa kebutuhan. Jangan memakai Filament atau generator CRUD/template aplikasi jadi. Jangan menyalin kode ekspor Stitch. Jangan hardcode hasil transaksi, status pembayaran atau kapasitas. Jangan menandai fitur selesai hanya karena UI-nya tampil.
>
> Perhatikan aturan tes pada bagian 2. Dokumen ini tidak membuktikan bahwa bantuan pemrograman AI diperbolehkan. Penggunaan keluaran untuk tes harus sesuai batas bantuan penyelenggara dan tidak boleh disertai klaim kepenulisan yang tidak benar.

## 17. Referensi teknis

- Laravel frontend/Inertia: https://laravel.com/framework/docs/13.x/frontend — rujukan arsitektur yang diperiksa saat diskusi; bukan instruksi mengunci versi sebelum memeriksa lingkungan.
- Supabase Laravel: https://supabase.com/docs/guides/getting-started/quickstarts/laravel — pembanding, tidak digunakan pada baseline MySQL.
- Firebase model data: https://firebase.google.com/docs/firestore/data-model — pembanding, tidak digunakan pada baseline.
- Stitch: https://stitch.withgoogle.com/ — tempat eksplorasi visual yang dipilih pengguna.

Keputusan scope dan aturan bisnis berasal dari kedua PDF dan diskusi, bukan klaim bahwa dokumentasi teknologi mewajibkan pilihan tersebut.
