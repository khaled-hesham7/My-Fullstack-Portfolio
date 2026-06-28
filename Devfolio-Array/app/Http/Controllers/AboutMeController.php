<?php

namespace App\Http\Controllers;

use App\Http\Requests\AboutMeRequest;
use App\Models\AboutMe;
use App\Http\Resources\AboutResource;
use App\Traits\ApiResponse;

class AboutMeController extends Controller
{
    use ApiResponse;

    public function storeOrUpdate(AboutMeRequest $request)
    {
        $data = $request->validated();

        $about = AboutMe::updateOrCreate(
            ['id' => 1],
            [
                'title'       => $data['title'],
                'description' => $data['description'],
            ]
        );

        if ($request->boolean('delete_general_cv')) {
            $about->clearMediaCollection('general_cv');
            $about->clearMediaCollection('cvs');
        }
        if ($request->boolean('delete_backend_cv')) {
            $about->clearMediaCollection('backend_cv');
        }
        if ($request->boolean('delete_qa_cv')) {
            $about->clearMediaCollection('qa_cv');
        }

        if ($request->hasFile('image_file')) {
            $about->addMediaFromRequest('image_file')
                  ->toMediaCollection('profile_images');
        }

        if ($request->hasFile('general_cv')) {
            $about->clearMediaCollection('general_cv');
            $about->clearMediaCollection('cvs');
            $about->addMediaFromRequest('general_cv')
                  ->toMediaCollection('general_cv');
        } elseif ($request->hasFile('cv_file')) {
            $about->clearMediaCollection('general_cv');
            $about->clearMediaCollection('cvs');
            $about->addMediaFromRequest('cv_file')
                  ->toMediaCollection('general_cv');
        }

        if ($request->hasFile('backend_cv')) {
            $about->clearMediaCollection('backend_cv');
            $about->addMediaFromRequest('backend_cv')
                  ->toMediaCollection('backend_cv');
        }

        if ($request->hasFile('qa_cv')) {
            $about->clearMediaCollection('qa_cv');
            $about->addMediaFromRequest('qa_cv')
                  ->toMediaCollection('qa_cv');
        }

        return $this->successResponse(
            new AboutResource($about),
            __('messages.about_saved_successfully'),
            200
        );
    }

    public function show()
    {
        $about = AboutMe::first();

        if (!$about) {
            return $this->errorResponse(__('messages.about_not_found'), 404);
        }

        return $this->successResponse(
            new AboutResource($about),
            __('messages.about_retrieved_successfully'),
            200
        );
    }
}
