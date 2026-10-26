<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SalesReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** GET /admin/reports/sales — FR-033. */
class AdminReportController extends Controller
{
    public function __construct(private readonly SalesReportService $reports) {}

    public function sales(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
        ]);

        return response()->json(['data' => $this->reports->generate($data['from'] ?? null, $data['to'] ?? null)]);
    }
}
