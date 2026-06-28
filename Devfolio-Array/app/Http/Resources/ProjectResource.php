<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
            return [
                    'id'          => $this->id,
                    'title'       => $this->title,
                    'description' => $this->description,
                    'github_link' => $this->github_link,
                    'demo_link'   => $this->demo_link,
                    'tags'        => $this->tags,
                    // Get the project image URL using Spatie Media Library
                    'image_url'   => $this->getFirstMediaUrl('project_images'),
                    'is_featured' => (bool)$this->is_featured,
                    'created_at'  => $this->created_at->format('Y-m-d'),
            ];
      }
}
