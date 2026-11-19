<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AboutResource extends JsonResource
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
            'image_url'   => $this->getFirstMediaUrl('profile_images'),
            'cv_url'      => $this->getFirstMediaUrl('general_cv') ?: $this->getFirstMediaUrl('cvs'),
            'general_cv_url' => $this->getFirstMediaUrl('general_cv') ?: $this->getFirstMediaUrl('cvs'),
            'cv_backend_url' => $this->getFirstMediaUrl('backend_cv'),
            'cv_qa_url'   => $this->getFirstMediaUrl('qa_cv'),
            'backend_cv_url' => $this->getFirstMediaUrl('backend_cv'),
            'qa_cv_url'   => $this->getFirstMediaUrl('qa_cv'),
            'updated_at'  => $this->updated_at?->format('Y-m-d'),
        ];
    }
}
