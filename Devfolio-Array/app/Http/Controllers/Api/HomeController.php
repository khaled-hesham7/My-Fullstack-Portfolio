<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\SocialLinkResource;
use App\Models\Article;
use App\Models\Profile;
use App\Models\Project;
use App\Models\SocialLink;
use App\Traits\ApiResponse;

class HomeController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profile    = Profile::latest()->first();
        $SocialLink = SocialLink::latest()->paginate(10);
        $Project    = Project::where('is_featured', true)->latest()->paginate(6);
        $Article    = Article::where('is_featured', true)->latest()->paginate(6);

        return $this->successResponse(
            [
                'profile'    => $profile ? new ProfileResource($profile) : null,
                'SocialLink' => SocialLinkResource::collection($SocialLink),
                'Project'    => ProjectResource::collection($Project),
                'Article'    => ArticleResource::collection($Article),
            ],
            __('messages.home_data_retrieved'),
            200
        );
    }
}
