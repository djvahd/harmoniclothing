<?php

use Illuminate\Support\Facades\Route;

// API-only backend: the site itself is the Next.js frontend, so the root
// path just identifies the service instead of rendering a view.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'ok',
]));
