<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'phone' => 'nullable|string',
            'address' => 'nullable|string'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => User::ROLE_USER,
        ]);

        return response()->json([
            'message' => 'Register success',
            'user' => $user,
        ], 201);
    }

    // LOGIN (TOKEN BASED)
    public function login(Request $request)
    {
        [$user, $token] = $this->attemptLogin($request);

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function adminLogin(Request $request)
    {
        [$user, $token] = $this->attemptLogin($request, User::ROLE_ADMIN);

        return response()->json([
            'message' => 'Login admin berhasil',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * @return array{0: \App\Models\User, 1: string}
     */
    protected function attemptLogin(Request $request, ?string $requiredRole = null): array
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($requiredRole !== null && $user->role !== $requiredRole) {
            throw ValidationException::withMessages([
                'email' => ['Akun ini tidak punya akses ke halaman admin.'],
            ]);
        }

        $abilities = $user->isAdmin() ? ['admin'] : ['customer'];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return [$user, $token];
    }
}
