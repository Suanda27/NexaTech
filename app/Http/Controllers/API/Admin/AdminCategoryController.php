<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\API\Concerns\SerializesStoreData;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    use SerializesStoreData;

    public function index()
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('nama_kategori')
            ->get();

        return response()->json([
            'data' => $categories
                ->map(fn (Category $category) => $this->serializeCategory($category))
                ->values(),
            'summary' => [
                'totalCategories' => $categories->count(),
                'totalProducts' => $categories->sum('products_count'),
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

        $category = Category::query()->create([
            'nama_kategori' => $validated['name'],
            'slug' => $this->makeUniqueSlug($validated['name']),
            'deskripsi' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_active' => $validated['status'] === 'active',
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $this->serializeCategory($category->loadCount('products')),
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

        $category->update([
            'nama_kategori' => $validated['name'],
            'slug' => $this->makeUniqueSlug($validated['name'], $category->category_id),
            'deskripsi' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_active' => $validated['status'] === 'active',
        ]);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $this->serializeCategory($category->fresh()->loadCount('products')),
        ]);
    }

    public function destroy(Category $category)
    {
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
