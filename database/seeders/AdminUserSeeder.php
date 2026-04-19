<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's admin users.
     */
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Faiz Suanda',
                'email' => 'faizsuanda@gmail.com',
                'password' => 'suanda271204',
            ],
            [
                'name' => 'Ilham Putra',
                'email' => 'ilhamputra@gmail.com',
                'password' => 'ilham12345',
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => Hash::make($admin['password']),
                    'role' => User::ROLE_ADMIN,
                ],
            );
        }
    }
}
