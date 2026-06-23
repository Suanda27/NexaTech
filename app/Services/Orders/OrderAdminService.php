<?php

namespace App\Services\Orders;

use App\Models\Order;
use Illuminate\Validation\ValidationException;

class OrderAdminService
{
    public function update(Order $order, array $payload): Order
    {
        if (in_array($order->status, [Order::STATUS_SHIPPED, Order::STATUS_COMPLETED, Order::STATUS_CANCELLED], true)) {
            throw ValidationException::withMessages([
                'status' => ['Order ini sudah tidak bisa diubah lagi.'],
            ]);
        }

        if (($payload['status'] ?? null) === null) {
            throw ValidationException::withMessages([
                'status' => ['Tidak ada perubahan status yang dikirim.'],
            ]);
        }

        return match (true) {
            ($payload['status'] ?? null) === Order::STATUS_SHIPPED
                => $this->markShipped($order),
            default => $order->fresh()->load('items'),
        };
    }

    protected function markShipped(Order $order): Order
    {
        if ($order->status !== Order::STATUS_PROCESSING) {
            throw ValidationException::withMessages([
                'status' => ['Order ini belum masuk tahap processing.'],
            ]);
        }

        $payload = [
            'status' => Order::STATUS_SHIPPED,
            'delivered_at' => now(),
        ];

        $payload['payment_status'] = Order::PAYMENT_STATUS_SHIPPED;
        $payload['payment_verified_at'] = $order->payment_verified_at ?? now();

        $order->forceFill($payload)->save();

        return $order->fresh()->load('items');
    }
}
