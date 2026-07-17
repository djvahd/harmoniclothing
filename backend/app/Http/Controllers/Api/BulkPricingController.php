<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BulkPricingTierResource;
use App\Models\BulkPricingTier;
use Illuminate\Http\JsonResponse;

/** 5.2_API_List.md §4 — GET /bulk-pricing-tiers, public (BR-012). */
class BulkPricingController extends Controller
{
    public function index(): JsonResponse
    {
        $tiers = BulkPricingTier::query()->orderBy('min_qty')->get();

        return response()->json(['data' => BulkPricingTierResource::collection($tiers)]);
    }
}
