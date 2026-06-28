<?php

namespace App\Http\Controllers;

use App\Models\Cv;
use App\Http\Requests\CvRequest;
use App\Http\Resources\CvResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class CvController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse(
            CvResource::collection(Cv::latest()->get()),
            __('messages.cvs_retrieved'),
            200
        );
    }

    public function store(CvRequest $request): JsonResponse
    {
        $cv = Cv::create($request->validated());

        if ($request->hasFile('file')) {
            $cv->addMediaFromRequest('file')->toMediaCollection('cv_files');
        }

        return $this->successResponse(
            new CvResource($cv),
            __('messages.cv_created'),
            201
        );
    }

    public function show($id): JsonResponse
    {
        $cv = Cv::findOrFail($id);
        return $this->successResponse(
            new CvResource($cv),
            __('messages.cv_retrieved'),
            200
        );
    }

    public function update(CvRequest $request, $id): JsonResponse
    {
        $cv = Cv::findOrFail($id);
        $cv->update($request->validated());

        if ($request->hasFile('file')) {
            $cv->clearMediaCollection('cv_files');
            $cv->addMediaFromRequest('file')->toMediaCollection('cv_files');
        }

        return $this->successResponse(
            new CvResource($cv),
            __('messages.cv_updated'),
            200
        );
    }

    public function destroy($id): JsonResponse
    {
        $cv = Cv::findOrFail($id);
        $cv->clearMediaCollection('cv_files');
        $cv->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.cv_deleted'),
            200
        );
    }
}
