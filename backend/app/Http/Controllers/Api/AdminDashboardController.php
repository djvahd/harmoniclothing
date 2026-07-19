<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardService;
use Illuminate\Http\JsonResponse;

/** GET /admin/dashboard — FE-042. */
class AdminDashboardController extends Controller
{
    public function __construct(private readonly AdminDashboardService $dashboard) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->dashboard->summary()]);
    }
}
