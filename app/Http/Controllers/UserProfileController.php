<?php

namespace App\Http\Controllers;

use App\Traits\FileUploadTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
{
    use FileUploadTrait;

    public function update(Request $request) {

        $request->validate([
            'avatar' => ['nullable', 'image', 'max:500'],
            'name' => ['required', 'string', 'max:50'],
            'user_id' => ['required', 'max:50', 'unique:users,username,'.auth()->user()->id],
            'email' => ['required', 'email', 'max:100'],
        ]);

        $avatarPath = $this->uploadFile($request, 'avatar');

        $user = Auth::user();

        if($avatarPath) {
            $user->avatar = $avatarPath;
        }

        $user->name = $request->name;
        $user->username = $request->user_id;
        $user->email = $request->email;

        if($request->filled('current_password')) {
            $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'min:8', 'confirmed']
            ]);

            $user->password = bcrypt($request->password);
        }

        /** @disregard P1013 */
        $user->save();

        notyf('Updated successfully!');

        return response(['message', 'Updated successfully!'], 200);
    }
}
