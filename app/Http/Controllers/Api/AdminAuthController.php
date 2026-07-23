<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', mb_strtolower(trim($data['email'])))
            ->where('is_active', true)
            ->first();

        if (! $admin || ! Hash::check($data['password'], $admin->password_hash)) {
            throw ValidationException::withMessages([
                'email' => 'Identifiants incorrects.',
            ]);
        }

        $admin->update(['last_login_at' => now()]);

        $request->session()->regenerate();
        $request->session()->put('admin_id', $admin->id);
        $request->session()->put('admin_email', $admin->email);
        $request->session()->put('admin_name', $admin->full_name);
        $request->session()->put('admin_role', $admin->role);

        return response()->json([
            'id' => $admin->id,
            'full_name' => $admin->full_name,
            'email' => $admin->email,
            'role' => $admin->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget(['admin_id', 'admin_email', 'admin_name', 'admin_role']);
        $request->session()->regenerate();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'id' => $request->session()->get('admin_id'),
            'full_name' => $request->session()->get('admin_name'),
            'email' => $request->session()->get('admin_email'),
            'role' => $request->session()->get('admin_role'),
        ]);
    }
}
