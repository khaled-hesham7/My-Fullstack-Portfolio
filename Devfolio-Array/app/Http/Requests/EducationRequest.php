<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'        => 'nullable|string|max:100',
            'degree'      => 'required|string|max:255',
            'university'  => 'nullable|string|max:255',
            'location'    => 'nullable|string|max:255',
            'duration'    => 'nullable|string|max:255',
            'grade'       => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ];
    }
}
