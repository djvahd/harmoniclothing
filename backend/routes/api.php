<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BulkPricingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomizationController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

// 5.2_API_List.md §2 Authentication APIs
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('/verify-email/resend', [AuthController::class, 'resendVerification']);

    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    // 5.2_API_List.md §2 — /account/* (User Management: profile & address book)
    Route::patch('/account/profile', [AccountController::class, 'updateProfile']);
    Route::get('/account/addresses', [AccountController::class, 'indexAddresses']);
    Route::post('/account/addresses', [AccountController::class, 'storeAddress']);
    Route::patch('/account/addresses/{address}', [AccountController::class, 'updateAddress']);
    Route::delete('/account/addresses/{address}', [AccountController::class, 'destroyAddress']);

    // FR-010 / FE-015 — Product Customization own-design upload (not
    // enumerated in 5.2_API_List.md, filled per the "not all ~62 endpoints
    // are enumerated" scope note in 5.3_API_Specification.md §intro)
    Route::post('/customization/uploads', [CustomizationController::class, 'uploadDesign']);

    // 5.2_API_List.md §3 — /cart (FE-025), scope own
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::patch('/cart/{item}', [CartController::class, 'update']);
    Route::delete('/cart/{item}', [CartController::class, 'destroy']);

    // 5.2_API_List.md §3 — /wishlist (FE-030), scope own
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{item}', [WishlistController::class, 'destroy']);

    // 5.2_API_List.md §4 — /checkout (FE-027), /checkout/bulk (FE-052/056)
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout/bulk', [CheckoutController::class, 'storeBulk']);
});

// 5.2_API_List.md §3 — Product Catalog & Marketplace (public, read-only)
Route::get('/catalog/products', [CatalogController::class, 'index']);
Route::get('/catalog/products/{slug}', [CatalogController::class, 'show']);
Route::get('/marketplace/designs', [MarketplaceController::class, 'index']);
Route::get('/marketplace/designs/{slug}', [MarketplaceController::class, 'show']);

// 5.2_API_List.md §4 — GET /bulk-pricing-tiers, public (BR-012)
Route::get('/bulk-pricing-tiers', [BulkPricingController::class, 'index']);
