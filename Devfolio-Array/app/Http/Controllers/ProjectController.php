<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Traits\ApiResponse;

class ProjectController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $projects = Project::latest()->paginate(6);
        return $this->paginatedResponse(
            ProjectResource::collection($projects),
            __('messages.projects_retrieved'),
            200
        );
    }

    public function store(ProjectRequest $request)
    {
        $project = Project::create($request->validated());

        if ($request->hasFile('project_image')) {
            $project->clearMediaCollection('project_images');
            $project->addMediaFromRequest('project_image')
                    ->toMediaCollection('project_images');
        }

        return $this->successResponse(
            new ProjectResource($project),
            __('messages.project_created'),
            201
        );
    }

    public function show($id)
    {
        $project = Project::findOrFail($id);
        return $this->successResponse(
            new ProjectResource($project),
            __('messages.project_retrieved'),
            200
        );
    }

    public function update(ProjectRequest $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->validated());

        if ($request->hasFile('project_image')) {
            $project->clearMediaCollection('project_images');
            $project->addMediaFromRequest('project_image')
                    ->toMediaCollection('project_images');
        }

        return $this->successResponse(
            new ProjectResource($project),
            __('messages.project_updated'),
            200
        );
    }

    public function toggleFeatured($id)
    {
        $project = Project::findOrFail($id);
        $project->is_featured = !$project->is_featured;
        $project->save();

        return $this->successResponse(
            new ProjectResource($project),
            __('messages.project_updated'),
            200
        );
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.project_deleted'),
            200
        );
    }
}
