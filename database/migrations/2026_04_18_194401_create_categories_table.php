<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id('category_id');
                $table->string('nama_kategori');
                $table->text('deskripsi')->nullable();
                $table->timestamps();
            });

            return;
        }

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'category_id')) {
                $table->id('category_id');
            }

            if (!Schema::hasColumn('categories', 'nama_kategori')) {
                $table->string('nama_kategori');
            }

            if (!Schema::hasColumn('categories', 'deskripsi')) {
                $table->text('deskripsi')->nullable();
            }

            if (!Schema::hasColumn('categories', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (!Schema::hasColumn('categories', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
