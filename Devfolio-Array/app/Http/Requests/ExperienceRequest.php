<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'      => 'nullable|string|max:50',
            'job_title' => 'required|string|max:255',
            'company'   => 'nullable|string|max:255',
            'location'  => 'nullable|string|max:255',
            'duration'  => 'required|string|max:255',
            'tasks'     => 'nullable|array|min:1',
            'tasks.*'   => 'nullable|string',
        ];
    }
}
