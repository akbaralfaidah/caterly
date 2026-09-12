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

## Akun Demo

Semua akun memakai password `password1234`.

| Peran | Email |
| --- | --- |
| Merchant | `dapur@caterly.test` |
| Merchant | `sajian@caterly.test` |
| Customer | `nadia@caterly.test` |
| Customer | `budi@caterly.test` |

Data rekening pada seeder adalah data demo dan tidak boleh digunakan untuk transfer nyata.

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
