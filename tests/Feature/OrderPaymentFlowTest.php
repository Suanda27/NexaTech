<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OrderPaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_invalid_payment_method_is_rejected(): void
    {
        $user = $this->createCustomerUser();

        $product = $this->createProduct(price: 350000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => 'cod',
            ]))
            ->assertStatus(422)
            ->assertJsonPath('errors.payment_method.0', 'The selected payment method is invalid.');
    }

    public function test_midtrans_order_starts_as_waiting_payment_with_deadline(): void
    {
        $user = $this->createCustomerUser();

        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_WAITING_PAYMENT)
            ->assertJsonPath('data.statusKey', Order::STATUS_WAITING_PAYMENT);

        $this->assertNotNull($response->json('data.paymentDeadline'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'payment_status' => Order::PAYMENT_STATUS_WAITING_PAYMENT,
            'status' => Order::STATUS_WAITING_PAYMENT,
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 9,
        ]);
    }

    public function test_midtrans_order_creates_snap_transaction(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');
        config()->set('services.midtrans.is_production', false);

        Http::fake([
            'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token-test',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-test',
            ]),
        ]);

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->assertCreated()
            ->assertJsonPath('data.paymentMethodKey', Order::PAYMENT_METHOD_MIDTRANS)
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_WAITING_PAYMENT)
            ->assertJsonPath('data.midtransSnapToken', 'snap-token-test')
            ->assertJsonPath('data.midtransRedirectUrl', 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-test');

        Http::assertSent(fn ($request) => $request->url() === 'https://app.sandbox.midtrans.com/snap/v1/transactions'
            && $request['transaction_details']['gross_amount'] === 450000);
    }

    public function test_midtrans_checkout_keeps_cart_when_snap_transaction_fails(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');

        Http::fake([
            'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'error_messages' => ['Midtrans error'],
            ], 500),
        ]);

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->assertStatus(422)
            ->assertJsonPath('message', 'Gagal membuat transaksi Midtrans. Cek konfigurasi server key.');

        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }

    public function test_midtrans_checkout_rejects_sandbox_key_in_production_mode(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');
        config()->set('services.midtrans.is_production', true);

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->assertStatus(422)
            ->assertJsonPath('message', 'Mode Midtrans production aktif, tetapi Server Key yang dipakai masih sandbox. Gunakan production key atau ubah MIDTRANS_IS_PRODUCTION=false.');
    }

    public function test_midtrans_settlement_notification_moves_order_to_processing(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $order = $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]));

        $orderId = (string) $order->json('data.id');
        $midtransOrderId = 'NEXA-'.$orderId.'-TEST';

        Order::query()->whereKey($orderId)->update([
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'midtrans_order_id' => $midtransOrderId,
        ]);

        $grossAmount = '450000.00';

        $this->postJson('/api/payments/midtrans/notification', [
            'order_id' => $midtransOrderId,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
            'signature_key' => hash('sha512', $midtransOrderId.'200'.$grossAmount.'SB-Mid-server-test'),
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'payment_status' => Order::PAYMENT_STATUS_PROCESSING,
            'status' => Order::STATUS_PROCESSING,
            'midtrans_transaction_status' => 'settlement',
            'midtrans_payment_type' => 'qris',
        ]);
    }

    public function test_midtrans_settlement_notification_works_without_api_prefix(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        $midtransOrderId = 'NEXA-'.$orderId.'-WEBHOOK';
        Order::query()->whereKey($orderId)->update([
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'midtrans_order_id' => $midtransOrderId,
        ]);

        $grossAmount = '450000.00';

        $this->postJson('/payments/midtrans/notification', [
            'order_id' => $midtransOrderId,
            'status_code' => '200',
            'gross_amount' => $grossAmount,
            'signature_key' => hash('sha512', $midtransOrderId.'200'.$grossAmount.'SB-Mid-server-test'),
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => Order::PAYMENT_STATUS_PROCESSING,
            'status' => Order::STATUS_PROCESSING,
        ]);
    }

    public function test_customer_can_sync_midtrans_status_after_snap_success(): void
    {
        config()->set('services.midtrans.server_key', 'Mid-server-test');
        config()->set('services.midtrans.is_production', false);

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        Http::fake([
            'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token-sync-test',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-sync-test',
            ]),
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        $midtransOrderId = 'NEXA-'.$orderId.'-SYNC';
        Order::query()->whereKey($orderId)->update([
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'midtrans_order_id' => $midtransOrderId,
        ]);

        Http::fake([
            'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token-sync-test',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-sync-test',
            ]),
            "api.sandbox.midtrans.com/v2/{$midtransOrderId}/status" => Http::response([
                'order_id' => $midtransOrderId,
                'status_code' => '200',
                'gross_amount' => '450000.00',
                'transaction_status' => 'settlement',
                'payment_type' => 'bank_transfer',
                'fraud_status' => 'accept',
            ]),
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/orders/{$orderId}/sync-midtrans")
            ->assertOk()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_PROCESSING)
            ->assertJsonPath('data.statusKey', Order::STATUS_PROCESSING);

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => Order::PAYMENT_STATUS_PROCESSING,
            'status' => Order::STATUS_PROCESSING,
            'midtrans_transaction_status' => 'settlement',
            'midtrans_payment_type' => 'bank_transfer',
        ]);
    }

    public function test_admin_can_ship_processing_order(): void
    {
        $user = $this->createCustomerUser();
        $admin = $this->createAdminUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$orderId}", [
                'status' => Order::STATUS_SHIPPED,
            ])
            ->assertOk()
            ->assertJsonPath('data.statusKey', Order::STATUS_SHIPPED);
    }

    public function test_customer_can_complete_shipped_order(): void
    {
        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        Order::query()->whereKey($orderId)->update([
            'status' => Order::STATUS_SHIPPED,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/orders/{$orderId}/complete")
            ->assertOk()
            ->assertJsonPath('data.statusKey', Order::STATUS_COMPLETED);
    }

    public function test_waiting_midtrans_order_is_cancelled_after_deadline(): void
    {
        $user = $this->createCustomerUser();

        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        Order::query()->whereKey($orderId)->update([
            'expires_at' => now()->subMinute(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.0.paymentStatusKey', Order::PAYMENT_STATUS_CANCELLED)
            ->assertJsonPath('data.0.statusKey', Order::STATUS_CANCELLED);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }

    public function test_midtrans_expire_notification_cancels_order_and_restores_stock(): void
    {
        config()->set('services.midtrans.server_key', 'SB-Mid-server-test');

        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->json('data.id');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8,
        ]);

        $midtransOrderId = 'NEXA-'.$orderId.'-EXPIRE';
        Order::query()->whereKey($orderId)->update([
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'midtrans_order_id' => $midtransOrderId,
        ]);

        $grossAmount = '900000.00';

        $this->postJson('/api/payments/midtrans/notification', [
            'order_id' => $midtransOrderId,
            'status_code' => '407',
            'gross_amount' => $grossAmount,
            'signature_key' => hash('sha512', $midtransOrderId.'407'.$grossAmount.'SB-Mid-server-test'),
            'transaction_status' => 'expire',
            'payment_type' => 'qris',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_status' => Order::PAYMENT_STATUS_CANCELLED,
            'status' => Order::STATUS_CANCELLED,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }

    public function test_checkout_is_blocked_when_stock_is_no_longer_sufficient(): void
    {
        $user = $this->createCustomerUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 4,
        ]);

        $product->update([
            'stock' => 2,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            ]))
            ->assertStatus(422)
            ->assertJsonPath('message', 'Stok '.$product->name.' tidak cukup. Tersisa 2 unit.');
    }

    private function createProduct(int $price): Product
    {
        return Product::query()->create([
            'category_id' => null,
            'sku' => 'SKU-'.fake()->unique()->numerify('###'),
            'name' => 'Nexa Product '.fake()->unique()->word(),
            'slug' => 'nexa-product-'.fake()->unique()->slug(),
            'description' => 'Produk testing',
            'price' => $price,
            'stock' => 10,
            'status' => Product::STATUS_ACTIVE,
            'rating' => 5,
        ]);
    }

    private function createCustomerUser(): User
    {
        /** @var User $user */
        $user = User::factory()->createOne([
            'role' => User::ROLE_USER,
        ]);

        return $user;
    }

    private function createAdminUser(): User
    {
        /** @var User $user */
        $user = User::factory()->createOne([
            'role' => User::ROLE_ADMIN,
        ]);

        return $user;
    }

    private function orderPayload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Nexa',
            'last_name' => 'Customer',
            'address' => 'Batam Center',
            'city' => 'Batam',
            'postal_code' => '29400',
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
        ], $overrides);
    }
}
