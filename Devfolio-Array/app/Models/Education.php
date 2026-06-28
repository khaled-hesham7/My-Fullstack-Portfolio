<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'educations';
    protected $fillable = [
        'type',
        'degree',
        'university',
        'location',
        'duration',
        'grade',
        'description'
    ];
}
