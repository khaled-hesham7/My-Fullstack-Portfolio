<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SkillGroupRequest extends FormRequest
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
            'title'   => 'required|string|max:255', // مثلاً: Backend Development
            'icon'    => 'nullable|string',        // كود الأيقونة أو اسمها للفرونت إند

            // هنا بنضمن إن الـ skills مبعوتة كـ Array ومش فاضية
            'skills'  => 'required|array|min:1',

            // بنضمن إن كل عنصر جوه الـ Array يكون نص (String)
            'skills.*' => 'required|string|max:50',
        ];
    }
}
