<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SocialLinkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
return [
        'id' => $this->id,
        'platform' => $this->platform,
        'url' => $this->url,
        // Send the formatted Platform Label to the frontend
        'platform_name' => ucfirst($this->platform),
    ];    }
}
