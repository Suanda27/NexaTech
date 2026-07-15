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
use Illuminate\Support\Collection;
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

        if (($validated['price'] ?? null) === 'lowest') {
            $query->orderBy('price', 'asc');
        } elseif (($validated['price'] ?? null) === 'highest') {
            $query->orderBy('price', 'desc');
        }

        if (($validated['sort'] ?? null) === 'best_selling') {
            $query->withSum('orderItems as sold_quantity', 'quantity')
                ->orderByDesc('sold_quantity');
        } elseif (($validated['sort'] ?? null) === 'a_z') {
            $query->orderBy('name');
        } else {
            $query->latest();
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
        $user  = $request->user();
        $limit = 8;

        // ── Step 1: Ambil history pembelian user ini ──────────────────────────
        $purchasedProductIds = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
            ->whereNotNull('product_id')
            ->pluck('product_id')
            ->unique()
            ->values();

        $purchasedCategoryIds = Product::query()
            ->whereIn('id', $purchasedProductIds)
            ->pluck('category_id')
            ->filter()
            ->unique()
            ->values();

        // Belum pernah beli → tampilkan random
        if ($purchasedCategoryIds->isEmpty()) {
            return response()->json([
                'data' => $this->randomRecommendations($limit),
            ]);
        }

        // ── Step 2: Co-purchase binary — cukup 1x kemunculan ─────────────────
        // Cari kategori-kategori yang pernah muncul di order yang sama
        // dengan kategori yang user ini pernah beli. Flat (binary), bukan frekuensi.
        $relatedOrderIds = OrderItem::query()
            ->whereNotNull('product_id')
            ->whereHas('product', fn ($q) => $q->whereIn('category_id', $purchasedCategoryIds))
            ->pluck('order_id')
            ->unique();

        /** @var Collection<int|string, bool> $coPurchaseCategoryIds */
        $coPurchaseCategoryIds = collect();

        if ($relatedOrderIds->isNotEmpty()) {
            $coPurchaseCategoryIds = OrderItem::query()
                ->whereIn('order_id', $relatedOrderIds)
                ->whereNotNull('product_id')
                ->whereHas('product', fn ($q) => $q->whereNotIn('category_id', $purchasedCategoryIds))
                ->with('product:id,category_id')
                ->get()
                ->pluck('product.category_id')
                ->filter()
                ->unique()
                ->flip(); // jadikan key untuk lookup O(1)
        }

        // ── Step 3: Ambil semua produk aktif yang belum dibeli user ──────────
        $candidates = Product::query()
            ->with('category')
            ->withSum('orderItems as sold_quantity', 'quantity')
            ->where('status', Product::STATUS_ACTIVE)
            ->whereNotIn('id', $purchasedProductIds)
            ->get();

        // ── Step 4: 4-Tier Flat Scoring ───────────────────────────────────────
        //
        //  TIER 1 (100): Cross-category + pernah co-purchase di toko (Pelengkap prioritas 1)
        //  TIER 2  (80): Cross-category + match semantic keyword (Pelengkap prioritas 2)
        //  TIER 3  (50): Same-category (Produk serupa)
        //  TIER 4  (20): Cross-category APAPUN (Kategori lain keseluruhan)
        //
        //  Popularity boost: max 10 — hanya sebagai tie-breaker dalam tier

        $scored = $candidates->map(function (Product $product) use (
            $coPurchaseCategoryIds,
            $purchasedCategoryIds,
        ) {
            $isCrossCategory = ! $purchasedCategoryIds->contains($product->category_id);
            $score           = 0;
            $reason          = null;

            if ($isCrossCategory) {
                // Tier 1 — co-purchase binary (flat, 1 kejadian sudah cukup)
                if ($coPurchaseCategoryIds->has($product->category_id)) {
                    $score  = 100;
                    $reason = 'Sering dibeli bersama';
                }

                // Tier 2 — semantic keyword match
                if ($score < 80) {
                    $semanticBoost = $this->semanticScore($product, $purchasedCategoryIds);
                    if ($semanticBoost > 0) {
                        $score  = max($score, 80);
                        $reason = $reason ?? 'Pelengkap pembelian Anda';
                    }
                }

                // Tier 4 — Kategori lain keseluruhan
                if ($score === 0) {
                    $score  = 20;
                    $reason = 'Produk pilihan untukmu';
                }
            } else {
                // Tier 3 — same-category (produk serupa)
                $score  = 50;
                $reason = 'Mirip pembelian Anda';
            }

            // Popularity tie-breaker kecil (max 10) — hanya menentukan urutan dalam tier
            $score += min((int) ($product->sold_quantity ?? 0), 10);

            return [
                'product' => $product,
                'score'   => $score,
                'reason'  => $reason,
            ];
        });

        // ── Step 5: Ambil produk teratas dengan Category Diversity ────────────
        // Batasi maksimal 2 produk per kategori agar rekomendasi lebih beragam.
        $topProducts = collect();
        $categoryCounts = [];
        
        $sortedScored = $scored->sortByDesc('score')->values();
        
        // Pass 1: Ambil maksimal 2 produk per kategori
        foreach ($sortedScored as $item) {
            $catId = $item['product']->category_id;
            $catIdKey = $catId ?? 'no_cat';
            if (!isset($categoryCounts[$catIdKey])) {
                $categoryCounts[$catIdKey] = 0;
            }
            
            if ($categoryCounts[$catIdKey] < 2) {
                $topProducts->push($item);
                $categoryCounts[$catIdKey]++;
            }
            
            if ($topProducts->count() >= $limit) {
                break;
            }
        }
        
        // Pass 2: Jika masih kurang dari batas, longgarkan batas kategori (ambil sisa)
        if ($topProducts->count() < $limit) {
            $pickedIds = $topProducts->pluck('product.id');
            foreach ($sortedScored as $item) {
                if ($topProducts->count() >= $limit) {
                    break;
                }
                if (!$pickedIds->contains($item['product']->id)) {
                    $topProducts->push($item);
                }
            }
        }

        // ── Step 6: Isi sisa slot dengan random jika produk aktif < limit ─────
        if ($topProducts->count() < $limit) {
            $needed     = $limit - $topProducts->count();
            $excludeIds = $topProducts
                ->pluck('product.id')
                ->merge($purchasedProductIds)
                ->unique()
                ->values();

            $fillers = Product::query()
                ->where('status', Product::STATUS_ACTIVE)
                ->whereNotIn('id', $excludeIds)
                ->inRandomOrder()
                ->take($needed)
                ->get()
                ->map(fn (Product $p) => [
                    'product' => $p,
                    'score'   => 0,
                    'reason'  => 'Produk pilihan untukmu',
                ]);

            $topProducts = $topProducts->concat($fillers)->values();
        }

        return response()->json([
            'data' => $topProducts
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

    private function randomRecommendations(int $limit = 8): Collection
    {
        return Product::query()
            ->with('category')
            ->where('status', Product::STATUS_ACTIVE)
            ->inRandomOrder()
            ->take($limit)
            ->get()
            ->map(fn (Product $product) => [
                ...$this->serializeProduct($product),
                'recommendationReason' => 'Produk pilihan untukmu',
            ])
            ->values();
    }

    /**
     * Semantic keyword fallback — bekerja tanpa data transaksi (cold start).
     * Menggunakan pola peran produk (primary device vs. aksesoris/peripheral)
     * untuk menduga keterkaitan, tanpa hardcode per nama kategori.
     *
     * @param  Collection<int, int|string>  $purchasedCategoryIds
     */
    private function semanticScore(Product $product, Collection $purchasedCategoryIds): int
    {
        // Keyword penanda "perangkat utama" (primary device)
        $primaryKeywords = [
            'laptop','notebook','macbook','ultrabook',
            'pc','komputer','computer','desktop',
            'smartphone','handphone','hp','iphone','android',
            'tablet','ipad',
            'monitor','display','screen','layar',
            'tv','televisi','television',
            'printer','scanner',
            'kamera','camera','dslr','mirrorless',
            'router','modem',
            'console','playstation','xbox','nintendo',
        ];

        // Keyword penanda "aksesoris / peripheral"
        $accessoryKeywords = [
            'aksesoris','accessories','accessory','peripheral',
            'mouse','keyboard','keypad','numpad',
            'headset','headphone','earphone','earbuds','speaker','audio',
            'mousepad','deskpad',
            'webcam','microphone','mic',
            'charger','adaptor','adapter','power adapter',
            'kabel','cable','hdmi','usb','type-c','lightning',
            'case','cover','casing','sleeve','bag','tas',
            'stand','holder','mount','bracket',
            'hub','dock','docking',
            'ssd','storage','flashdisk','hardisk','harddisk','memory','ram','sd card',
            'powerbank','power bank','baterai','battery',
            'cooling','cooler','fan','kipas',
            'tinta','ink','cartridge','toner','kertas','paper',
        ];

        $productIsPrimary   = $this->textMatchesKeywords(
            Str::lower(implode(' ', array_filter([
                $product->name,
                $product->description,
                $product->sku,
                $product->category?->nama_kategori,
                $product->category?->slug,
            ]))),
            $primaryKeywords
        );

        $productIsAccessory = $this->textMatchesKeywords(
            Str::lower(implode(' ', array_filter([
                $product->name,
                $product->description,
                $product->sku,
                $product->category?->nama_kategori,
                $product->category?->slug,
            ]))),
            $accessoryKeywords
        );

        // Tentukan peran kategori yang pernah dibeli user
        $userBoughtPrimary   = false;
        $userBoughtAccessory = false;

        foreach ($purchasedCategoryIds as $catId) {
            /** @var Category|null $cat */
            $cat = Category::find($catId);
            if (! $cat) {
                continue;
            }

            $haystack = Str::lower($cat->nama_kategori.' '.$cat->slug);

            if ($this->textMatchesKeywords($haystack, $primaryKeywords)) {
                $userBoughtPrimary = true;
            }

            if ($this->textMatchesKeywords($haystack, $accessoryKeywords)) {
                $userBoughtAccessory = true;
            }
        }

        // Cross-recommendation:
        // beli primary → rekomendasikan aksesoris
        if ($userBoughtPrimary && $productIsAccessory) {
            return 60;
        }
        // beli aksesoris → rekomendasikan primary device
        if ($userBoughtAccessory && $productIsPrimary) {
            return 45;
        }
        // beli aksesoris → rekomendasikan aksesoris lain yang berbeda kategori
        if ($userBoughtAccessory && $productIsAccessory) {
            return 30;
        }

        return 0;
    }

    /**
     * Cek apakah suatu teks mengandung salah satu keyword dari daftar.
     *
     * @param  array<int, string>  $keywords
     */
    private function textMatchesKeywords(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if ($keyword !== '' && Str::contains($text, Str::lower($keyword))) {
                return true;
            }
        }

        return false;
    }
}
