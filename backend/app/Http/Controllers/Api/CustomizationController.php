<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDesignFileRequest;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;

/**
 * FR-010 / FE-015/016 — Product Customization "mode custom" own-design
 * upload. Stateless: no DB row here, the returned path is later attached to
 * a cart_item's custom_design_file_path once Order Management's cart exists.
 */
class CustomizationController extends Controller
{
    public function __construct(private readonly FileUploadService $uploads) {}

    /** POST /customization/uploads */
    public function uploadDesign(UploadDesignFileRequest $request): JsonResponse
    {
        $path = $this->uploads->storeDesignFile($request->file('file'));

        return response()->json([
            'data' => [
                'path' => $path,
                'url' => $this->uploads->url($path),
            ],
        ], 201);
    }
}
