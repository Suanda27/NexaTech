<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\StoredImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    use SerializesStoreData;

    public function index()
    {
        $categories = Category::query()
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
            'summary' => [
                'totalCategories' => $categories->count(),
                'totalProducts' => Schema::hasTable('products')
                    ? $categories->sum('products_count')
                    : 0,
                'activeCategories' => $categories->where('is_active', true)->count(),
                'inactiveCategories' => $categories->where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,nama_kategori'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);
        StoredImage::validateInput($validated['image_url'] ?? null, 'image_url');

        $category = Category::query()->create([
            'nama_kategori' => $validated['name'],
            'slug' => $this->makeUniqueSlug($validated['name']),
            'deskripsi' => $validated['description'] ?? null,
            'image_url' => StoredImage::sync(
                $validated['image_url'] ?? null,
                'catalog/categories',
            ),
            'is_active' => $validated['status'] === 'active',
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $this->serializeCategory(
                Schema::hasTable('products') ? $category->loadCount('products') : $category
            ),
        ], 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'nama_kategori')->ignore($category->category_id, 'category_id'),
            ],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);
        StoredImage::validateInput($validated['image_url'] ?? null, 'image_url');

        $category->update([
            'nama_kategori' => $validated['name'],
            'slug' => $this->makeUniqueSlug($validated['name'], $category->category_id),
            'deskripsi' => $validated['description'] ?? null,
            'image_url' => StoredImage::sync(
                $validated['image_url'] ?? null,
                'catalog/categories',
                $category->image_url,
            ),
            'is_active' => $validated['status'] === 'active',
        ]);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $this->serializeCategory(
                Schema::hasTable('products') ? $category->fresh()->loadCount('products') : $category->fresh()
            ),
        ]);
    }

    public function destroy(Category $category)
    {
        StoredImage::delete($category->image_url);
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }

    protected function makeUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'category';
        $slug = $baseSlug;
        $suffix = 1;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('category_id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
