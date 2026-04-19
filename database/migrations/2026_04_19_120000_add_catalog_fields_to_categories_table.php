<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('categories')) {
            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'slug')) {
                $table->string('slug')->nullable()->after('nama_kategori');
            }

            if (!Schema::hasColumn('categories', 'image_url')) {
                $table->longText('image_url')->nullable()->after('deskripsi');
            }

            if (!Schema::hasColumn('categories', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('image_url');
            }
        });

        $categories = DB::table('categories')
            ->select('category_id', 'nama_kategori', 'slug', 'is_active')
            ->get();

        $usedSlugs = [];

        foreach ($categories as $category) {
            $slug = $category->slug;

            if (blank($slug)) {
                $baseSlug = Str::slug($category->nama_kategori) ?: 'category';
                $slug = $baseSlug;
                $suffix = 1;

                while (in_array($slug, $usedSlugs, true) || DB::table('categories')
                    ->where('slug', $slug)
                    ->where('category_id', '!=', $category->category_id)
                    ->exists()) {
                    $slug = $baseSlug.'-'.$suffix;
                    $suffix++;
                }
            }

            $usedSlugs[] = $slug;

            DB::table('categories')
                ->where('category_id', $category->category_id)
                ->update([
                    'slug' => $slug,
                    'is_active' => $category->is_active ?? true,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['slug', 'image_url', 'is_active']);
        });
    }
};
