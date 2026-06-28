<?php

namespace App\Http\Controllers;

use App\Models\SocialLink;
use App\Http\Requests\SocialLinkRequest;
use App\Http\Resources\SocialLinkResource;
use App\Traits\ApiResponse;

class SocialLinkController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->successResponse(
            SocialLinkResource::collection(SocialLink::all()),
            __('messages.social_links_retrieved'),
            200
        );
    }

    public function store(SocialLinkRequest $request)
    {
        $link = SocialLink::create($request->validated());

        return $this->successResponse(
            new SocialLinkResource($link),
            __('messages.social_link_created'),
            201
        );
    }

    public function destroy($id)
    {
        $link = SocialLink::findOrFail($id);
        $link->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.social_link_deleted'),
            200
        );
    }

    public function getPlatforms()
    {
        $platforms = [
            'khamsat', 'mostaql', 'upwork', 'fiverr', 'freelancer',
            'hackerrank', 'codeforces', 'leetcode', 'codewars', 'hackerearth',
            'github', 'linkedin', 'stackoverflow', 'discord',
            'facebook', 'instagram', 'twitter', 'whatsapp', 'telegram', 'tiktok', 'snapchat',
            'behance', 'dribbble', 'youtube', 'medium', 'pinterest', 'website'
        ];

        return $this->successResponse(
            $platforms,
            __('messages.platforms_retrieved'),
            200
        );
    }
}
