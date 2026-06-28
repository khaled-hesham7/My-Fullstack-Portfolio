<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiences extends Model
{

    protected $fillable = [
        'job_title',
        'company',
        'location',
        'duration',
        'tasks'
       ];


       protected $casts = ['tasks' => 'array'];



       }
