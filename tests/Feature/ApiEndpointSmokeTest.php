<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiEndpointSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_register_and_admin_login_endpoints_work(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@nexatech.test',
            'password' => bcrypt('secret123'),
            'role' => User::ROLE_ADMIN,
        ]);

        $this->postJson('/api/auth/register', [
            'name' => 'Faiz',
            'email' => 'faiz@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'phone' => '08123456789',
            'address' => 'Batam',
        ])
            ->assertCreated()
            ->assertJsonPath('user.email', 'faiz@example.com');

        $this->postJson('/api/auth/admin/login', [
            'email' => $admin->email,
            'password' => 'secret123',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', User::ROLE_ADMIN);
    }

    public function test_public_catalog_endpoints_work(): void
    {
        $category = $this->createCategory();
        $product = $this->createProduct($category, [
            'name' => 'NexaBook Pro',
            'slug' => 'nexabook-pro',
            'sku' => 'SKU-PRO-001',
            'image_url' => 'catalog/products/nexabook-pro.png',
        ]);

        OrderItem::query()->create([
            'order_id' => Order::query()->create([
                'user_id' => User::factory()->create()->id,
                'order_number' => 'ORD-SMOKE-001',
                'first_name' => 'Smoke',
                'last_name' => 'Test',
                'address' => 'Batam',
                'city' => 'Batam',
                'postal_code' => '29433',
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
                'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
                'status' => Order::STATUS_COMPLETED,
                'subtotal' => 15000000,
                'shipping_fee' => 0,
                'tax_amount' => 0,
                'total' => 15000000,
                'ordered_at' => now(),
                'delivered_at' => now(),
            ])->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_image_url' => $product->image_url,
            'unit_price' => $product->price,
            'quantity' => 2,
            'total_price' => $product->price * 2,
        ]);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/products/featured')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/products/recommendations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recommendationReason', 'Produk acak');

        $this->getJson('/api/products?q=NexaBook&category='.$category->slug.'&sort=best_selling&per_page=8')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $product->id);

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.relatedProducts', []);
    }

    public function test_customer_cart_profile_and_recommendation_endpoints_work(): void
    {
        $user = $this->createCustomerUser();
        $laptopCategory = $this->createCategory();
        $accessoryCategory = $this->createCategory([
            'nama_kategori' => 'Accessories',
            'slug' => 'accessories',
            'deskripsi' => 'Kategori aksesoris',
        ]);
        $laptop = $this->createProduct($laptopCategory, [
            'name' => 'NexaBook Air',
            'slug' => 'nexabook-air',
            'sku' => 'SKU-LAP-001',
            'price' => 12000000,
            'stock' => 7,
        ]);
        $product = $this->createProduct($accessoryCategory, [
            'name' => 'NexaMouse',
            'slug' => 'nexamouse',
            'sku' => 'SKU-MOUSE-001',
            'price' => 250000,
            'stock' => 20,
        ]);
        $order = Order::query()->create([
            'user_id' => $user->id,
            'order_number' => 'ORD-RECO-001',
            'first_name' => 'Reco',
            'last_name' => 'User',
            'address' => 'Batam',
            'city' => 'Batam',
            'postal_code' => '29433',
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
            'status' => Order::STATUS_COMPLETED,
            'subtotal' => $laptop->price,
            'shipping_fee' => 0,
            'tax_amount' => 0,
            'total' => $laptop->price,
            'ordered_at' => now(),
            'delivered_at' => now(),
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $laptop->id,
            'product_name' => $laptop->name,
            'product_image_url' => $laptop->image_url,
            'unit_price' => $laptop->price,
            'quantity' => 1,
            'total_price' => $laptop->price,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cart')
            ->assertOk()
            ->assertJsonPath('summary.itemCount', 0);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/cart/count')
            ->assertOk()
            ->assertJsonPath('count', 0);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('summary.itemCount', 2);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/cart/items/{$product->id}", [
                'quantity' => 3,
            ])
            ->assertOk()
            ->assertJsonPath('summary.itemCount', 3);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/product-searches', [
                'keyword' => 'mouse gaming',
            ])
            ->assertCreated();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/recommendations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $product->id)
            ->assertJsonPath('data.0.recommendationReason', 'Pelengkap laptop Anda');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'Faiz Updated',
                'email' => $user->email,
                'phone' => '0811111111',
                'address' => 'Batam Center',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Faiz Updated');

        $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/cart/items/{$product->id}")
            ->assertOk()
            ->assertJsonPath('summary.itemCount', 0);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertOk();

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/cart/clear')
            ->assertOk()
            ->assertJsonPath('summary.itemCount', 0);
    }

    public function test_admin_dashboard_product_and_order_endpoints_work(): void
    {
        Storage::fake('public');

        $admin = $this->createAdminUser();
        $customer = $this->createCustomerUser();
        $category = $this->createCategory();

        $product = $this->createProduct($category, [
            'name' => 'NexaMonitor',
            'slug' => 'nexamonitor',
            'sku' => 'SKU-MON-001',
            'price' => 3200000,
            'stock' => 5,
            'image_url' => 'catalog/products/nexamonitor.png',
        ]);

        $order = Order::query()->create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-ADMIN-001',
            'first_name' => 'Faiz',
            'last_name' => 'Suanda',
            'address' => 'Batam',
            'city' => 'Batam',
            'postal_code' => '29433',
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
            'status' => Order::STATUS_COMPLETED,
            'subtotal' => $product->price,
            'shipping_fee' => 0,
            'tax_amount' => 0,
            'total' => $product->price,
            'ordered_at' => now(),
            'payment_verified_at' => now(),
            'delivered_at' => now(),
        ]);

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_image_url' => $product->image_url,
            'unit_price' => $product->price,
            'quantity' => 1,
            'total_price' => $product->price,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('id', $admin->id);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.totalOrders', 1)
            ->assertJsonPath('data.stats.totalProducts', 1);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/products?per_page=5')
            ->assertOk()
            ->assertJsonPath('summary.totalProducts', 1)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $product->id);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/products', [
                'category_id' => $category->category_id,
                'sku' => 'SKU-KEY-001',
                'name' => 'NexaKeyboard',
                'description' => 'Mechanical keyboard',
                'price' => 850000,
                'stock' => 12,
                'status' => Product::STATUS_ACTIVE,
                'rating' => 5,
                'image_url' => 'data:image/png;base64,aGVsbG8=',
                'specs' => [
                    [
                        'label' => 'Switch',
                        'value' => 'Brown',
                        'description' => 'Tactile',
                        'icon' => 'keyboard',
                    ],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'NexaKeyboard');

        $createdProductId = Product::where('sku', 'SKU-KEY-001')->value('id');
        $createdProductImagePath = Product::where('sku', 'SKU-KEY-001')->value('image_url');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/products/{$createdProductId}", [
                'category_id' => $category->category_id,
                'sku' => 'SKU-KEY-001',
                'name' => 'NexaKeyboard V2',
                'description' => 'Mechanical keyboard update',
                'price' => 900000,
                'stock' => 10,
                'status' => Product::STATUS_ACTIVE,
                'rating' => 4,
                'image_url' => null,
                'specs' => [
                    [
                        'label' => 'Switch',
                        'value' => 'Red',
                        'description' => 'Linear',
                        'icon' => 'keyboard',
                    ],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'NexaKeyboard V2');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/orders?per_page=5')
            ->assertOk()
            ->assertJsonPath('summary.totalOrders', 1)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', (string) $order->id);

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.id', (string) $order->id);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/products/{$createdProductId}")
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil dihapus.');

        if (is_string($createdProductImagePath) && $createdProductImagePath !== '') {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $storage */
            $storage = Storage::disk('public');
            $storage->assertMissing($createdProductImagePath);
        }
    }

    private function createCustomerUser(): User
    {
        return User::factory()->create([
            'password' => bcrypt('secret123'),
            'role' => User::ROLE_USER,
        ]);
    }

    private function createAdminUser(): User
    {
        return User::factory()->create([
            'password' => bcrypt('secret123'),
            'role' => User::ROLE_ADMIN,
        ]);
    }

    private function createCategory(array $attributes = []): Category
    {
        return Category::query()->create(array_merge([
            'nama_kategori' => 'Laptop',
            'slug' => 'laptop',
            'deskripsi' => 'Kategori laptop',
            'image_url' => 'catalog/categories/laptop.png',
            'is_active' => true,
        ], $attributes));
    }

    private function createProduct(Category $category, array $attributes = []): Product
    {
        return Product::query()->create(array_merge([
            'category_id' => $category->category_id,
            'sku' => 'SKU-001',
            'name' => 'Nexa Product',
            'slug' => 'nexa-product',
            'description' => 'Produk smoke test',
            'price' => 1000000,
            'stock' => 8,
            'status' => Product::STATUS_ACTIVE,
            'rating' => 5,
            'image_url' => 'catalog/products/default.png',
        ], $attributes));
    }
}
