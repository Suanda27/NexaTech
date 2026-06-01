<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        Order::expirePendingTransferPayments();

        $user = $request->user();

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'role' => $user->role,
                ],
                'summary' => [
                    'totalOrders' => $orders->count(),
                    'progressingOrders' => $orders->whereIn('status', [
                        Order::STATUS_PENDING,
                        Order::STATUS_PROCESSING,
                    ])->count(),
                    'deliveredOrders' => $orders->where('status', Order::STATUS_DELIVERED)->count(),
                    'declinedOrders' => $orders->where('payment_status', Order::PAYMENT_STATUS_REJECTED)->count(),
                    'cancelledOrders' => $orders->where('status', Order::STATUS_CANCELLED)->count(),
                ],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        if (!empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'role' => $user->role,
            ],
        ]);
    }
}
