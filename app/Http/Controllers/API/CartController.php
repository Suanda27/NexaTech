<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Support\StoredImage;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use SerializesStoreData;

    public function index(Request $request)
    {
        return response()->json($this->buildCartResponse($request->user()->id));
    }

    public function count(Request $request)
    {
        $count = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->sum('quantity');

        return response()->json([
            'count' => (int) $count,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $product = Product::query()->findOrFail($validated['product_id']);

        if ($product->status !== Product::STATUS_ACTIVE || $product->stock <= 0) {
            return response()->json([
                'message' => 'Produk ini belum tersedia untuk dimasukkan ke cart.',
            ], 422);
        }

        $requestedQuantity = $validated['quantity'] ?? 1;

        $cartItem = CartItem::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        $nextQuantity = $cartItem->exists
            ? $cartItem->quantity + $requestedQuantity
            : $requestedQuantity;

        if ($nextQuantity > $product->stock) {
            return response()->json([
                'message' => "Stok {$product->name} tidak cukup. Tersisa {$product->stock} unit.",
            ], 422);
        }

        $cartItem->quantity = $nextQuantity;
        $cartItem->save();

        return response()->json($this->buildCartResponse($request->user()->id));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cartItem = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if (!$cartItem) {
            return response()->json([
                'message' => 'Item cart tidak ditemukan.',
            ], 404);
        }

        if ($validated['quantity'] === 0) {
            $cartItem->delete();

            return response()->json($this->buildCartResponse($request->user()->id));
        }

        if ($validated['quantity'] > $product->stock) {
            return response()->json([
                'message' => "Stok {$product->name} tidak cukup. Tersisa {$product->stock} unit.",
            ], 422);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json($this->buildCartResponse($request->user()->id));
    }

    public function destroy(Request $request, Product $product)
    {
        CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json($this->buildCartResponse($request->user()->id));
    }

    public function clear(Request $request)
    {
        CartItem::query()
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json($this->buildCartResponse($request->user()->id));
    }

    protected function buildCartResponse(int $userId): array
    {
        $items = CartItem::query()
            ->with('product.category')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $serializedItems = $items->map(function (CartItem $item) {
            $product = $item->product;

            if (!$product) {
                return null;
            }

            return [
                'id' => $product->id,
                'productId' => $product->id,
                'name' => $product->name,
                'price' => (int) $product->price,
                'qty' => (int) $item->quantity,
                'image' => StoredImage::toPublicUrl($product->image_url),
                'category' => $product->category?->nama_kategori,
                'stock' => (int) $product->stock,
            ];
        })->filter()->values();

        $subtotal = $serializedItems->sum(
            fn (array $item) => $item['price'] * $item['qty'],
        );
        $itemCount = $serializedItems->sum('qty');
        $shipping = 0;
        $tax = 0;

        return [
            'items' => $serializedItems,
            'summary' => [
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'tax' => $tax,
                'total' => $subtotal + $shipping + $tax,
                'itemCount' => $itemCount,
            ],
        ];
    }
}
