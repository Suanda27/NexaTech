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
        Order::expirePendingMidtransPayments();

        $user = $request->user();

        $summary = Order::query()
            ->where('user_id', $user->id)
            ->selectRaw('COUNT(*) as total_orders')
            ->selectRaw(
                "SUM(CASE WHEN status IN ('".Order::STATUS_WAITING_PAYMENT."', '".Order::STATUS_PROCESSING."', '".Order::STATUS_SHIPPED."') THEN 1 ELSE 0 END) as progressing_orders"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = '".Order::STATUS_COMPLETED."' THEN 1 ELSE 0 END) as completed_orders"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = '".Order::STATUS_CANCELLED."' THEN 1 ELSE 0 END) as declined_orders"
            )
            ->selectRaw(
                "SUM(CASE WHEN status = '".Order::STATUS_CANCELLED."' THEN 1 ELSE 0 END) as cancelled_orders"
            )
            ->first();

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
                    'totalOrders' => (int) ($summary->total_orders ?? 0),
                    'progressingOrders' => (int) ($summary->progressing_orders ?? 0),
                    'completedOrders' => (int) ($summary->completed_orders ?? 0),
                    'declinedOrders' => (int) ($summary->declined_orders ?? 0),
                    'cancelledOrders' => (int) ($summary->cancelled_orders ?? 0),
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
