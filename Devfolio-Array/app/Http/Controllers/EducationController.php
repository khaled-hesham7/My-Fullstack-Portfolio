<?php

namespace App\Http\Controllers;

use App\Models\Education;
use App\Http\Requests\EducationRequest;
use App\Http\Resources\EducationResource;
use App\Traits\ApiResponse;

class EducationController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $educations = Education::latest()->paginate(10);
        return $this->paginatedResponse(
            EducationResource::collection($educations),
            __('messages.education_history_retrieved'),
            200
        );
    }

    public function store(EducationRequest $request)
    {
        $education = Education::create($request->validated());

        return $this->successResponse(
            new EducationResource($education),
            __('messages.education_created'),
            201
        );
    }

    public function show($id)
    {
        $education = Education::findOrFail($id);
        return $this->successResponse(
            new EducationResource($education),
            __('messages.education_retrieved'),
            200
        );
    }

    public function update(EducationRequest $request, $id)
    {
        $education = Education::findOrFail($id);
        $education->update($request->validated());

        return $this->successResponse(
            new EducationResource($education),
            __('messages.education_updated'),
            200
        );
    }

    public function destroy($id)
    {
        $education = Education::findOrFail($id);
        $education->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.education_deleted'),
            200
        );
    }
}
