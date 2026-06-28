<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\Experiences;
use App\Traits\ApiResponse;

class ExperiencesController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $experiences = Experiences::latest()->paginate(5);
        return $this->paginatedResponse(
            ExperienceResource::collection($experiences),
            __('messages.experiences_retrieved'),
            200
        );
    }

    public function store(ExperienceRequest $request)
    {
        $experience = Experiences::create($request->validated());

        return $this->successResponse(
            new ExperienceResource($experience),
            __('messages.experience_created'),
            201
        );
    }

    public function show($id)
    {
        $experience = Experiences::findOrFail($id);
        return $this->successResponse(
            new ExperienceResource($experience),
            __('messages.experience_retrieved'),
            200
        );
    }

    public function update(ExperienceRequest $request, $id)
    {
        $experience = Experiences::findOrFail($id);
        $experience->update($request->validated());

        return $this->successResponse(
            new ExperienceResource($experience),
            __('messages.experience_updated'),
            200
        );
    }

    public function destroy($id)
    {
        $experience = Experiences::findOrFail($id);
        $experience->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.experience_deleted'),
            200
        );
    }
}
