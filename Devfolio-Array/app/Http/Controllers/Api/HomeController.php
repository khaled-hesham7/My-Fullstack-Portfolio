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
        $ip = request()->ip();

        $profile    = Profile::latest()->first();
        $SocialLink = SocialLink::latest()->get();

        // Projects: Fetch featured projects first, fallback to latest projects if none featured
        $Project = Project::where('is_featured', true)->latest()->take(6)->get();
        if ($Project->isEmpty()) {
            $Project = Project::latest()->take(6)->get();
        }

        // Articles: Fetch featured technical articles, fallback to latest technical articles, then any latest articles
        $articleQuery = Article::with(['author'])
            ->withCount(['likesRelation as likes_relation_count'])
            ->withExists(['likesRelation as is_liked' => function($query) use ($ip) {
                $query->where('ip_address', $ip);
            }]);

        $Article = (clone $articleQuery)
            ->where('is_featured', true)
            ->where(function($q) {
                $q->where('category', 'technical')->orWhereNull('category');
            })
            ->latest()
            ->take(6)
            ->get();

        if ($Article->isEmpty()) {
            $Article = (clone $articleQuery)
                ->where(function($q) {
                    $q->where('category', 'technical')->orWhereNull('category');
                })
                ->latest()
                ->take(6)
                ->get();
        }

        if ($Article->isEmpty()) {
            $Article = (clone $articleQuery)->latest()->take(6)->get();
        }

        return $this->successResponse(
            [
                'profile'      => $profile ? new ProfileResource($profile) : null,
                'SocialLink'   => SocialLinkResource::collection($SocialLink),
                'social_links' => SocialLinkResource::collection($SocialLink),
                'Project'      => ProjectResource::collection($Project),
                'projects'     => ProjectResource::collection($Project),
                'Article'      => ArticleResource::collection($Article),
                'articles'     => ArticleResource::collection($Article),
            ],
            __('messages.home_data_retrieved'),
            200
        );
    }
}
