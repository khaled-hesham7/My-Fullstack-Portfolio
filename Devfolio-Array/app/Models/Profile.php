<?php

namespace App\Models;

use Spatie\MediaLibrary\HasMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;

class Profile extends Model implements HasMedia
{
    use InteractsWithMedia ;

    protected $table = '_profile_';

    protected $fillable = ['name', 'description', 'sub_title', 'skills', 'typewriter_text'];
}
