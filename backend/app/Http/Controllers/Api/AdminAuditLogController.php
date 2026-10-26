<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** GET /admin/audit-logs — 2.5_Permission_Matrix.md §10. */
class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate(['per_page' => ['sometimes', 'integer', 'min:1', 'max:100']]);

        $logs = AuditLog::query()
            ->with('actor')
            ->when($request->query('action'), fn ($query, $action) => $query->where('action', $action))
            ->latest()->latest('id')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'data' => AuditLogResource::collection($logs),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
