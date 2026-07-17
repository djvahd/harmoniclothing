<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WishlistRequest;
use App\Http\Resources\WishlistResource;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §3 — /wishlist (FE-030), scope own. */
class WishlistController extends Controller
{
    public function __construct(private readonly WishlistService $wishlist) {}

    /** GET /wishlist */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => WishlistResource::collection($this->wishlist->list($request->user())),
        ]);
    }

    /** POST /wishlist */
    public function store(WishlistRequest $request): JsonResponse
    {
        $item = $this->wishlist->add($request->user(), $request->validated());

        return response()->json(['data' => new WishlistResource($item)], 201);
    }

    /** DELETE /wishlist/{item} — scoped to the user's own wishlist, 404s on a foreign id. */
    public function destroy(Request $request, int $item): JsonResponse
    {
        $wishlistItem = $request->user()->wishlists()->findOrFail($item);
        $this->wishlist->remove($wishlistItem);

        return response()->json(['data' => null]);
    }
}
