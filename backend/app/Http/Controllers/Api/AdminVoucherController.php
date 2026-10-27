<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VoucherRequest;
use App\Http\Resources\VoucherResource;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Admin voucher management (#98). Vouchers are deactivated, never deleted, so past orders keep their reference. */
class AdminVoucherController extends Controller
{
    public function __construct(private readonly VoucherService $vouchers) {}

    /** GET /admin/vouchers */
    public function index(Request $request): JsonResponse
    {
        $page = Voucher::query()
            ->withCount('redemptions')
            ->latest('id')
            ->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json([
            'data' => VoucherResource::collection($page),
            'meta' => [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    /** POST /admin/vouchers */
    public function store(VoucherRequest $request): JsonResponse
    {
        $voucher = $this->vouchers->create($request->validated(), $request->user());

        return response()->json(['data' => new VoucherResource($voucher)], 201);
    }

    /** PATCH /admin/vouchers/{voucher} */
    public function update(VoucherRequest $request, Voucher $voucher): JsonResponse
    {
        $voucher = $this->vouchers->update($voucher, $request->validated(), $request->user());

        return response()->json(['data' => new VoucherResource($voucher)]);
    }
}
