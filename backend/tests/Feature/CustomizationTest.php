<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** FR-010 / FE-015 — own-design upload for Product Customization "mode custom". */
class CustomizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_guest_cannot_upload_a_design_file(): void
    {
        $file = UploadedFile::fake()->image('design.png');

        $this->postJson('/api/customization/uploads', ['file' => $file])
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_upload_a_png_design(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('design.png');

        $response = $this->actingAs($user)
            ->postJson('/api/customization/uploads', ['file' => $file]);

        $response->assertCreated()->assertJsonStructure(['data' => ['path', 'url']]);
        Storage::disk('public')->assertExists($response->json('data.path'));
    }

    public function test_authenticated_user_can_upload_an_svg_design(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('design.svg', 10, 'image/svg+xml');

        $response = $this->actingAs($user)
            ->postJson('/api/customization/uploads', ['file' => $file]);

        $response->assertCreated();
        $this->assertStringEndsWith('.svg', $response->json('data.path'));
    }

    public function test_upload_rejects_disallowed_mime_type(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('malware.pdf', 10, 'application/pdf');

        $this->actingAs($user)
            ->postJson('/api/customization/uploads', ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_upload_rejects_oversized_file(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('big.png', 20481, 'image/png');

        $this->actingAs($user)
            ->postJson('/api/customization/uploads', ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }
}
