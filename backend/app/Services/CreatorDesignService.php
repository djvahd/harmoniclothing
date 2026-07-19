<?php

namespace App\Services;

use App\Models\Design;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * FR-024 CRUD desain milik Creator, FR-037 multi-apparel confirm, Flow 16 submit.
 *
 * No thumbnail generation library is installed (no Intervention Image etc.
 * in composer.json) — thumbnail_path reuses the uploaded file's own path
 * rather than adding a new dependency for real thumbnailing, which is out
 * of scope for this pass.
 */
class CreatorDesignService
{
    public function __construct(
        private readonly FileUploadService $uploads,
        private readonly NotificationService $notifications,
        private readonly AuditLogService $auditLog,
    ) {}

    public function list(User $user): Collection
    {
        return $user->designs()->with(['category', 'products'])->latest()->get();
    }

    public function create(User $user, array $data): Design
    {
        $path = $this->uploads->storeDesignFile($data['file'], 'creator-designs');

        $design = Design::create([
            'creator_id' => $user->id,
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => $this->generateSlug($data['title']),
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'thumbnail_path' => $path,
            'status' => 'draft',
        ]);

        $design->products()->attach($data['product_ids']);

        return $design->load('products');
    }

    /** BR-028: a rejected design is revised in place, not resubmitted from scratch. */
    public function update(Design $design, array $data): Design
    {
        if ($design->status !== 'ditolak') {
            throw ValidationException::withMessages([
                'status' => ['Desain hanya dapat direvisi selama status Ditolak.'],
            ]);
        }

        if (array_key_exists('file', $data)) {
            $path = $this->uploads->storeDesignFile($data['file'], 'creator-designs');
            $data['file_path'] = $path;
            $data['thumbnail_path'] = $path;
        }

        $design->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'file_path' => $data['file_path'] ?? $design->file_path,
            'thumbnail_path' => $data['thumbnail_path'] ?? $design->thumbnail_path,
            'rejection_reason' => null,
        ]);

        $design->products()->sync(
            collect($data['product_ids'])->mapWithKeys(fn ($id) => [$id => ['preview_confirmed_at' => null]])
        );

        return $design->fresh('products');
    }

    /** FR-037: Creator confirms the design's placement preview on one apparel product. */
    public function confirmApparel(Design $design, int $productId): Design
    {
        $design->products()->updateExistingPivot($productId, ['preview_confirmed_at' => now()]);

        return $design->fresh('products');
    }

    /** Ids of apparel not yet preview-confirmed — Flow 16 precondition for submit(). */
    public function unconfirmedApparelIds(Design $design): array
    {
        return $design->products()->wherePivotNull('preview_confirmed_at')->pluck('products.id')->all();
    }

    /** 5.3_API_Specification.md §8: precondition already checked by the caller. */
    public function submit(Design $design): Design
    {
        $design->update(['status' => 'menunggu_approval']);

        return $design;
    }

    /** GET /admin/designs/pending — FR-025. */
    public function pending(): Collection
    {
        return Design::query()->where('status', 'menunggu_approval')->with(['creator', 'category'])->latest()->get();
    }

    /** POST /admin/designs/{id}/approve — BR-002. */
    public function approve(Design $design, User $admin): Design
    {
        if ($design->status !== 'menunggu_approval') {
            throw ValidationException::withMessages([
                'status' => ['Desain ini tidak sedang menunggu approval.'],
            ]);
        }

        $design->update([
            'status' => 'aktif',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        $this->notifications->notify(
            $design->creator,
            'design.approved',
            'Desain disetujui',
            "Desain \"{$design->title}\" telah disetujui dan tayang di marketplace.",
            $design,
        );
        $this->auditLog->record($admin, 'design.approve', $design);

        return $design;
    }

    /** POST /admin/designs/{id}/reject — reason wajib, BR-028 (revisable via update()). */
    public function reject(Design $design, User $admin, string $reason): Design
    {
        if ($design->status !== 'menunggu_approval') {
            throw ValidationException::withMessages([
                'status' => ['Desain ini tidak sedang menunggu approval.'],
            ]);
        }

        $design->update([
            'status' => 'ditolak',
            'rejection_reason' => $reason,
        ]);

        $this->notifications->notify(
            $design->creator,
            'design.rejected',
            'Desain ditolak',
            "Desain \"{$design->title}\" ditolak: {$reason}",
            $design,
        );
        $this->auditLog->record($admin, 'design.reject', $design, $reason);

        return $design;
    }

    private function generateSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;

        while (Design::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-".$suffix++;
        }

        return $slug;
    }
}
