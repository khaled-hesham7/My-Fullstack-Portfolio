<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactMessageRequest;
use App\Models\ContactMessage;
use App\Models\ContactSetting;
use App\Http\Resources\ContactMessageResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the contact messages (Admin).
     */
    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->paginate(10);
        
        return $this->paginatedResponse(
            ContactMessageResource::collection($messages),
            __('messages.contact_messages_retrieved'),
            200
        );
    }

    /**
     * Store a newly created contact message in storage (Public).
     */
    public function store(ContactMessageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['ip_address'] = $request->ip();

        $message = ContactMessage::create($data);

        return $this->successResponse(
            new ContactMessageResource($message),
            __('messages.contact_message_sent'),
            201
        );
    }

    /**
     * Display the specified contact message (Admin).
     */
    public function show($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        
        return $this->successResponse(
            new ContactMessageResource($message),
            __('messages.contact_message_retrieved'),
            200
        );
    }

    /**
     * Remove the specified contact message from storage (Admin).
     */
    public function destroy($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.contact_message_deleted'),
            200
        );
    }

    /**
     * Get the current contact settings (Public & Admin).
     */
    public function getSettings(): JsonResponse
    {
        $settings = ContactSetting::firstOrCreate([], [
            'emails' => [
                ['label' => 'Personal', 'email' => 'khaled.hesham.elsayed@gmail.com'],
                ['label' => 'Work', 'email' => 'work@khaledhesham.com']
            ],
            'phones' => [
                ['label' => 'Personal', 'phone' => '+201007201178']
            ],
            'locations' => [
                ['address' => 'Arad Al-lewaa, Giza Governorate, Egypt', 'gps_link' => 'https://maps.google.com/?q=Arad+Al-lewaa,+Giza,+Egypt']
            ]
        ]);

        return $this->successResponse(
            $settings,
            __('messages.contact_settings_retrieved'),
            200
        );
    }

    /**
     * Update the contact settings (Admin).
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'emails'               => 'nullable|array',
            'emails.*.label'       => 'required|string',
            'emails.*.email'       => 'required|email',
            'phones'               => 'nullable|array',
            'phones.*.label'       => 'required|string',
            'phones.*.phone'       => 'required|string',
            'locations'            => 'nullable|array',
            'locations.*.address'  => 'required|string',
            'locations.*.gps_link' => 'nullable|string',
        ]);

        $settings = ContactSetting::first();
        if (!$settings) {
            $settings = new ContactSetting();
        }

        $settings->emails = $request->input('emails', []);
        $settings->phones = $request->input('phones', []);
        $settings->locations = $request->input('locations', []);
        $settings->save();

        return $this->successResponse(
            $settings,
            __('messages.contact_settings_updated'),
            200
        );
    }
}
