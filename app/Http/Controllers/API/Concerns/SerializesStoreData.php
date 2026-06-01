<?php

namespace App\Http\Controllers\API\Concerns;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSpecification;
use App\Support\StoredImage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

trait SerializesStoreData
{
    protected function serializeCategory(Category $category): array
    {
        $totalProducts = Schema::hasTable('products')
            ? ($category->products_count ?? $category->products()->count())
            : 0;

        return [
            'id' => $category->category_id,
            'name' => $category->nama_kategori,
            'slug' => $category->slug,
            'description' => $category->deskripsi,
            'imageUrl' => StoredImage::toPublicUrl($category->image_url),
            'status' => $category->is_active ? 'Active' : 'Inactive',
            'statusKey' => $category->is_active ? 'active' : 'inactive',
            'totalProducts' => $totalProducts,
        ];
    }

    protected function serializeProduct(Product $product, bool $includeSpecs = false): array
    {
        $product->loadMissing('category');

        $payload = [
            'id' => $product->id,
            'sku' => $product->sku,
            'name' => $product->name,
            'slug' => $product->slug,
            'categoryId' => $product->category_id,
            'category' => $product->category?->nama_kategori ?? 'Uncategorized',
            'price' => (int) $product->price,
            'rating' => (int) $product->rating,
            'description' => $product->description ?? '',
            'stock' => (int) $product->stock,
            'isLowStock' => $product->isLowStock(),
            'isOutOfStock' => $product->isOutOfStock(),
            'status' => $this->productStatusLabel($product->status),
            'statusKey' => $product->status,
            'imageUrl' => StoredImage::toPublicUrl($product->image_url),
        ];

        if ($includeSpecs) {
            $product->loadMissing('specifications');
            $payload['specs'] = $product->specifications
                ->map(fn (ProductSpecification $spec) => $this->serializeSpecification($spec))
                ->values();
        }

        return $payload;
    }

    protected function serializeSpecification(ProductSpecification $spec): array
    {
        return [
            'id' => (string) $spec->id,
            'label' => $spec->label,
            'value' => $spec->value,
            'description' => $spec->description ?? '',
            'icon' => $spec->icon,
        ];
    }

    /**
     * @param \Illuminate\Support\Collection<int, \App\Models\OrderItem> $items
     */
    protected function serializeOrderItems(Collection $items): array
    {
        return $items
            ->map(fn (OrderItem $item) => [
                'id' => (string) $item->id,
                'productId' => $item->product_id,
                'productName' => $item->product_name,
                'productImage' => StoredImage::toPublicUrl($item->product_image_url),
                'quantity' => (int) $item->quantity,
                'unitPrice' => (int) $item->unit_price,
                'totalPrice' => (int) $item->total_price,
            ])
            ->values()
            ->all();
    }

    protected function serializeOrder(Order $order, bool $includePaymentProof = true): array
    {
        $order->loadMissing('items');

        $payload = [
            'id' => (string) $order->id,
            'orderNumber' => $order->order_number,
            'customerName' => trim("{$order->first_name} {$order->last_name}"),
            'orderDate' => optional($order->ordered_at ?? $order->created_at)?->format('d M Y'),
            'paymentDeadline' => optional($order->expires_at)?->format('d M Y H:i'),
            'paymentExpiresAt' => optional($order->expires_at)?->toIso8601String(),
            'paymentMethod' => $this->paymentMethodLabel($order->payment_method),
            'paymentMethodKey' => $order->payment_method,
            'paymentStatus' => $this->paymentStatusLabel($order->payment_status),
            'paymentStatusKey' => $order->payment_status,
            'status' => $this->orderStatusLabel($order->status),
            'statusKey' => $order->status,
            'declineReason' => $order->payment_rejection_reason ?? $order->cancellation_reason ?? $order->decline_reason,
            'paymentRejectionReason' => $order->payment_rejection_reason,
            'cancellationReason' => $order->cancellation_reason,
            'customer' => [
                'firstName' => $order->first_name,
                'lastName' => $order->last_name,
                'address' => $order->address,
                'city' => $order->city,
                'postalCode' => $order->postal_code,
            ],
            'paymentDetail' => [
                'method' => $this->paymentMethodLabel($order->payment_method),
                'status' => $this->paymentStatusLabel($order->payment_status),
            ],
            'summary' => [
                'subtotal' => (int) $order->subtotal,
                'shippingFee' => (int) $order->shipping_fee,
                'taxAmount' => (int) $order->tax_amount,
                'total' => (int) $order->total,
            ],
            'items' => $this->serializeOrderItems($order->items),
        ];

        if ($includePaymentProof) {
            $payload['paymentProofImage'] = $order->paymentProofUrl();
        }

        return $payload;
    }

    protected function paymentMethodLabel(string $paymentMethod): string
    {
        return $paymentMethod === Order::PAYMENT_METHOD_BANK_TRANSFER
            ? 'Bank Transfer'
            : 'COD';
    }

    protected function paymentStatusLabel(string $paymentStatus): string
    {
        return match ($paymentStatus) {
            Order::PAYMENT_STATUS_WAITING_PAYMENT => 'Waiting Payment',
            Order::PAYMENT_STATUS_WAITING_VERIFICATION => 'Waiting Verification',
            Order::PAYMENT_STATUS_PAID => 'Paid',
            Order::PAYMENT_STATUS_REJECTED => 'Rejected',
            Order::PAYMENT_STATUS_EXPIRED => 'Expired',
            default => 'Unpaid',
        };
    }

    protected function orderStatusLabel(string $status): string
    {
        return match ($status) {
            Order::STATUS_PENDING => 'Pending',
            Order::STATUS_PROCESSING => 'Processing',
            Order::STATUS_DELIVERED => 'Delivered',
            Order::STATUS_CANCELLED => 'Cancelled',
            default => 'Pending',
        };
    }

    protected function productStatusLabel(string $status): string
    {
        return match ($status) {
            Product::STATUS_INACTIVE => 'Inactive',
            Product::STATUS_OUT_OF_STOCK => 'Out of Stock',
            default => 'Active',
        };
    }
}
