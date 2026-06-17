<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string $order_number
 * @property string $first_name
 * @property string $last_name
 * @property string $address
 * @property string $city
 * @property string $postal_code
 * @property string $payment_method
 * @property string $payment_status
 * @property string $status
 * @property string|null $payment_proof
 * @property string|null $midtrans_order_id
 * @property string|null $midtrans_snap_token
 * @property string|null $midtrans_redirect_url
 * @property string|null $midtrans_transaction_status
 * @property string|null $midtrans_payment_type
 * @property string|null $payment_rejection_reason
 * @property string|null $cancellation_reason
 * @property string|null $decline_reason
 * @property int $subtotal
 * @property int $shipping_fee
 * @property int $tax_amount
 * @property int $total
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property \Illuminate\Support\Carbon|null $payment_submitted_at
 * @property \Illuminate\Support\Carbon|null $payment_verified_at
 * @property \Illuminate\Support\Carbon|null $ordered_at
 * @property \Illuminate\Support\Carbon|null $stock_reserved_at
 * @property \Illuminate\Support\Carbon|null $stock_released_at
 * @property \Illuminate\Support\Carbon|null $delivered_at
 * @property \Illuminate\Support\Carbon|null $cancelled_at
 * @property \Illuminate\Support\Carbon|null $declined_at
 *
 * @property \App\Models\User $user
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\OrderItem[] $items
 */
class Order extends Model
{
    use HasFactory;

    public const COD_MAX_TOTAL = 300000;
    public const TRANSFER_PAYMENT_WINDOW_HOURS = 24;

    public const PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer';
    public const PAYMENT_METHOD_COD = 'cod';
    public const PAYMENT_METHOD_MIDTRANS = 'midtrans';
    public const PAYMENT_PROOF_DISK = 'public';
    public const PAYMENT_PROOF_DIRECTORY = 'payment-proofs';

    public const PAYMENT_STATUS_WAITING_PAYMENT = 'waiting_payment';
    public const PAYMENT_STATUS_WAITING_VERIFICATION = 'waiting_verification';
    public const PAYMENT_STATUS_PAID = 'paid';
    public const PAYMENT_STATUS_REJECTED = 'rejected';
    public const PAYMENT_STATUS_EXPIRED = 'expired';
    public const PAYMENT_STATUS_UNPAID = 'unpaid';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_PROGRESSING = 'processing';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'order_number',
        'first_name',
        'last_name',
        'address',
        'city',
        'postal_code',
        'payment_method',
        'payment_status',
        'status',
        'payment_proof',
        'midtrans_order_id',
        'midtrans_snap_token',
        'midtrans_redirect_url',
        'midtrans_transaction_status',
        'midtrans_payment_type',
        'payment_rejection_reason',
        'cancellation_reason',
        'decline_reason',
        'subtotal',
        'shipping_fee',
        'tax_amount',
        'total',
        'expires_at',
        'payment_submitted_at',
        'payment_verified_at',
        'ordered_at',
        'stock_reserved_at',
        'stock_released_at',
        'delivered_at',
        'cancelled_at',
        'declined_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'payment_submitted_at' => 'datetime',
            'payment_verified_at' => 'datetime',
            'ordered_at' => 'datetime',
            'stock_reserved_at' => 'datetime',
            'stock_released_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'declined_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentProofUrl(): ?string
    {
        if (!$this->payment_proof) {
            return null;
        }

        if (
            Str::startsWith($this->payment_proof, 'data:')
            || Str::startsWith($this->payment_proof, 'http://')
            || Str::startsWith($this->payment_proof, 'https://')
            || Str::startsWith($this->payment_proof, '/')
        ) {
            return $this->payment_proof;
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk(self::PAYMENT_PROOF_DISK);

        return $disk->url($this->payment_proof);
    }

    public function storePaymentProof(UploadedFile $file): string
    {
        $this->deleteStoredPaymentProof();

        return $file->store(self::PAYMENT_PROOF_DIRECTORY, self::PAYMENT_PROOF_DISK);
    }

    public function deleteStoredPaymentProof(): void
    {
        if (
            !$this->payment_proof
            || Str::startsWith($this->payment_proof, 'data:')
            || Str::startsWith($this->payment_proof, 'http://')
            || Str::startsWith($this->payment_proof, 'https://')
            || Str::startsWith($this->payment_proof, '/')
        ) {
            return;
        }

        Storage::disk(self::PAYMENT_PROOF_DISK)->delete($this->payment_proof);
    }

    public function hasReservedStock(): bool
    {
        return $this->stock_reserved_at !== null && $this->stock_released_at === null;
    }

    /**
     * @param Collection<int, Product> $lockedProducts
     */
    public function releaseReservedStock(Collection $lockedProducts): void
    {
        if (!$this->hasReservedStock()) {
            return;
        }

        $this->loadMissing('items');

        foreach ($this->items as $item) {
            if (!$item->product_id) {
                continue;
            }

            /** @var Product|null $product */
            $product = $lockedProducts->get($item->product_id);

            if (!$product) {
                continue;
            }

            $product->stock += (int) $item->quantity;

            if ($product->status === Product::STATUS_OUT_OF_STOCK && $product->stock > 0) {
                $product->status = Product::STATUS_ACTIVE;
            }

            $product->save();
        }

        $this->stock_released_at = now();
    }

    public static function expirePendingTransferPayments(): void
    {
        static::query()
            ->with('items')
            ->whereIn('payment_method', [
                self::PAYMENT_METHOD_BANK_TRANSFER,
                self::PAYMENT_METHOD_MIDTRANS,
            ])
            ->whereIn('payment_status', [
                self::PAYMENT_STATUS_WAITING_PAYMENT,
                self::PAYMENT_STATUS_REJECTED,
            ])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereNull('stock_released_at')
            ->chunkById(50, function (Collection $orders): void {
                DB::transaction(function () use ($orders): void {
                    $productIds = $orders
                        ->flatMap(fn (Order $order) => $order->items->pluck('product_id'))
                        ->filter()
                        ->unique()
                        ->values();

                    $lockedProducts = Product::query()
                        ->whereIn('id', $productIds)
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    foreach ($orders as $order) {
                        $order->releaseReservedStock($lockedProducts);
                        $order->payment_status = self::PAYMENT_STATUS_EXPIRED;
                        $order->status = self::STATUS_CANCELLED;
                        $order->cancelled_at = now();
                        $order->save();
                    }
                });
            });
    }
}
