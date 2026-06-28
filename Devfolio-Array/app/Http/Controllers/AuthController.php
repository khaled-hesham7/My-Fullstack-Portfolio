<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(
            ['user' => new UserResource($user)],
            __('messages.registered_successfully'),
            201
        );
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse(__('messages.invalid_credentials'), 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse(
            [
                'user'  => new UserResource($user),
                'token' => $token,
            ],
            __('messages.logged_in_successfully'),
            200
        );
    }

    public function user(Request $request)
    {
        return $this->successResponse(
            new UserResource($request->user()),
            __('messages.user_retrieved'),
            200
        );
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.logged_out_successfully'),
            200
        );
    }
}
