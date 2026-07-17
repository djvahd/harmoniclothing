<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Address;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** 5.2_API_List.md §2 — /account/* (profile & address book, FR-004/FR-048). */
class AccountController extends Controller
{
    public function __construct(private readonly AccountService $account) {}

    /** PATCH /account/profile */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->account->updateProfile($request->user(), $request->validated());

        return response()->json(['data' => new UserResource($user)]);
    }

    /** GET /account/addresses */
    public function indexAddresses(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->account->listAddresses($request->user()),
        ]);
    }

    /** POST /account/addresses */
    public function storeAddress(AddressRequest $request): JsonResponse
    {
        $address = $this->account->createAddress($request->user(), $request->validated());

        return response()->json(['data' => $address], 201);
    }

    /** PATCH /account/addresses/{address} */
    public function updateAddress(AddressRequest $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        $address = $this->account->updateAddress($address, $request->validated());

        return response()->json(['data' => $address]);
    }

    /** DELETE /account/addresses/{address} */
    public function destroyAddress(Request $request, Address $address): JsonResponse
    {
        $this->authorize('delete', $address);

        $this->account->deleteAddress($address);

        return response()->json(['data' => null]);
    }
}
