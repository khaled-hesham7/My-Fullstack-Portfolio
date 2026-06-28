<?php

namespace App\Models;

use Spatie\MediaLibrary\HasMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;

class Cv extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'cvs';

    protected $fillable = ['title'];
}
