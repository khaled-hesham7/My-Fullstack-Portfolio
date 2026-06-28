<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * Standard success response structure.
     */
    protected function successResponse($data = null, ?string $message = null, int $code = 200, $meta = null): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message ?? __('messages.home_data_retrieved'),
            'data'    => $data ?? new \stdClass(),
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Standard paginated collection response structure.
     * Preserves frontend compatibility while guaranteeing 'success', 'message', 'data', and 'meta'.
     */
    protected function paginatedResponse(ResourceCollection $collection, ?string $message = null, int $code = 200): JsonResponse
    {
        $paginatedData = $collection->response()->getData(true);

        $items = $paginatedData['data'] ?? [];
        $meta = [
            'current_page' => $paginatedData['meta']['current_page'] ?? $paginatedData['current_page'] ?? 1,
            'last_page'    => $paginatedData['meta']['last_page'] ?? $paginatedData['last_page'] ?? 1,
            'per_page'     => $paginatedData['meta']['per_page'] ?? $paginatedData['per_page'] ?? count($items),
            'total'        => $paginatedData['meta']['total'] ?? $paginatedData['total'] ?? count($items),
        ];

        // Ensure payload.data contains items and pagination properties for dual-compatibility with admin dashboard frontend
        $dataPayload = array_merge(['data' => $items], $meta);

        return response()->json([
            'success' => true,
            'message' => $message ?? __('messages.home_data_retrieved'),
            'data'    => $dataPayload,
            'meta'    => $meta,
        ], $code);
    }

    /**
     * Standard error response structure.
     */
    protected function errorResponse(?string $message = null, int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message ?? __('messages.something_went_wrong'),
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
