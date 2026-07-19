<h1 align="center">⚡ NexaTech</h1>

<p align="center">
  Platform e-commerce teknologi modern yang dibangun dengan arsitektur fullstack berbasis <strong>Laravel</strong> + <strong>Next.js</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/PHP-8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Midtrans-Payment-00ADE5?style=for-the-badge" alt="Midtrans">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

---

## 📖 Apa itu NexaTech?

**NexaTech** adalah platform e-commerce yang berfokus pada penjualan produk teknologi seperti laptop, smartphone, aksesoris, peripheral, dan perangkat elektronik lainnya. Proyek ini dibangun sebagai sistem fullstack yang memisahkan secara tegas antara **backend API** (Laravel) dan **frontend** (Next.js), dengan fitur-fitur yang siap untuk skala produksi.

NexaTech hadir dengan sistem rekomendasi produk berbasis riwayat pembelian, integrasi pembayaran Midtrans, panel admin lengkap, manajemen keranjang belanja, hingga pencatatan riwayat pesanan — semua dalam satu ekosistem yang terstruktur dan modular.

---

## 🛠️ Teknologi Utama

### Backend
| Teknologi | Versi | Keterangan |
|---|---|---|
| **PHP** | ^8.2 | Bahasa pemrograman utama |
| **Laravel** | ^12.0 | Framework backend & REST API |
| **Laravel Sanctum** | * | Autentikasi token berbasis SPA |
| **SQLite / MySQL** | — | Database (default: SQLite untuk dev) |
| **Laravel Sail** | ^1.41 | Lingkungan Docker untuk pengembangan |
| **Pest PHP** | ^4.4 | Framework pengujian otomatis |
| **Laravel Pint** | ^1.24 | Code formatter standar Laravel |

### Frontend
| Teknologi | Versi | Keterangan |
|---|---|---|
| **Next.js** | 16.x | Framework React untuk SSR & SSG |
| **React** | 19.x | Library UI utama |
| **TypeScript** | ^5 | Type-safe JavaScript |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **Framer Motion** | ^12 | Animasi & transisi UI |
| **Recharts** | ^3 | Visualisasi data (grafik admin) |
| **Lucide React** | ^0.577 | Ikon modern berbasis SVG |

### Infrastruktur & Integrasi
| Teknologi | Keterangan |
|---|---|
| **Midtrans** | Payment gateway Indonesia (Snap) |
| **Vite** | Build tool untuk asset Laravel |
| **Concurrently** | Menjalankan server, queue, & vite paralel |

---

## ✨ Fitur Unggulan

### 🛍️ Pengalaman Belanja
- **Katalog Produk** — Tampilan produk dengan filter kategori, pencarian full-text (nama, deskripsi, SKU), serta pengurutan berdasarkan harga, terbaru, atau terlaris.
- **Detail Produk** — Galeri gambar, spesifikasi teknis, dan produk terkait dalam kategori yang sama.
- **Keranjang Belanja** — Tambah, ubah jumlah, dan hapus item; serta fitur kosongkan keranjang sekaligus.
- **Produk Unggulan** — Menampilkan 8 produk aktif terbaru di halaman beranda.

### 🤖 Sistem Rekomendasi Cerdas (4-Tier Scoring)
NexaTech memiliki mesin rekomendasi produk berbasis riwayat pembelian tanpa kebutuhan machine learning eksternal:
- **Tier 1 (Skor 100)** — Produk dari kategori yang *sering dibeli bersama* (co-purchase) di order lain.
- **Tier 2 (Skor 80)** — Produk yang cocok secara *semantik* (misal: beli laptop → rekomendasikan mouse, charger, tas).
- **Tier 3 (Skor 50)** — Produk dari *kategori yang sama* dengan pembelian sebelumnya.
- **Tier 4 (Skor 20)** — Produk dari *kategori lain* sebagai eksplorasi.
- **Category Diversity** — Maksimal 2 produk per kategori untuk variasi rekomendasi.
- **Cold Start** — Pengguna baru mendapatkan rekomendasi produk acak pilihan toko.

### 💳 Pembayaran (Midtrans Snap)
- Integrasi penuh dengan **Midtrans Snap** untuk berbagai metode pembayaran (transfer bank, e-wallet, kartu kredit, dll).
- Notifikasi webhook otomatis untuk pembaruan status pesanan.
- Mode mock/simulasi pembayaran untuk keperluan pengembangan lokal.
- Sinkronisasi status transaksi manual jika notifikasi terlambat.

### 👤 Manajemen Pengguna
- Registrasi & login pengguna dengan autentikasi token (Laravel Sanctum).
- Login terpisah untuk akun **admin**.
- Manajemen profil pengguna (update data diri).
- Riwayat pesanan dengan detail status dan item yang dipesan.

### 🔧 Panel Admin
- **Dashboard** — Statistik ringkasan toko.
- **Manajemen Kategori** — CRUD kategori produk (dengan slug & status aktif/nonaktif).
- **Manajemen Produk** — CRUD produk lengkap dengan gambar, harga, stok, dan spesifikasi.
- **Manajemen Pesanan** — Lihat dan perbarui status seluruh pesanan pelanggan.

---

## 🚀 Instalasi Pengembangan Lokal

### Prasyarat
Pastikan perangkat Anda sudah terinstal:
- **PHP** >= 8.2 (beserta ekstensi: `pdo_sqlite`, `fileinfo`, `mbstring`)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **npm** >= 10.x
- **Git**

---

### 1. Clone Repository

```bash
git clone https://github.com/username/nexatech.git
cd nexatech
```

---

### 2. Setup Backend (Laravel)

```bash
# Instal dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Jalankan migrasi database
php artisan migrate

# (Opsional) Jalankan seeder untuk data awal
php artisan db:seed
```

> **Catatan:** Secara default, proyek menggunakan **SQLite** (`database/database.sqlite`). File ini akan otomatis dibuat saat migrasi pertama dijalankan. Jika ingin menggunakan MySQL, ubah konfigurasi `DB_*` di file `.env`.

---

### 3. Setup Midtrans (Pembayaran)

Buka file `.env` dan isi konfigurasi Midtrans:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Untuk development tanpa akun Midtrans, aktifkan mock:
MIDTRANS_MOCK_ENABLED=true
MIDTRANS_MOCK_AUTO_SETTLE=true
```

> Daftar akun Sandbox Midtrans gratis di [dashboard.midtrans.com](https://dashboard.midtrans.com).

---

### 4. Setup Frontend (Next.js)

```bash
cd frontend

# Instal dependensi Node.js
npm install

# Salin file environment frontend
# (buat file .env.local jika belum ada)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

---

### 5. Menjalankan Server Development

Buka **dua terminal** secara terpisah:

**Terminal 1 — Backend Laravel:**
```bash
# Di root folder nexatech/
composer run dev
```
> Perintah ini secara otomatis menjalankan `php artisan serve`, `php artisan queue:listen`, dan `npm run dev` secara paralel.

**Terminal 2 — Frontend Next.js:**
```bash
cd frontend
npm run dev
```

---

### 6. Akses Aplikasi

| Layanan | URL |
|---|---|
| 🌐 Frontend (Next.js) | `http://localhost:3000` |
| ⚙️ Backend API (Laravel) | `http://localhost:8000/api` |

---

### ⚡ Cara Cepat (One-Command Setup)

Jika ingin setup backend sekaligus dalam satu perintah:

```bash
composer run setup
```

Perintah ini akan menjalankan `composer install`, generate key, migrasi database, `npm install`, dan build asset secara otomatis.

---

## 🧪 Menjalankan Pengujian

```bash
# Jalankan seluruh test suite (Pest PHP)
composer run test

# Atau langsung via artisan
php artisan test
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).
