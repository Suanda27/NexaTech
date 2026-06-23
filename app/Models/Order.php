<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

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
 * @property string|null $midtrans_order_id
 * @property string|null $midtrans_snap_token
 * @property string|null $midtrans_redirect_url
 * @property string|null $midtrans_transaction_status
 * @property string|null $midtrans_payment_type
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

    public const MIDTRANS_PAYMENT_WINDOW_HOURS = 24;
    public const TRANSFER_PAYMENT_WINDOW_HOURS = self::MIDTRANS_PAYMENT_WINDOW_HOURS;

    public const PAYMENT_METHOD_MIDTRANS = 'midtrans';
    public const PAYMENT_STATUS_WAITING_PAYMENT = 'waiting_payment';
    public const PAYMENT_STATUS_PROCESSING = 'processing';
    public const PAYMENT_STATUS_SHIPPED = 'shipped';
    public const PAYMENT_STATUS_COMPLETED = 'completed';
    public const PAYMENT_STATUS_CANCELLED = 'cancelled';

    public const STATUS_WAITING_PAYMENT = 'waiting_payment';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SHIPPED = 'shipped';
    public const STATUS_COMPLETED = 'completed';
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
        'midtrans_order_id',
        'midtrans_snap_token',
        'midtrans_redirect_url',
        'midtrans_transaction_status',
        'midtrans_payment_type',
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

    public static function expirePendingMidtransPayments(): void
    {
        /** @var \Illuminate\Database\Eloquent\Builder<App\Models\Order> $query */
        $query = static::query()
            ->with('items')
            ->where('payment_method', self::PAYMENT_METHOD_MIDTRANS)
            ->where('payment_status', self::PAYMENT_STATUS_WAITING_PAYMENT)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->whereNull('stock_released_at');

        $query->chunkById(50, function (Collection $orders): void {
                DB::transaction(function () use ($orders): void {
                    /** @var \Illuminate\Support\Collection<int, int> $productIds */
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
                        $order->payment_status = self::PAYMENT_STATUS_CANCELLED;
                        $order->status = self::STATUS_CANCELLED;
                        $order->cancelled_at = now();
                        $order->save();
                    }
                });
            });
    }

}
