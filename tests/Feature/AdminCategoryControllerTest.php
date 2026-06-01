<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_categories_with_summary(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $activeCategory = Category::query()->create([
            'nama_kategori' => 'Laptop',
            'slug' => 'laptop',
            'deskripsi' => 'Kategori laptop',
            'image_url' => 'data:image/png;base64,abc',
            'is_active' => true,
        ]);

        $inactiveCategory = Category::query()->create([
            'nama_kategori' => 'Monitor',
            'slug' => 'monitor',
            'is_active' => false,
        ]);

        Product::query()->create([
            'category_id' => $activeCategory->category_id,
            'sku' => 'SKU-001',
            'name' => 'NexaBook Air',
            'slug' => 'nexabook-air',
            'description' => 'Laptop ringan',
            'price' => 12000000,
            'stock' => 4,
            'status' => Product::STATUS_ACTIVE,
            'rating' => 5,
        ]);

        Product::query()->create([
            'category_id' => $inactiveCategory->category_id,
            'sku' => 'SKU-002',
            'name' => 'NexaView',
            'slug' => 'nexaview',
            'description' => 'Monitor kerja',
            'price' => 3000000,
            'stock' => 2,
            'status' => Product::STATUS_ACTIVE,
            'rating' => 4,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/categories');

        $response
            ->assertOk()
            ->assertJsonPath('summary.totalCategories', 2)
            ->assertJsonPath('summary.totalProducts', 2)
            ->assertJsonPath('summary.activeCategories', 1)
            ->assertJsonPath('summary.inactiveCategories', 1)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_category(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/categories', [
                'name' => 'Keyboard',
                'description' => 'Perangkat input',
                'image_url' => 'data:image/png;base64,abc',
                'status' => 'active',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Keyboard')
            ->assertJsonPath('data.slug', 'keyboard')
            ->assertJsonPath('data.statusKey', 'active');

        $this->assertDatabaseHas('categories', [
            'nama_kategori' => 'Keyboard',
            'slug' => 'keyboard',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $category = Category::query()->create([
            'nama_kategori' => 'Audio',
            'slug' => 'audio',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/categories/{$category->category_id}", [
                'name' => 'Audio Premium',
                'description' => 'Perangkat audio premium',
                'image_url' => null,
                'status' => 'inactive',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Audio Premium')
            ->assertJsonPath('data.slug', 'audio-premium')
            ->assertJsonPath('data.statusKey', 'inactive');

        $this->assertDatabaseHas('categories', [
            'category_id' => $category->category_id,
            'nama_kategori' => 'Audio Premium',
            'slug' => 'audio-premium',
            'is_active' => false,
        ]);
    }

    public function test_deleting_category_sets_related_products_to_uncategorized(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $category = Category::query()->create([
            'nama_kategori' => 'Tablet',
            'slug' => 'tablet',
            'image_url' => 'catalog/categories/tablet.png',
            'is_active' => true,
        ]);

        Storage::disk('public')->put('catalog/categories/tablet.png', 'tablet-image');

        $product = Product::query()->create([
            'category_id' => $category->category_id,
            'sku' => 'SKU-003',
            'name' => 'NexaTab',
            'slug' => 'nexatab',
            'description' => 'Tablet harian',
            'price' => 4500000,
            'stock' => 3,
            'status' => Product::STATUS_ACTIVE,
            'rating' => 5,
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/categories/{$category->category_id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Kategori berhasil dihapus.');

        $this->assertDatabaseMissing('categories', [
            'category_id' => $category->category_id,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'category_id' => null,
        ]);

        Storage::disk('public')->assertMissing('catalog/categories/tablet.png');
    }
}
