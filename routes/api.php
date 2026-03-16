<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

Route::post('/register', [AuthController::class, 'register']);

Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
});