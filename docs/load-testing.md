# Load Testing dengan Locust

Setup ini menguji endpoint utama NexaTech:

- katalog publik: kategori, produk, featured products, rekomendasi publik, detail produk
- customer: login, profil, cart, orders, rekomendasi personal
- admin: login admin, dashboard, kategori, produk, order list, detail order

Secara default test berjalan dalam mode aman. Endpoint tulis seperti tambah cart dan simpan pencarian hanya aktif kalau `LOCUST_ENABLE_WRITES=true`. Checkout/order lebih ketat lagi dan hanya aktif kalau `LOCUST_ENABLE_CHECKOUT=true`.

## Instalasi

Jalankan dari root project:

```bash
python -m venv .venv-locust
.venv-locust\Scripts\activate
pip install -r requirements-loadtest.txt
```

## Jalankan Server Laravel

Di terminal lain:

```bash
php artisan serve
```

Default target Laravel adalah:

```text
http://localhost:8000
```

Pastikan database sudah berisi data kategori/produk. Kalau perlu:

```bash
php artisan migrate --seed
```

## Jalankan Locust dengan UI

```bash
locust -f loadtests/locustfile.py --host=http://localhost:8000
```

Buka dashboard Locust:

```text
http://localhost:8089
```

Rekomendasi awal:

- Number of users: `10`
- Ramp up: `2`
- Run time: `3-5 menit`

## Profil Test

Gunakan `--profile` untuk memilih area yang dites:

```bash
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=public
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=customer
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=admin
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=mixed
```

`mixed` adalah default dan menjalankan kombinasi public, customer, dan admin. Customer/admin hanya benar-benar aktif jika credential disediakan.

## Credential untuk Endpoint Login

PowerShell:

```powershell
$env:LOCUST_CUSTOMER_EMAIL="customer@example.com"
$env:LOCUST_CUSTOMER_PASSWORD="secret123"
$env:LOCUST_ADMIN_EMAIL="admin@nexatech.test"
$env:LOCUST_ADMIN_PASSWORD="secret123"
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=mixed
```

Kalau credential customer/admin tidak diisi, user virtual untuk area tersebut akan mencoba login lalu tidak menjalankan request protected.

## Mengaktifkan Endpoint Tulis

Untuk test cart dan pencarian:

```powershell
$env:LOCUST_ENABLE_WRITES="true"
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=customer
```

Untuk test checkout/order juga:

```powershell
$env:LOCUST_ENABLE_WRITES="true"
$env:LOCUST_ENABLE_CHECKOUT="true"
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=customer
```

Gunakan checkout hanya di local/staging karena akan membuat data order.

## Mode Headless dan Export Laporan

Contoh smoke test cepat:

```bash
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=public --headless -u 10 -r 2 -t 3m --csv=storage/app/locust-public
```

Contoh mixed test:

```bash
locust -f loadtests/locustfile.py --host=http://localhost:8000 --profile=mixed --headless -u 50 -r 5 -t 10m --csv=storage/app/locust-mixed
```

File CSV akan berisi metrik response time, request per second, failure count, dan statistik per endpoint.

## Cara Membaca Hasil

Perhatikan metrik ini:

- `Failure %`: sebaiknya 0% untuk test normal.
- `Median` dan `95%`: gambaran waktu respons mayoritas user.
- `RPS`: request per second yang berhasil dilayani.
- Endpoint dengan response time paling tinggi: kandidat optimasi database/cache.

Jangan mulai dari user besar. Naikkan bertahap, misalnya 10, 25, 50, 100 user, sambil memantau CPU, memory, database, dan log Laravel.
