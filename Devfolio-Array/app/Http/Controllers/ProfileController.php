<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Http\Requests\ProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $profile = Profile::latest()->first();
        return $this->successResponse(
            $profile ? new ProfileResource($profile) : null,
            __('messages.profile_retrieved'),
            200
        );
    }

    public function store(ProfileRequest $request): JsonResponse
    {
        // Enforce singleton profile pattern
        $profile = Profile::latest()->first();
        if ($profile) {
            $profile->update($request->validated());
        } else {
            $profile = Profile::create($request->validated());
        }

        if ($request->hasFile('image')) {
            $profile->clearMediaCollection('profile_images');
            $profile->addMediaFromRequest('image')->toMediaCollection('profile_images');
        }

        return $this->successResponse(
            new ProfileResource($profile),
            __('messages.profile_saved'),
            200
        );
    }

    public function show($id): JsonResponse
    {
        $profile = Profile::findOrFail($id);
        return $this->successResponse(
            new ProfileResource($profile),
            __('messages.profile_retrieved'),
            200
        );
    }

    public function update(ProfileRequest $request, $id): JsonResponse
    {
        $profile = Profile::findOrFail($id);
        $profile->update($request->validated());

        if ($request->hasFile('image')) {
            $profile->clearMediaCollection('profile_images');
            $profile->addMediaFromRequest('image')
                    ->toMediaCollection('profile_images');
        }

        return $this->successResponse(
            new ProfileResource($profile),
            __('messages.profile_updated'),
            200
        );
    }

    public function destroy($id): JsonResponse
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.profile_deleted'),
            200
        );
    }
}
