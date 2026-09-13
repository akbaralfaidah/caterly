# Caterly

Caterly adalah marketplace katering korporat berbasis Laravel 13, Inertia.js 3, React 19, TypeScript, MySQL, dan Tailwind CSS 4.

## Persyaratan

- PHP 8.3 beserta ekstensi Laravel
- Composer
- Node.js dan npm
- MySQL 8

## Instalasi

~~~bash
composer install
npm install
copy .env.example .env
php artisan key:generate
~~~

Buat database MySQL bernama `caterly`, lalu pilih salah satu cara berikut.

Menggunakan migration dan data demo:

~~~bash
php artisan migrate:fresh --seed
~~~

Atau impor snapshot SQL:

~~~bash
mysql -u root -p caterly < database/caterly.sql
~~~

Jalankan aplikasi:

~~~bash
composer run dev
~~~

Worker scheduler wajib aktif agar order yang melewati batas konfirmasi otomatis menjadi kedaluwarsa dan kapasitasnya dilepas:

~~~bash
php artisan schedule:work
~~~

Untuk production, jalankan `php artisan schedule:run` setiap menit melalui cron.

## Fitur & Status

- Database lokal sudah dimigrasi dan diisi data.
- 5 akun perusahaan lengkap dengan alamat.
- 15 akun katering lengkap dengan profil, rekening, area layanan, kapasitas, dan minimal 5 menu.
- Total tersedia 80 menu demo.
- Katering otomatis difilter berdasarkan alamat perusahaan. Jika perusahaan memiliki beberapa alamat (misal: Jambi dan Jakarta), pilihan area marketplace hanya menampilkan wilayah yang terdaftar.
- Perusahaan tidak dapat menghapus alamat terakhir.
- Bukti pembayaran wajib bernilai minimal DP 50%.
- Katering tidak dapat memproses pesanan sebelum pembayaran diverifikasi.
- Ikon mata tersedia pada password dan konfirmasi password.
- Batas pukul 16.00 sudah dihapus.
- Seluruh test lulus: 24 test, 136 assertion.
- TypeScript dan build produksi berhasil.

## Akun Demo

Password seluruh akun: `CaterlyDemo123!`

### Akun perusahaan

| Perusahaan | Email | Wilayah |
|---|---|---|
| PT Sinar Karya Nusantara | `nadia@caterly.test` | Kota Jambi |
| PT Cakrawala Digital Indonesia | `budi@caterly.test` | Jakarta Pusat |
| PT Arunika Kreatif Mandiri | `sinta@caterly.test` | Jakarta Selatan |
| CV Bandung Teknologi Bersama | `raka@caterly.test` | Kota Bandung |
| PT Surya Timur Logistik | `maya@caterly.test` | Kota Surabaya |

### Akun katering

| Katering | Email | Wilayah | Rekening |
|---|---|---|---|
| Dapur Selaras | `dapur@caterly.test` | Jambi | BCA `0201884101` |
| Sajian Ibu | `sajian@caterly.test` | Jambi | Mandiri `1120018892101` |
| Rasa Batanghari | `batanghari@caterly.test` | Jambi | BRI `020601009887503` |
| Selera Angso Duo | `angsoduo@caterly.test` | Jambi | BNI `1178800421` |
| Dapur Menteng | `menteng@caterly.test` | Jakarta Pusat | BCA `0201884105` |
| Katering Monas | `monas@caterly.test` | Jakarta Pusat | Mandiri `1120018892106` |
| Rasa Kemang | `kemang@caterly.test` | Jakarta Selatan | CIMB Niaga `800118874006` |
| Dapur Cilandak | `cilandak@caterly.test` | Jakarta Selatan | PermataBank `09722188408` |
| Pawon Priangan | `priangan@caterly.test` | Bandung | BJB `0011884209` |
| Dapur Braga | `braga@caterly.test` | Bandung | BCA `0201884110` |
| Sajian Dago | `dago@caterly.test` | Bandung | Mandiri `1120018892111` |
| Katering Parahyangan | `parahyangan@caterly.test` | Bandung | BNI `1178800432` |
| Dapur Tunjungan | `tunjungan@caterly.test` | Surabaya | Bank Jatim `0011884313` |
| Rasa Surabaya | `rasasurabaya@caterly.test` | Surabaya | BRI `020601009887514` |
| Pawon Pahlawan | `pahlawan@caterly.test` | Surabaya | BCA `0201884115` |

*(Data rekening pada akun demo adalah data dummy dan tidak boleh digunakan untuk transfer nyata.)*

## Pemeriksaan

~~~bash
php artisan test --compact
npx tsc --noEmit
npm run build
vendor/bin/pint --format agent
composer audit
npm audit --include=dev
~~~

Bukti pembayaran disimpan pada disk privat `storage/app/private`. File hanya dapat dibuka merchant pemilik order melalui route yang terautentikasi.
