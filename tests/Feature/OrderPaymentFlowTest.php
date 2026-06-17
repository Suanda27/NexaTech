<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderPaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_cod_is_rejected_when_total_exceeds_threshold(): void
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
                'payment_method' => Order::PAYMENT_METHOD_COD,
            ]))
            ->assertStatus(422)
            ->assertJsonPath('message', 'COD hanya tersedia untuk total belanja maksimal Rp 300.000.');
    }

    public function test_transfer_order_starts_as_waiting_payment_with_deadline(): void
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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]));

        $response
            ->assertCreated()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_WAITING_PAYMENT)
            ->assertJsonPath('data.statusKey', Order::STATUS_PENDING);

        $this->assertNotNull($response->json('data.paymentDeadline'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            'payment_status' => Order::PAYMENT_STATUS_WAITING_PAYMENT,
            'status' => Order::STATUS_PENDING,
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

    public function test_midtrans_settlement_notification_marks_order_as_paid(): void
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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
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
            'payment_type' => 'bank_transfer',
        ])->assertOk();

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'payment_method' => Order::PAYMENT_METHOD_MIDTRANS,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'status' => Order::STATUS_PROCESSING,
            'midtrans_transaction_status' => 'settlement',
            'midtrans_payment_type' => 'bank_transfer',
        ]);
    }

    public function test_customer_can_submit_payment_proof_after_checkout(): void
    {
        Storage::fake(Order::PAYMENT_PROOF_DISK);

        $user = $this->createCustomerUser();

        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]))
            ->json('data.id');

        $this->actingAs($user, 'sanctum')
            ->post("/api/orders/{$orderId}/payment-proof", [
                'payment_proof' => UploadedFile::fake()->image('payment-proof.png'),
            ])
            ->assertOk()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_WAITING_VERIFICATION);

        $order = Order::query()->findOrFail($orderId);

        $this->assertNotNull($order->payment_proof);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $storage */
        $storage = Storage::disk(Order::PAYMENT_PROOF_DISK);
        $storage->assertExists($order->payment_proof);
    }

    public function test_admin_can_approve_verified_transfer_payment(): void
    {
        Storage::fake(Order::PAYMENT_PROOF_DISK);

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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]))
            ->json('data.id');

        $this->actingAs($user, 'sanctum')
            ->post("/api/orders/{$orderId}/payment-proof", [
                'payment_proof' => UploadedFile::fake()->image('payment-proof.png'),
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$orderId}", [
                'payment_status' => Order::PAYMENT_STATUS_PAID,
            ])
            ->assertOk()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_PAID)
            ->assertJsonPath('data.statusKey', Order::STATUS_PROCESSING);
    }

    public function test_admin_reject_requires_reason_and_customer_can_reupload(): void
    {
        Storage::fake(Order::PAYMENT_PROOF_DISK);

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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]))
            ->json('data.id');

        $this->actingAs($user, 'sanctum')
            ->post("/api/orders/{$orderId}/payment-proof", [
                'payment_proof' => UploadedFile::fake()->image('payment-proof.png'),
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$orderId}", [
                'payment_status' => Order::PAYMENT_STATUS_REJECTED,
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Alasan penolakan wajib diisi.');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$orderId}", [
                'payment_status' => Order::PAYMENT_STATUS_REJECTED,
                'payment_rejection_reason' => 'Nominal transfer tidak sesuai.',
            ])
            ->assertOk()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_REJECTED)
            ->assertJsonPath('data.paymentRejectionReason', 'Nominal transfer tidak sesuai.');

        $this->actingAs($user, 'sanctum')
            ->post("/api/orders/{$orderId}/payment-proof", [
                'payment_proof' => UploadedFile::fake()->image('payment-proof-reupload.png'),
            ])
            ->assertOk()
            ->assertJsonPath('data.paymentStatusKey', Order::PAYMENT_STATUS_WAITING_VERIFICATION)
            ->assertJsonPath('data.paymentRejectionReason', null);
    }

    public function test_transfer_order_becomes_expired_after_deadline(): void
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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]))
            ->json('data.id');

        Order::query()->whereKey($orderId)->update([
            'expires_at' => now()->subMinute(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonPath('data.0.paymentStatusKey', Order::PAYMENT_STATUS_EXPIRED)
            ->assertJsonPath('data.0.statusKey', Order::STATUS_CANCELLED);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }

    public function test_admin_cancel_restores_reserved_stock(): void
    {
        $user = $this->createCustomerUser();
        $admin = $this->createAdminUser();
        $product = $this->createProduct(price: 450000);

        CartItem::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $orderId = (string) $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', $this->orderPayload([
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
            ]))
            ->json('data.id');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/orders/{$orderId}", [
                'status' => Order::STATUS_CANCELLED,
                'cancellation_reason' => 'Stok dialihkan ke pembelian lain.',
            ])
            ->assertOk()
            ->assertJsonPath('data.statusKey', Order::STATUS_CANCELLED);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 10,
        ]);
    }

    public function test_checkout_is_rejected_when_stock_is_no_longer_sufficient(): void
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
                'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
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
            'payment_method' => Order::PAYMENT_METHOD_BANK_TRANSFER,
        ], $overrides);
    }
}
