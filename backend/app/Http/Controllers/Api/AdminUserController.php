<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** GET /admin/users — FR-030; PATCH /admin/users/{user}/status (#52). */
class AdminUserController extends Controller
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly AuditLogService $auditLog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate(['per_page' => ['sometimes', 'integer', 'min:1', 'max:100']]);

        $users = $this->users->paginate(
            $request->only(['role', 'status', 'search']),
            (int) $request->query('per_page', 20),
        );

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /** Deactivate/reactivate a customer or creator account; admins (incl. self) and banned accounts are off-limits. */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $status = $request->validate([
            'status' => ['required', Rule::in([UserStatus::Aktif->value, UserStatus::Nonaktif->value])],
        ])['status'];

        abort_if($user->role === UserRole::Admin, 403, __('messages.admin_user.cannot_change_admin'));
        abort_if($user->status === UserStatus::Banned, 422, __('messages.admin_user.banned'));

        if ($user->status->value !== $status) {
            // 'status' isn't in User's #[Fillable] list — forceFill, as CreatorService::ban does.
            $user->forceFill(['status' => $status])->save();

            if ($status === UserStatus::Nonaktif->value) {
                $user->tokens()->delete();
            }

            $this->auditLog->record(
                $request->user(),
                $status === UserStatus::Nonaktif->value ? 'user.deactivate' : 'user.activate',
                $user,
            );
        }

        return response()->json(['data' => new UserResource($user->fresh())]);
    }
}
