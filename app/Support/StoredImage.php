<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Illuminate\Validation\ValidationException;

class StoredImage
{
    public const DISK = 'public';
    public const MAX_BYTES = 5242880;
    protected const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    public static function isDataUrl(?string $value): bool
    {
        return is_string($value) && Str::startsWith($value, 'data:image/');
    }

    public static function isStoredPath(?string $value): bool
    {
        $value = self::normalizeStorageUrlToPath($value);

        return is_string($value)
            && $value !== ''
            && !Str::startsWith($value, ['data:', 'http://', 'https://', '/']);
    }

    public static function toPublicUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (!self::isStoredPath($value)) {
            return $value;
        }

        return Storage::disk(self::DISK)->url($value);
    }

    public static function validateInput(?string $value, string $attribute = 'image'): void
    {
        $value = self::normalizeStorageUrlToPath($value);

        if ($value === null || $value === '') {
            return;
        }

        if (self::isDataUrl($value)) {
            self::validateDataUrl($value, $attribute);

            return;
        }

        if (Str::startsWith($value, ['http://', 'https://', '/storage/'])) {
            return;
        }

        if (self::isStoredPath($value) && preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $value)) {
            return;
        }

        throw ValidationException::withMessages([
            $attribute => ['Format gambar tidak valid. Gunakan file gambar yang didukung.'],
        ]);
    }

    public static function sync(?string $incomingValue, string $directory, ?string $currentValue = null): ?string
    {
        $incomingValue = self::normalizeStorageUrlToPath($incomingValue);
        $currentValue = self::normalizeStorageUrlToPath($currentValue);

        self::validateInput($incomingValue);

        if ($incomingValue === null || $incomingValue === '') {
            self::delete($currentValue);

            return null;
        }

        if (self::isDataUrl($incomingValue)) {
            $storedPath = self::storeDataUrl($incomingValue, $directory);
            self::delete($currentValue);

            return $storedPath;
        }

        return $incomingValue;
    }

    public static function storeDataUrl(string $dataUrl, string $directory): string
    {
        if (!preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s', $dataUrl, $matches)) {
            throw new RuntimeException('Invalid image data URL.');
        }

        $mimeType = strtolower($matches[1]);
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new RuntimeException('Unsupported image mime type.');
        }

        $decoded = base64_decode($matches[2], true);

        if ($decoded === false) {
            throw new RuntimeException('Invalid base64 image content.');
        }

        if (strlen($decoded) > self::MAX_BYTES) {
            throw new RuntimeException('Image file is too large.');
        }

        $extension = self::extensionForMime($mimeType);
        $path = trim($directory, '/').'/'.Str::uuid().'.'.$extension;

        Storage::disk(self::DISK)->put($path, $decoded);

        return $path;
    }

    public static function delete(?string $value): void
    {
        $value = self::normalizeStorageUrlToPath($value);

        if (!self::isStoredPath($value)) {
            return;
        }

        Storage::disk(self::DISK)->delete($value);
    }

    protected static function normalizeStorageUrlToPath(?string $value): ?string
    {
        if (!is_string($value) || $value === '') {
            return $value;
        }

        if (Str::startsWith($value, '/storage/')) {
            return ltrim(Str::after($value, '/storage/'), '/');
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            $path = parse_url($value, PHP_URL_PATH);

            if (is_string($path) && Str::startsWith($path, '/storage/')) {
                return ltrim(Str::after($path, '/storage/'), '/');
            }
        }

        return $value;
    }

    protected static function extensionForMime(string $mimeType): string
    {
        return match ($mimeType) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'png',
        };
    }

    protected static function validateDataUrl(string $value, string $attribute): void
    {
        if (!preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s', $value, $matches)) {
            throw ValidationException::withMessages([
                $attribute => ['Format gambar tidak valid.'],
            ]);
        }

        $mimeType = strtolower($matches[1]);
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw ValidationException::withMessages([
                $attribute => ['Tipe gambar tidak didukung.'],
            ]);
        }

        $decoded = base64_decode($matches[2], true);
        if ($decoded === false) {
            throw ValidationException::withMessages([
                $attribute => ['Isi gambar tidak valid.'],
            ]);
        }

        if (strlen($decoded) > self::MAX_BYTES) {
            throw ValidationException::withMessages([
                $attribute => ['Ukuran gambar maksimal 5 MB.'],
            ]);
        }
    }
}
