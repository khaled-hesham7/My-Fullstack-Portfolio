<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillGroupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
        'id'     => $this->id,
        'title'  => $this->title,
        'icon'   => $this->icon,
        'skills' => $this->skills, // Returns the skills array directly for the frontend
    ];
    
    }
}
