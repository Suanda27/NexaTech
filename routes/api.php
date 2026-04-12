<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

// 🔓 PUBLIC ROUTES
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// 🔒 PROTECTED ROUTES (BUTUH TOKEN)
Route::middleware('auth:sanctum')->group(function () {
    
    // 🔹 ambil data user login
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // 🔹 logout
    Route::post('/logout', [AuthController::class, 'logout']);
});