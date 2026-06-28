<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

     return [
        'id'              => $this->id,
        'name'            => $this->name,
        'description'     => $this->description,
        'sub_title'       => $this->sub_title,
        'skills'          => $this->skills,
        'typewriter_text' => $this->typewriter_text,
        'image_url'       => $this->getFirstMediaUrl('profile_images'),
    ];


    }
}
