<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AdminAuditLogController;
use App\Http\Controllers\Api\AdminCatalogController;
use App\Http\Controllers\Api\AdminChatController;
use App\Http\Controllers\Api\AdminCreatorController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminDesignController;
use App\Http\Controllers\Api\AdminNotificationSettingController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminPaymentController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BiteshipWebhookController;
use App\Http\Controllers\Api\BulkPricingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CreatorController;
use App\Http\Controllers\Api\CreatorDesignController;
use App\Http\Controllers\Api\CustomizationController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
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
    Route::post('/account/photo', [AccountController::class, 'uploadPhoto']);
    Route::delete('/account/photo', [AccountController::class, 'removePhoto']);
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

    // 5.2_API_List.md §4 — /checkout (FE-027) and /checkout/bulk (FE-052/056, BR-026: separate flow, never mixed)
    Route::post('/checkout/shipping-rates', [CheckoutController::class, 'shippingRates']);
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout/bulk', [CheckoutController::class, 'storeBulk']);

    // 5.2_API_List.md §4 — /orders (FE-028/029/031), scope own
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{order}/reorder', [OrderController::class, 'reorder']);
    Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice']); // FR-018
    Route::post('/orders/{order}/confirm-received', [OrderController::class, 'confirmReceived']); // FR-042
    Route::post('/orders/{order}/reviews', [OrderController::class, 'storeReview']); // FR-027, BR-004

    // 5.2_API_List.md §4 — /notifications (FR-029), scope own
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // 5.2_API_List.md §4 — /chat/threads (FR-028), scope own, customer side
    Route::get('/chat/threads', [ChatController::class, 'index']);
    Route::get('/chat/threads/{thread}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/threads/{thread}/messages', [ChatController::class, 'storeMessage']);

    // 5.2_API_List.md §5 — Creator upgrade (FR-041/035)
    Route::post('/account/become-creator', [CreatorController::class, 'becomeCreator']);
    Route::post('/creator/verification', [CreatorController::class, 'verification']);

    // 5.2_API_List.md §5 — /creator/* proper, requires role:creator (status Aktif)
    Route::middleware('creator.active')->group(function () {
        Route::get('/creator/dashboard', [CreatorController::class, 'dashboard']); // FE-020
        Route::get('/creator/earnings', [CreatorController::class, 'earnings']); // FR-026

        // 5.2_API_List.md §5 — /creator/designs (FR-024/037, Flow 16)
        Route::get('/creator/designs', [CreatorDesignController::class, 'index']);
        Route::post('/creator/designs', [CreatorDesignController::class, 'store']);
        Route::patch('/creator/designs/{design}', [CreatorDesignController::class, 'update']);
        Route::post('/creator/designs/{design}/apparel/{product}/confirm', [CreatorDesignController::class, 'confirmApparel']);
        Route::post('/creator/designs/{design}/submit', [CreatorDesignController::class, 'submit']);
    });
});

// 5.3_API_Specification.md §8 — POST /webhooks/midtrans, signature-verified not session-auth
Route::post('/webhooks/midtrans', [MidtransWebhookController::class, 'handle']);

// FE-035 auto tracking — Biteship tracking webhook
Route::post('/webhooks/biteship', [BiteshipWebhookController::class, 'handle']);

// 5.2_API_List.md §3 — Product Catalog & Marketplace (public, read-only)
Route::get('/catalog/products', [CatalogController::class, 'index']);
Route::get('/catalog/products/filters', [CatalogController::class, 'filters']);
Route::get('/catalog/products/{slug}', [CatalogController::class, 'show']);
Route::get('/catalog/products/{slug}/reviews', [CatalogController::class, 'reviews']); // 5.4
Route::get('/marketplace/designs', [MarketplaceController::class, 'index']);
Route::get('/marketplace/designs/filters', [MarketplaceController::class, 'designFilters']);
Route::get('/marketplace/designs/{slug}', [MarketplaceController::class, 'show']);
Route::get('/marketplace/designs/{slug}/reviews', [MarketplaceController::class, 'designReviews']); // 5.4
Route::get('/marketplace/creators', [MarketplaceController::class, 'indexCreators']);
Route::get('/marketplace/creators/{slug}', [MarketplaceController::class, 'showCreator']); // FE-011

// 5.2_API_List.md §4 — GET /bulk-pricing-tiers, public (BR-012)
Route::get('/bulk-pricing-tiers', [BulkPricingController::class, 'index']);

// 5.2_API_List.md §6 — Admin APIs, requires role:admin (scope all)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']); // FE-042
    Route::get('/users', [AdminUserController::class, 'index']); // FR-030

    Route::get('/creators', [AdminCreatorController::class, 'index']); // daftar aktif/banned, untuk aksi Ban
    Route::get('/creators/pending', [AdminCreatorController::class, 'pending']);
    Route::get('/creators/{creatorProfile}/kyc-document', [AdminCreatorController::class, 'kycDocument']);
    Route::post('/creators/{creatorProfile}/approve', [AdminCreatorController::class, 'approve']); // BR-001/008
    Route::post('/creators/{creatorProfile}/reject', [AdminCreatorController::class, 'reject']);
    Route::post('/creators/{creatorProfile}/ban', [AdminCreatorController::class, 'ban']); // BR-019/020/023

    Route::get('/designs/pending', [AdminDesignController::class, 'pending']); // FR-025
    Route::post('/designs/{design}/approve', [AdminDesignController::class, 'approve']); // BR-002
    Route::post('/designs/{design}/reject', [AdminDesignController::class, 'reject']); // BR-028

    Route::get('/catalog/products', [AdminCatalogController::class, 'index']); // admin management list (gap-filled)
    Route::post('/catalog/products', [AdminCatalogController::class, 'storeProduct']); // FR-031
    Route::patch('/catalog/products/{product}', [AdminCatalogController::class, 'updateProduct']);
    Route::post('/catalog/products/{product}/variants', [AdminCatalogController::class, 'storeVariant']); // FE-046
    Route::patch('/catalog/variants/{variant}', [AdminCatalogController::class, 'updateVariant']); // FE-046
    Route::post('/catalog/mockup-upload', [AdminCatalogController::class, 'uploadMockup']); // FE-046
    Route::post('/catalog/bulk-pricing-tiers', [AdminCatalogController::class, 'storeBulkPricingTier']); // BR-012

    Route::get('/orders', [AdminOrderController::class, 'index']); // admin management list (gap-filled)
    Route::get('/production-queue', [AdminOrderController::class, 'productionQueue']); // FR-021
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']); // FR-021
    Route::post('/orders/{order}/reject', [AdminOrderController::class, 'reject']); // FR-043

    Route::get('/payments', [AdminPaymentController::class, 'index']); // FR-032
    Route::post('/orders/{order}/shipment', [AdminOrderController::class, 'bookShipment']); // FR-022

    Route::get('/chat/threads', [AdminChatController::class, 'index']); // FE-041
    Route::get('/chat/threads/{thread}/messages', [AdminChatController::class, 'messages']);
    Route::post('/chat/threads/{thread}/messages', [AdminChatController::class, 'storeMessage']);

    Route::get('/notification-settings', [AdminNotificationSettingController::class, 'index']); // FE-038
    Route::patch('/notification-settings/{type}', [AdminNotificationSettingController::class, 'update']);

    Route::get('/reports/sales', [AdminReportController::class, 'sales']); // FR-033
    Route::get('/audit-logs', [AdminAuditLogController::class, 'index']); // 2.5_Permission_Matrix.md §10
});
