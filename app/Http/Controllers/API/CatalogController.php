<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSearch;
use App\Support\StoredImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    use SerializesStoreData;

    public function categories()
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->when(
                Schema::hasTable('products'),
                fn ($query) => $query->withCount('products'),
            )
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
            'q' => ['nullable', 'string', 'max:100'],
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

        if (!empty($validated['q'])) {
            $keyword = trim($validated['q']);

            $query->where(function ($searchQuery) use ($keyword) {
                $searchQuery
                    ->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('sku', 'like', "%{$keyword}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($keyword) {
                        $categoryQuery
                            ->where('nama_kategori', 'like', "%{$keyword}%")
                            ->orWhere('slug', 'like', "%{$keyword}%");
                    });
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

    public function publicRecommendations()
    {
        return response()->json([
            'data' => $this->randomRecommendations(),
        ]);
    }

    public function storeSearch(Request $request)
    {
        $validated = $request->validate([
            'keyword' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        ProductSearch::query()->create([
            'user_id' => $request->user()->id,
            'keyword' => Str::lower(trim($validated['keyword'])),
        ]);

        return response()->json([
            'message' => 'Pencarian disimpan.',
        ], 201);
    }

    public function recommendations(Request $request)
    {
        $user = $request->user();

        $purchasedProductIds = OrderItem::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->whereNotNull('product_id')
            ->pluck('product_id')
            ->unique()
            ->values();

        $purchasedProducts = Product::query()
            ->with('category')
            ->whereIn('id', $purchasedProductIds)
            ->get();

        $products = Product::query()
            ->with('category')
            ->withSum('orderItems as sold_quantity', 'quantity')
            ->where('status', Product::STATUS_ACTIVE)
            ->whereNotIn('id', $purchasedProductIds)
            ->get();

        $purchasedCategoryIds = $purchasedProducts
            ->pluck('category_id')
            ->filter()
            ->unique();
        $hasLaptopPurchase = $purchasedProducts->contains(
            fn (Product $product) => $this->matchesAnyKeyword($product, [
                'laptop',
                'notebook',
                'macbook',
            ]),
        );

        $rankedProducts = $products
            ->map(function (Product $product) use (
                $hasLaptopPurchase,
                $purchasedCategoryIds
            ) {
                $score = 0;
                $reason = null;

                if ($purchasedCategoryIds->contains($product->category_id)) {
                    $score += 35;
                    $reason = 'Mirip dengan produk yang pernah dibeli';
                }

                if ($hasLaptopPurchase && $this->matchesAnyKeyword($product, [
                    'accessories',
                    'aksesoris',
                    'accessory',
                    'keyboard',
                    'mouse',
                    'mousepad',
                    'monitor',
                    'headset',
                    'ssd',
                    'storage',
                ])) {
                    $score += 85;
                    $reason = 'Pelengkap laptop Anda';
                }

                if ($score > 0) {
                    $score += min((int) ($product->sold_quantity ?? 0), 20);
                }

                return [
                    'product' => $product,
                    'score' => $score,
                    'reason' => $reason ?? 'Berdasarkan riwayat pembelian',
                ];
            })
            ->filter(fn (array $item) => $item['score'] > 0)
            ->sortByDesc('score')
            ->take(8)
            ->values();

        if ($rankedProducts->isEmpty()) {
            return response()->json([
                'data' => $this->randomRecommendations(),
            ]);
        }

        return response()->json([
            'data' => $rankedProducts
                ->map(fn (array $item) => [
                    ...$this->serializeProduct($item['product']),
                    'recommendationReason' => $item['reason'],
                ])
                ->values(),
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
                'gallery' => array_values(array_filter([
                    StoredImage::toPublicUrl($product->image_url),
                ])),
                'relatedProducts' => $relatedProducts
                    ->map(fn (Product $item) => $this->serializeProduct($item))
                    ->values(),
            ],
        ]);
    }

    private function randomRecommendations(int $limit = 8)
    {
        return Product::query()
            ->with('category')
            ->where('status', Product::STATUS_ACTIVE)
            ->inRandomOrder()
            ->take($limit)
            ->get()
            ->map(fn (Product $product) => [
                ...$this->serializeProduct($product),
                'recommendationReason' => 'Produk acak',
            ])
            ->values();
    }

    private function matchesAnyKeyword(Product $product, array $keywords): bool
    {
        $haystack = Str::lower(implode(' ', [
            $product->name,
            $product->description,
            $product->sku,
            $product->category?->nama_kategori,
            $product->category?->slug,
        ]));

        foreach ($keywords as $keyword) {
            if ($keyword !== '' && Str::contains($haystack, Str::lower($keyword))) {
                return true;
            }
        }

        return false;
    }
}
