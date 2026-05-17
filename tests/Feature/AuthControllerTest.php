<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_keeps_previous_tokens_active(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret123'),
            'role' => User::ROLE_USER,
        ]);

        $firstLogin = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $firstLogin
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $firstToken = $firstLogin->json('token');

        $secondLogin = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $secondLogin
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);

        $secondToken = $secondLogin->json('token');

        $this->assertNotSame($firstToken, $secondToken);

        $this->withHeader('Authorization', "Bearer {$firstToken}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id);

        $this->withHeader('Authorization', "Bearer {$secondToken}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_logout_only_revokes_current_token(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret123'),
            'role' => User::ROLE_USER,
        ]);

        $firstToken = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->json('token');

        $secondToken = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ])->json('token');

        $this->withHeader('Authorization', "Bearer {$firstToken}")
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$firstToken}")
            ->getJson('/api/auth/me')
            ->assertUnauthorized();

        $this->withHeader('Authorization', "Bearer {$secondToken}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }
}
