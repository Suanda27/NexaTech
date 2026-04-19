<?php

namespace App\Http\Controllers\API\Concerns;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSpecification;
use Illuminate\Support\Collection;

trait SerializesStoreData
{
    protected function serializeCategory(Category $category): array
    {
        $totalProducts = $category->products_count
            ?? $category->products()->count();

        return [
            'id' => $category->category_id,
            'name' => $category->nama_kategori,
            'slug' => $category->slug,
            'description' => $category->deskripsi,
            'imageUrl' => $category->image_url,
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
            'status' => $this->productStatusLabel($product->status),
            'statusKey' => $product->status,
            'imageUrl' => $product->image_url,
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
                'productImage' => $item->product_image_url,
                'quantity' => (int) $item->quantity,
                'unitPrice' => (int) $item->unit_price,
                'totalPrice' => (int) $item->total_price,
            ])
            ->values()
            ->all();
    }

    protected function serializeOrder(Order $order): array
    {
        $order->loadMissing('items');

        return [
            'id' => (string) $order->id,
            'orderNumber' => $order->order_number,
            'customerName' => trim("{$order->first_name} {$order->last_name}"),
            'orderDate' => optional($order->ordered_at ?? $order->created_at)?->format('d M Y'),
            'paymentMethod' => $this->paymentMethodLabel($order->payment_method),
            'paymentMethodKey' => $order->payment_method,
            'paymentStatus' => $this->paymentStatusLabel($order->payment_status),
            'paymentStatusKey' => $order->payment_status,
            'status' => $this->orderStatusLabel($order->status),
            'statusKey' => $order->status,
            'declineReason' => $order->decline_reason,
            'paymentProofImage' => $order->payment_proof,
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
    }

    protected function paymentMethodLabel(string $paymentMethod): string
    {
        return $paymentMethod === Order::PAYMENT_METHOD_BANK_TRANSFER
            ? 'Bank Transfer'
            : 'COD';
    }

    protected function paymentStatusLabel(string $paymentStatus): string
    {
        return $paymentStatus === Order::PAYMENT_STATUS_PAID
            ? 'Paid'
            : 'Unpaid';
    }

    protected function orderStatusLabel(string $status): string
    {
        return match ($status) {
            Order::STATUS_DELIVERED => 'Delivered',
            Order::STATUS_DECLINED => 'Declined',
            Order::STATUS_CANCELLED => 'Cancelled',
            default => 'Progressing',
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
