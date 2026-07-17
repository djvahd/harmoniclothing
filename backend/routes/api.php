<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
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
});
