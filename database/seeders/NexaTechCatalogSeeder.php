<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductSearch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NexaTechCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            [
                'name' => 'Laptops',
                'slug' => 'laptops',
                'description' => 'Laptop untuk kuliah, kerja, desain, dan produktivitas harian.',
                'image_url' => '/images/categories/laptops.jpg',
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Aksesoris pelengkap setup laptop dan meja kerja.',
                'image_url' => '/images/categories/accessories.jpg',
            ],
            [
                'name' => 'Monitor',
                'slug' => 'monitor',
                'description' => 'Monitor untuk produktivitas, gaming, dan kebutuhan visual detail.',
                'image_url' => '/images/categories/monitor.jpg',
            ],
            [
                'name' => 'Storage',
                'slug' => 'storage',
                'description' => 'Penyimpanan internal dan eksternal untuk file, aplikasi, dan backup.',
                'image_url' => '/images/categories/storage.jpg',
            ],
            [
                'name' => 'PC Components',
                'slug' => 'pc-components',
                'description' => 'Komponen utama untuk upgrade dan rakit PC.',
                'image_url' => '/images/categories/pc-components.jpg',
            ],
            [
                'name' => 'Printer & Office',
                'slug' => 'printer-office',
                'description' => 'Perangkat kantor untuk kebutuhan cetak dan workflow dokumen.',
                'image_url' => '/images/categories/printer-office.jpg',
            ],
        ])->mapWithKeys(function (array $item) {
            $category = Category::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'nama_kategori' => $item['name'],
                    'deskripsi' => $item['description'],
                    'image_url' => $item['image_url'],
                    'is_active' => true,
                ],
            );

            return [$item['slug'] => $category];
        });

        $products = collect([
            [
                'category' => 'laptops',
                'sku' => 'NXT-LAP-001',
                'name' => 'NexaBook Air 14',
                'description' => 'Laptop tipis untuk kuliah dan kerja mobile dengan layar 14 inci, SSD cepat, dan baterai tahan lama.',
                'price' => 12499000,
                'stock' => 18,
                'rating' => 5,
                'image_url' => '/images/products/macbook-air.jpg',
                'specs' => [
                    ['Processor', 'Intel Core i5 13th Gen', 'Performa stabil untuk multitasking harian.', 'cpu'],
                    ['Memory', '16GB LPDDR5', 'RAM lega untuk browser, dokumen, dan aplikasi kerja.', 'memory'],
                    ['Storage', '512GB NVMe SSD', 'Booting dan akses file lebih cepat.', 'storage'],
                ],
            ],
            [
                'category' => 'laptops',
                'sku' => 'NXT-LAP-002',
                'name' => 'NexaBook Pro 16',
                'description' => 'Laptop performa tinggi untuk desain, editing, dan pekerjaan berat dengan layar luas.',
                'price' => 21999000,
                'stock' => 10,
                'rating' => 5,
                'image_url' => '/images/products/macbook-air.jpg',
                'specs' => [
                    ['Processor', 'Intel Core i7 13th Gen', 'Cocok untuk kerja kreatif dan multitasking berat.', 'cpu'],
                    ['Graphics', 'RTX 4060 8GB', 'GPU diskrit untuk rendering dan grafis.', 'display'],
                    ['Display', '16-inch QHD 120Hz', 'Ruang kerja luas dengan refresh rate tinggi.', 'display'],
                ],
            ],
            [
                'category' => 'accessories',
                'sku' => 'NXT-ACC-001',
                'name' => 'NexaClick Wireless Mouse',
                'description' => 'Mouse wireless ergonomis dengan sensor presisi untuk kerja, kuliah, dan setup laptop.',
                'price' => 249000,
                'stock' => 75,
                'rating' => 4,
                'image_url' => '/images/categories/accessories.jpg',
                'specs' => [
                    ['Connectivity', 'Bluetooth + 2.4GHz', 'Mudah dipakai di laptop dan PC.', 'connectivity'],
                    ['Battery', 'Up to 60 days', 'Hemat daya untuk penggunaan harian.', 'battery'],
                ],
            ],
            [
                'category' => 'accessories',
                'sku' => 'NXT-ACC-002',
                'name' => 'NexaType Mechanical Keyboard',
                'description' => 'Keyboard mekanikal compact untuk mengetik nyaman dan setup meja yang rapi.',
                'price' => 699000,
                'stock' => 42,
                'rating' => 5,
                'image_url' => '/images/categories/accessories.jpg',
                'specs' => [
                    ['Layout', '75% compact', 'Ukuran ringkas tanpa mengorbankan tombol penting.', 'keyboard'],
                    ['Switch', 'Tactile brown switch', 'Respons nyaman untuk kerja dan gaming ringan.', 'keyboard'],
                ],
            ],
            [
                'category' => 'accessories',
                'sku' => 'NXT-ACC-003',
                'name' => 'NexaDesk Mousepad XL',
                'description' => 'Mousepad besar dengan permukaan halus untuk mouse, keyboard, dan area kerja.',
                'price' => 149000,
                'stock' => 90,
                'rating' => 4,
                'image_url' => '/images/categories/accessories.jpg',
                'specs' => [
                    ['Size', '800 x 300 mm', 'Cukup luas untuk keyboard dan mouse.', 'ruler'],
                    ['Surface', 'Smooth cloth', 'Gerakan mouse lebih stabil.', 'mouse'],
                ],
            ],
            [
                'category' => 'monitor',
                'sku' => 'NXT-MON-001',
                'name' => 'NexaView 24 FHD Monitor',
                'description' => 'Monitor 24 inci Full HD untuk memperluas layar laptop dan meningkatkan produktivitas.',
                'price' => 1699000,
                'stock' => 27,
                'rating' => 4,
                'image_url' => '/images/categories/monitor.jpg',
                'specs' => [
                    ['Display', '24-inch IPS FHD', 'Warna jernih untuk kerja harian.', 'display'],
                    ['Refresh Rate', '75Hz', 'Visual lebih nyaman untuk penggunaan panjang.', 'refresh'],
                ],
            ],
            [
                'category' => 'storage',
                'sku' => 'NXT-STR-001',
                'name' => 'NexaDrive Portable SSD 1TB',
                'description' => 'SSD eksternal cepat untuk backup, dokumen, foto, dan file proyek.',
                'price' => 1299000,
                'stock' => 34,
                'rating' => 5,
                'image_url' => '/images/categories/storage.jpg',
                'specs' => [
                    ['Capacity', '1TB', 'Ruang besar untuk file penting.', 'storage'],
                    ['Interface', 'USB-C 3.2', 'Transfer cepat dan praktis.', 'connectivity'],
                ],
            ],
            [
                'category' => 'pc-components',
                'sku' => 'NXT-PC-001',
                'name' => 'NexaPower 650W Bronze PSU',
                'description' => 'Power supply 650W efisien untuk rakitan PC entry sampai mid-range.',
                'price' => 899000,
                'stock' => 21,
                'rating' => 4,
                'image_url' => '/images/categories/pc-components.jpg',
                'specs' => [
                    ['Power', '650W', 'Daya cukup untuk setup PC modern.', 'power'],
                    ['Efficiency', '80+ Bronze', 'Lebih efisien dan stabil.', 'settings'],
                ],
            ],
        ])->mapWithKeys(function (array $item) use ($categories) {
            $product = Product::query()->updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'category_id' => $categories[$item['category']]->category_id,
                    'name' => $item['name'],
                    'slug' => str($item['name'])->slug()->toString(),
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'status' => Product::STATUS_ACTIVE,
                    'rating' => $item['rating'],
                    'image_url' => $item['image_url'],
                ],
            );

            $product->specifications()->delete();

            foreach ($item['specs'] as $index => [$label, $value, $description, $icon]) {
                $product->specifications()->create([
                    'label' => $label,
                    'value' => $value,
                    'description' => $description,
                    'icon' => $icon,
                    'sort_order' => $index + 1,
                ]);
            }

            return [$item['sku'] => $product];
        });

        $customer = User::query()->updateOrCreate(
            ['email' => 'customer@nexatech.test'],
            [
                'name' => 'NexaTech Customer',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'address' => 'Batam Center, Batam',
                'role' => User::ROLE_USER,
            ],
        );

        ProductSearch::query()->firstOrCreate([
            'user_id' => $customer->id,
            'keyword' => 'mouse keyboard',
        ]);

        $order = Order::query()->updateOrCreate(
            ['order_number' => '#ORD-DEMO-0001'],
            [
                'user_id' => $customer->id,
                'first_name' => 'NexaTech',
                'last_name' => 'Customer',
                'address' => 'Batam Center, Batam',
                'city' => 'Batam',
                'postal_code' => '29444',
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
                'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
                'status' => Order::STATUS_COMPLETED,
                'subtotal' => $products['NXT-LAP-001']->price,
                'shipping_fee' => 0,
                'tax_amount' => 0,
                'total' => $products['NXT-LAP-001']->price,
                'ordered_at' => now()->subDays(3),
                'delivered_at' => now()->subDay(),
            ],
        );

        $order->items()->delete();
        $order->items()->create([
            'product_id' => $products['NXT-LAP-001']->id,
            'product_name' => $products['NXT-LAP-001']->name,
            'product_image_url' => $products['NXT-LAP-001']->image_url,
            'unit_price' => $products['NXT-LAP-001']->price,
            'quantity' => 1,
            'total_price' => $products['NXT-LAP-001']->price,
        ]);
    }
}
