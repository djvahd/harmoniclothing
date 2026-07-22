<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * 3.3_Module_Breakdown.md §6 Shared Component — used by Product
 * Customization (design uploads) and later Creator Management (design +
 * mockup uploads). 5.6_Security_Planning.md §5: random filename, never the
 * original upload name, to prevent path traversal/overwrite.
 */
class FileUploadService
{
    public function storeDesignFile(UploadedFile $file, string $directory = 'design-uploads'): string
    {
        // Extension derived from the server-detected MIME type, not the
        // client-supplied filename — the request's mimetypes rule already
        // confirmed the real content is PNG/SVG, so this stays consistent
        // with that check rather than trusting client-controlled metadata.
        $extension = $file->getMimeType() === 'image/svg+xml' ? 'svg' : 'png';
        $filename = Str::uuid().'.'.$extension;

        return $file->storeAs($directory, $filename, 'public');
    }

    public function url(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    /**
     * KYC documents (KTP photo) are sensitive ID data — stored on the
     * private 'local' disk, never given a public URL. Admin views it via
     * an authenticated streamed download instead (AdminCreatorController).
     */
    public function storeKycDocument(UploadedFile $file, string $directory = 'kyc-uploads'): string
    {
        $extension = $file->getMimeType() === 'image/png' ? 'png' : 'jpg';
        $filename = Str::uuid().'.'.$extension;

        return $file->storeAs($directory, $filename, 'local');
    }
}
