<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
      public function rules(): array
    {
        return [
        'title'         => 'required|string|max:255',
        'description'   => 'required|string',
        'github_link'   => 'nullable|url',
        'demo_link'     => 'nullable|url',
        'tags'          => 'required|array',
        'tags.*'        => 'string', // للتأكد إن كل عنصر في المصفوفة هو نص
        'project_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        'is_featured'   => 'nullable|boolean',
    ];
    }
}
