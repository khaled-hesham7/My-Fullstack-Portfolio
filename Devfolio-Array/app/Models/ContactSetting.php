<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactSetting extends Model
{
    protected $table = 'contact_settings';

    protected $fillable = [
        'emails',
        'phones',
        'locations',
    ];

    protected $casts = [
        'emails' => 'array',
        'phones' => 'array',
        'locations' => 'array',
    ];
}
