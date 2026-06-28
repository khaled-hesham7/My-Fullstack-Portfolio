<?php

namespace App\Http\Controllers\Api;

use App\Models\AboutMe;
use App\Models\Education;
use App\Models\Experiences;
use App\Models\SkillGroups;
use App\Models\Cv;
use App\Http\Controllers\Controller;
use App\Http\Resources\AboutResource;
use App\Http\Resources\EducationResource;
use App\Http\Resources\ExperienceResource;
use App\Http\Resources\SkillGroupResource;
use App\Http\Resources\CvResource;
use App\Traits\ApiResponse;

class AboutMeLandingPageController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $about      = AboutMe::first();
        $skills     = SkillGroups::all();
        $experience = Experiences::all();
        $education  = Education::all();
        $cvs        = Cv::latest()->get();

        return $this->successResponse(
            [
                'about'      => $about ? new AboutResource($about) : null,
                'skills'     => SkillGroupResource::collection($skills),
                'experience' => ExperienceResource::collection($experience),
                'education'  => EducationResource::collection($education),
                'cvs'        => CvResource::collection($cvs),
            ],
            __('messages.landing_data_retrieved'),
            200
        );
    }
}
