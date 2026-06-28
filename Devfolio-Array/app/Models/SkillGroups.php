<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillGroups extends Model
{
      protected $fillable = [
        'title',
        'icon',
       'skills'
    ];


    protected $casts = [
        'skills' => 'array' ,
    ];
}
