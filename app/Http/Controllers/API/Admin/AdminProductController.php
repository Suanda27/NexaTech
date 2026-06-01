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

    public function index()
    {
        $products = Product::query()
            ->with(['category', 'specifications'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $products
                ->map(fn (Product $product) => $this->serializeProduct($product, true))
                ->values(),
            'summary' => [
                'totalProducts' => $products->count(),
                'totalInventoryValue' => $products->sum(
                    fn (Product $product) => $product->price * $product->stock,
                ),
                'totalStock' => $products->sum('stock'),
                'activeProducts' => $products->where('status', Product::STATUS_ACTIVE)->count(),
                'lowStockProducts' => $products->filter(
                    fn (Product $product) => $product->isLowStock(),
                )->count(),
                'outOfStockProducts' => $products->filter(
                    fn (Product $product) => $product->isOutOfStock(),
                )->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateProduct($request);

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
