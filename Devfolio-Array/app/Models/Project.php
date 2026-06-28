<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Project extends Model implements HasMedia
{
    use InteractsWithMedia;
       protected $fillable = [
        'title',
        'description',
        'github_link',
        'demo_link',
        'tags',
        'is_featured'
        ];

        protected $casts = [
            'tags' => 'array',
            'is_featured' => 'boolean'
        ];


  public function registerMediaCollections(): void
    {
        $this->addMediaCollection('project_images')->singleFile();
    }

}
