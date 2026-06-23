<?php

use App\Http\Controllers\API\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/payments/midtrans/notification', [OrderController::class, 'midtransNotification']);
Route::post('/midtrans/notification', [OrderController::class, 'midtransNotification']);
