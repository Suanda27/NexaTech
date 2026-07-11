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
            'data' => $this->bestSellingRecommendations(),
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

        if ($purchasedProducts->isEmpty()) {
            return response()->json([
                'data' => $this->bestSellingRecommendations(),
            ]);
        }

        $relatedOrderIds = OrderItem::query()
            ->whereIn('product_id', $purchasedProductIds)
            ->pluck('order_id')
            ->unique()
            ->values();

        $coPurchasedCounts = OrderItem::query()
            ->selectRaw('product_id, SUM(quantity) as bought_together_count')
            ->whereIn('order_id', $relatedOrderIds)
            ->whereNotNull('product_id')
            ->whereNotIn('product_id', $purchasedProductIds)
            ->groupBy('product_id')
            ->pluck('bought_together_count', 'product_id');

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

        $complementaryKeywords = $purchasedProducts
            ->flatMap(fn (Product $product) => $this->complementaryKeywordsForProduct($product))
            ->unique()
            ->values()
            ->all();

        $buildItem = fn (Product $product, int $baseScore, string $reason, int $bonus = 0) => [
            'product' => $product,
            'score' => $baseScore
                + $bonus
                + min((int) ($product->sold_quantity ?? 0), 30)
                + ((int) round(((float) $product->rating) * 6)),
            'reason' => $reason,
        ];

        $crossSell = $products
            ->filter(fn (Product $product) => $this->matchesAnyKeyword($product, $complementaryKeywords))
            ->map(fn (Product $product) => $buildItem(
                $product,
                120,
                $hasLaptopPurchase ? 'Pelengkap laptop Anda' : 'Pelengkap produk Anda',
            ))
            ->sortByDesc('score')
            ->values();

        $oftenBoughtTogether = $products
            ->filter(fn (Product $product) => (int) ($coPurchasedCounts[$product->id] ?? 0) > 0)
            ->map(fn (Product $product) => $buildItem(
                $product,
                110,
                'Sering dibeli bersamaan',
                (int) ($coPurchasedCounts[$product->id] ?? 0) * 8,
            ))
            ->sortByDesc('score')
            ->values();

        $similar = $products
            ->filter(fn (Product $product) => $purchasedCategoryIds->contains($product->category_id))
            ->map(fn (Product $product) => $buildItem($product, 55, 'Mirip dengan pembelian Anda'))
            ->sortByDesc('score')
            ->values();

        $topRated = $products
            ->filter(fn (Product $product) => (float) $product->rating >= 4)
            ->map(fn (Product $product) => $buildItem($product, 45, 'Pilihan dengan rating tinggi'))
            ->sortByDesc('score')
            ->values();

        $goodValue = $products
            ->sortBy('price')
            ->take(12)
            ->map(fn (Product $product) => $buildItem($product, 35, 'Pilihan harga terbaik'))
            ->sortByDesc('score')
            ->values();

        $rankedProducts = $this->interleaveRecommendationBuckets([
            $crossSell,
            $oftenBoughtTogether,
            $topRated,
            $goodValue,
            $similar,
        ], 12);

        if ($rankedProducts->isEmpty()) {
            return response()->json([
                'data' => $this->bestSellingRecommendations(),
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

        $relatedProducts = $this->crossSellRecommendationsForProduct($product, 8)
            ->map(fn (array $item) => [
                ...$this->serializeProduct($item['product']),
                'recommendationReason' => $item['reason'],
            ]);

        return response()->json([
            'data' => [
                ...$this->serializeProduct($product, true),
                'gallery' => array_values(array_filter([
                    StoredImage::toPublicUrl($product->image_url),
                ])),
                'relatedProducts' => $relatedProducts->values(),
            ],
        ]);
    }

    private function bestSellingRecommendations(int $limit = 12)
    {
        return Product::query()
            ->with('category')
            ->withSum('orderItems as sold_quantity', 'quantity')
            ->where('status', Product::STATUS_ACTIVE)
            ->orderByDesc('sold_quantity')
            ->orderByDesc('rating')
            ->orderByDesc('stock')
            ->take($limit)
            ->get()
            ->map(fn (Product $product) => [
                ...$this->serializeProduct($product),
                'recommendationReason' => 'Produk terlaris',
            ])
            ->values();
    }

    /**
     * Shows complementary items first, with bestselling items as a guaranteed
     * fallback so a product page never has an empty recommendation area.
     */
    private function crossSellRecommendationsForProduct(Product $product, int $limit)
    {
        $candidates = Product::query()
            ->with('category')
            ->withSum('orderItems as sold_quantity', 'quantity')
            ->where('status', Product::STATUS_ACTIVE)
            ->whereKeyNot($product->id)
            ->get();

        $keywords = $this->complementaryKeywordsForProduct($product);
        $crossSell = $candidates
            ->filter(fn (Product $candidate) => $this->matchesAnyKeyword($candidate, $keywords))
            ->sortByDesc(fn (Product $candidate) => (int) ($candidate->sold_quantity ?? 0))
            ->map(fn (Product $candidate) => [
                'product' => $candidate,
                'reason' => 'Pelengkap '.$product->name,
            ]);

        $fallback = $candidates
            ->reject(fn (Product $candidate) => $this->matchesAnyKeyword($candidate, $keywords))
            ->sortByDesc(fn (Product $candidate) =>
                ((int) ($candidate->sold_quantity ?? 0) * 1000)
                + ((int) round((float) $candidate->rating) * 100)
                + min((int) $candidate->stock, 99)
            )
            ->map(fn (Product $candidate) => [
                'product' => $candidate,
                'reason' => 'Produk terlaris',
            ]);

        return $this->interleaveRecommendationBuckets([$crossSell, $fallback], $limit);
    }

    private function complementaryKeywordsForProduct(Product $product): array
    {
        $rules = [
            ['needles' => ['laptop', 'notebook', 'macbook'], 'complements' => [
                'accessories',
                'aksesoris',
                'keyboard',
                'mouse',
                'mousepad',
                'monitor',
                'headset',
                'ram',
                'memory',
                'ssd',
                'storage',
                'flashdisk',
                'cooler',
                'stand',
            ]],
            ['needles' => ['mousepad', 'mouse pad'], 'complements' => [
                'mouse',
                'keyboard',
                'monitor',
                'headset',
                'accessories',
                'aksesoris',
            ]],
            ['needles' => ['mouse'], 'complements' => [
                'mousepad',
                'mouse pad',
                'monitor',
                'keyboard',
                'headset',
                'accessories',
                'aksesoris',
            ]],
            ['needles' => ['keyboard'], 'complements' => [
                'mouse',
                'mousepad',
                'mouse pad',
                'wrist',
                'headset',
                'accessories',
                'aksesoris',
            ]],
            ['needles' => ['monitor'], 'complements' => [
                'keyboard',
                'mouse',
                'mousepad',
                'hdmi',
                'cable',
                'stand',
                'accessories',
                'aksesoris',
            ]],
            ['needles' => ['printer'], 'complements' => [
                'ink',
                'tinta',
                'paper',
                'kertas',
                'scanner',
                'storage',
            ]],
            ['needles' => ['ssd', 'storage', 'harddisk', 'hdd'], 'complements' => [
                'laptop',
                'pc',
                'enclosure',
                'adapter',
                'cable',
            ]],
        ];

        $keywords = [];

        foreach ($rules as $rule) {
            if ($this->matchesAnyKeyword($product, $rule['needles'])) {
                $keywords = array_merge($keywords, $rule['complements']);
            }
        }

        return array_values(array_unique($keywords ?: [
            'accessories',
            'aksesoris',
            'keyboard',
            'mouse',
            'mousepad',
            'monitor',
            'headset',
            'storage',
        ]));
    }

    private function interleaveRecommendationBuckets(array $buckets, int $limit)
    {
        $results = collect();
        $usedProductIds = collect();

        while ($results->count() < $limit) {
            $addedThisRound = false;

            foreach ($buckets as $bucket) {
                $nextItem = $bucket->first(
                    fn (array $item) => !$usedProductIds->contains($item['product']->id),
                );

                if (!$nextItem) {
                    continue;
                }

                $results->push($nextItem);
                $usedProductIds->push($nextItem['product']->id);
                $addedThisRound = true;

                if ($results->count() >= $limit) {
                    break;
                }
            }

            if (!$addedThisRound) {
                break;
            }
        }

        return $results->values();
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
