<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AboutMeRequest extends FormRequest
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
            'title' => 'required|string|max:255' ,
            'description' => 'required|string' ,
            'image_file' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'cv_file' => 'nullable|mimes:pdf|max:5120',
            'general_cv' => 'nullable|mimes:pdf|max:5120',
            'cv_backend_file' => 'nullable|mimes:pdf|max:5120',
            'cv_qa_file' => 'nullable|mimes:pdf|max:5120',
            'backend_cv' => 'nullable|mimes:pdf|max:5120',
            'qa_cv' => 'nullable|mimes:pdf|max:5120',
            'delete_general_cv' => 'nullable|boolean',
            'delete_backend_cv' => 'nullable|boolean',
            'delete_qa_cv' => 'nullable|boolean',
        ];
    }
}
