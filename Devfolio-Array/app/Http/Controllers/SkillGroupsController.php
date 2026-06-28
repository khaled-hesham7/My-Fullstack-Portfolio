<?php

namespace App\Http\Controllers;

use App\Models\SkillGroups;
use App\Http\Requests\SkillGroupRequest;
use App\Http\Resources\SkillGroupResource;
use App\Traits\ApiResponse;

class SkillGroupsController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $groups = SkillGroups::latest()->paginate(10);
        return $this->paginatedResponse(
            SkillGroupResource::collection($groups),
            __('messages.skill_groups_retrieved'),
            200
        );
    }

    public function store(SkillGroupRequest $request)
    {
        $data = $request->validated();

        $group = SkillGroups::create([
            'title'  => $data['title'],
            'icon'   => $data['icon'],
            'skills' => $data['skills'],
        ]);

        return $this->successResponse(
            new SkillGroupResource($group),
            __('messages.skill_group_created'),
            201
        );
    }

    public function update(SkillGroupRequest $request, $id)
    {
        $group = SkillGroups::findOrFail($id);
        $group->update($request->validated());

        return $this->successResponse(
            new SkillGroupResource($group),
            __('messages.skill_group_updated'),
            200
        );
    }

    public function destroy($id)
    {
        $group = SkillGroups::findOrFail($id);
        $group->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.skill_group_deleted'),
            200
        );
    }

    public function show($id)
    {
        $group = SkillGroups::findOrFail($id);
        return $this->successResponse(
            new SkillGroupResource($group),
            __('messages.skill_group_retrieved'),
            200
        );
    }
}
