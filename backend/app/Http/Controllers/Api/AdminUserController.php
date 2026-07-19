<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** GET /admin/users — FR-030. */
class AdminUserController extends Controller
{
    public function __construct(private readonly UserRepository $users) {}

    public function index(Request $request): JsonResponse
    {
        $users = $this->users->paginate(
            $request->only(['role', 'status']),
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
}
