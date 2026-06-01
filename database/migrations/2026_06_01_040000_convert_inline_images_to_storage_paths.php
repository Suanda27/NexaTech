<?php

use App\Support\StoredImage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->convertTable(
            table: 'categories',
            keyColumn: 'category_id',
            imageColumn: 'image_url',
            directory: 'catalog/categories',
            chunkSize: 5,
        );

        $this->convertTable(
            table: 'products',
            keyColumn: 'id',
            imageColumn: 'image_url',
            directory: 'catalog/products',
            chunkSize: 5,
        );

        $this->convertTable(
            table: 'order_items',
            keyColumn: 'id',
            imageColumn: 'product_image_url',
            directory: 'catalog/order-items',
            chunkSize: 2,
        );

        $this->convertTable(
            table: 'orders',
            keyColumn: 'id',
            imageColumn: 'payment_proof',
            directory: 'payment-proofs',
            chunkSize: 1,
        );
    }

    public function down(): void
    {
        // Konversi ini bersifat satu arah untuk mengurangi payload base64 di database.
    }

    protected function convertTable(
        string $table,
        string $keyColumn,
        string $imageColumn,
        string $directory,
        int $chunkSize = 10,
    ): void {
        DB::table($table)
            ->select([$keyColumn, $imageColumn])
            ->whereNotNull($imageColumn)
            ->orderBy($keyColumn)
            ->chunkById($chunkSize, function ($rows) use ($table, $keyColumn, $imageColumn, $directory): void {
                foreach ($rows as $row) {
                    $value = $row->{$imageColumn};

                    if (!StoredImage::isDataUrl($value)) {
                        continue;
                    }

                    $storedPath = StoredImage::storeDataUrl($value, $directory);

                    DB::table($table)
                        ->where($keyColumn, $row->{$keyColumn})
                        ->update([
                            $imageColumn => $storedPath,
                        ]);

                    unset($storedPath, $value);
                }

                unset($rows);
                gc_collect_cycles();
            }, $keyColumn);
    }
};
