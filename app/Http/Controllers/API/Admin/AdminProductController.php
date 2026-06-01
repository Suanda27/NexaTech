<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\StoredImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    use SerializesStoreData;

    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive,out_of_stock'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $summaryQuery = Product::query();
        $productsQuery = Product::query()
            ->with(['category', 'specifications'])
            ->latest();

        if (!empty($validated['q'])) {
            $keyword = trim($validated['q']);

            $productsQuery->where(function ($query) use ($keyword) {
                $query
                    ->where('name', 'like', "%{$keyword}%")
                    ->orWhere('sku', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        if (!empty($validated['category'])) {
            $categoryFilter = $validated['category'];

            $productsQuery->whereHas('category', function ($query) use ($categoryFilter) {
                $query
                    ->where('nama_kategori', $categoryFilter)
                    ->orWhere('slug', $categoryFilter)
                    ->orWhere('category_id', $categoryFilter);
            });
        }

        if (!empty($validated['status'])) {
            $productsQuery->where('status', $validated['status']);
        }

        $products = $productsQuery->paginate($validated['per_page'] ?? 10);
        $summary = $summaryQuery
            ->selectRaw('COUNT(*) as total_products')
            ->selectRaw('COALESCE(SUM(price * stock), 0) as total_inventory_value')
            ->selectRaw('COALESCE(SUM(stock), 0) as total_stock')
            ->selectRaw(
                "SUM(CASE WHEN status = '".Product::STATUS_ACTIVE."' THEN 1 ELSE 0 END) as active_products"
            )
            ->selectRaw(
                "SUM(CASE WHEN stock > 0 AND stock <= ".Product::LOW_STOCK_THRESHOLD." THEN 1 ELSE 0 END) as low_stock_products"
            )
            ->selectRaw(
                'SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_products'
            )
            ->first();

        return response()->json([
            'data' => $products->getCollection()
                ->map(fn (Product $product) => $this->serializeProduct($product, true))
                ->values(),
            'summary' => [
                'totalProducts' => (int) ($summary->total_products ?? 0),
                'totalInventoryValue' => (int) ($summary->total_inventory_value ?? 0),
                'totalStock' => (int) ($summary->total_stock ?? 0),
                'activeProducts' => (int) ($summary->active_products ?? 0),
                'lowStockProducts' => (int) ($summary->low_stock_products ?? 0),
                'outOfStockProducts' => (int) ($summary->out_of_stock_products ?? 0),
            ],
            'meta' => [
                'currentPage' => $products->currentPage(),
                'lastPage' => $products->lastPage(),
                'perPage' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProduct($request);
        StoredImage::validateInput($validated['image_url'] ?? null, 'image_url');

        $product = DB::transaction(function () use ($validated) {
            $product = Product::query()->create([
                'category_id' => $validated['category_id'] ?? null,
                'sku' => $validated['sku'],
                'name' => $validated['name'],
                'slug' => $this->makeUniqueSlug($validated['name']),
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'status' => $this->normalizeStatus($validated['status'], $validated['stock']),
                'rating' => $validated['rating'],
                'image_url' => StoredImage::sync(
                    $validated['image_url'] ?? null,
                    'catalog/products',
                ),
            ]);

            $this->syncSpecifications($product, $validated['specs'] ?? []);

            return $product;
        });

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $this->serializeProduct($product->load(['category', 'specifications']), true),
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $this->validateProduct($request, $product);
        StoredImage::validateInput($validated['image_url'] ?? null, 'image_url');

        DB::transaction(function () use ($product, $validated) {
            $product->update([
                'category_id' => $validated['category_id'] ?? null,
                'sku' => $validated['sku'],
                'name' => $validated['name'],
                'slug' => $this->makeUniqueSlug($validated['name'], $product->id),
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'stock' => $validated['stock'],
                'status' => $this->normalizeStatus($validated['status'], $validated['stock']),
                'rating' => $validated['rating'],
                'image_url' => StoredImage::sync(
                    $validated['image_url'] ?? null,
                    'catalog/products',
                    $product->image_url,
                ),
            ]);

            $product->specifications()->delete();
            $this->syncSpecifications($product, $validated['specs'] ?? []);
        });

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $this->serializeProduct($product->fresh()->load(['category', 'specifications']), true),
        ]);
    }

    public function destroy(Product $product)
    {
        StoredImage::delete($product->image_url);
        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    protected function validateProduct(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,category_id'],
            'sku' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:active,inactive,out_of_stock'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'image_url' => ['nullable', 'string'],
            'specs' => ['nullable', 'array'],
            'specs.*.label' => ['required', 'string', 'max:255'],
            'specs.*.value' => ['required', 'string', 'max:255'],
            'specs.*.description' => ['nullable', 'string'],
            'specs.*.icon' => ['required', 'string', 'max:50'],
        ]);
    }

    protected function syncSpecifications(Product $product, array $specs): void
    {
        foreach (array_values($specs) as $index => $spec) {
            $product->specifications()->create([
                'label' => $spec['label'],
                'value' => $spec['value'],
                'description' => $spec['description'] ?? null,
                'icon' => $spec['icon'],
                'sort_order' => $index,
            ]);
        }
    }

    protected function normalizeStatus(string $status, int $stock): string
    {
        if ($stock === 0) {
            return Product::STATUS_OUT_OF_STOCK;
        }

        return $status === Product::STATUS_OUT_OF_STOCK
            ? Product::STATUS_INACTIVE
            : $status;
    }

    protected function makeUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            Product::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
