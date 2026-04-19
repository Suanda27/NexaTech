<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    use SerializesStoreData;

    public function categories()
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderBy('nama_kategori')
            ->get();

        return response()->json([
            'data' => $categories
                ->map(fn (Category $category) => $this->serializeCategory($category))
                ->values(),
        ]);
    }

    public function featuredProducts()
    {
        $products = Product::query()
            ->where('status', Product::STATUS_ACTIVE)
            ->whereNotNull('image_url')
            ->latest()
            ->take(8)
            ->get();

        return response()->json([
            'data' => $products
                ->map(fn (Product $product) => $this->serializeProduct($product))
                ->values(),
        ]);
    }

    public function products(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'price' => ['nullable', 'in:lowest,highest'],
            'sort' => ['nullable', 'in:newest,best_selling,a_z'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $query = Product::query()
            ->with('category')
            ->where('status', Product::STATUS_ACTIVE);

        if (!empty($validated['category'])) {
            $categoryFilter = $validated['category'];

            $query->whereHas('category', function ($categoryQuery) use ($categoryFilter) {
                $categoryQuery
                    ->where('slug', $categoryFilter)
                    ->orWhere('nama_kategori', $categoryFilter)
                    ->orWhere('category_id', $categoryFilter);
            });
        }

        if (($validated['sort'] ?? null) === 'best_selling') {
            $query->withSum('orderItems as sold_quantity', 'quantity')
                ->orderByDesc('sold_quantity');
        } elseif (($validated['sort'] ?? null) === 'a_z') {
            $query->orderBy('name');
        } else {
            $query->latest();
        }

        if (($validated['price'] ?? null) === 'lowest') {
            $query->orderBy('price');
        } elseif (($validated['price'] ?? null) === 'highest') {
            $query->orderByDesc('price');
        }

        $perPage = $validated['per_page'] ?? 8;
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->getCollection()
                ->map(fn (Product $product) => $this->serializeProduct($product))
                ->values(),
            'meta' => [
                'currentPage' => $products->currentPage(),
                'lastPage' => $products->lastPage(),
                'perPage' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(Product $product)
    {
        if ($product->status !== Product::STATUS_ACTIVE) {
            abort(404);
        }

        $product->load(['category', 'specifications']);

        $relatedProducts = Product::query()
            ->with('category')
            ->where('status', Product::STATUS_ACTIVE)
            ->whereKeyNot($product->id)
            ->when(
                $product->category_id,
                fn ($query) => $query->where('category_id', $product->category_id),
            )
            ->latest()
            ->take(4)
            ->get();

        return response()->json([
            'data' => [
                ...$this->serializeProduct($product, true),
                'gallery' => array_values(array_filter([$product->image_url])),
                'relatedProducts' => $relatedProducts
                    ->map(fn (Product $item) => $this->serializeProduct($item))
                    ->values(),
            ],
        ]);
    }
}
