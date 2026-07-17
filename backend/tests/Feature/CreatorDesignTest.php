<?php

namespace Tests\Feature;

use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** FR-024/037, BR-028, Flow 16 — Creator's own design CRUD. */
class CreatorDesignTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function activeCreator(): User
    {
        return CreatorProfile::factory()->aktif()->create()->user;
    }

    public function test_non_creator_cannot_access_creator_designs(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/creator/designs')->assertForbidden();
    }

    public function test_creator_can_upload_a_design_with_apparel(): void
    {
        $creator = $this->activeCreator();
        $product = Product::factory()->create();

        $response = $this->actingAs($creator)->post('/api/creator/designs', [
            'title' => 'Kucing Astronot',
            'file' => UploadedFile::fake()->image('design.png'),
            'product_ids' => [$product->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.apparel.0.product_id', $product->id)
            ->assertJsonPath('data.apparel.0.confirmed_at', null);
    }

    public function test_creator_can_only_list_their_own_designs(): void
    {
        $creator = $this->activeCreator();
        $other = $this->activeCreator();
        Design::factory()->for($creator, 'creator')->count(2)->create();
        Design::factory()->for($other, 'creator')->create();

        $this->actingAs($creator)->getJson('/api/creator/designs')->assertJsonCount(2, 'data');
    }

    public function test_submit_rejected_without_all_apparel_confirmed(): void
    {
        $creator = $this->activeCreator();
        $design = Design::factory()->for($creator, 'creator')->create(['status' => 'draft']);
        $product = Product::factory()->create();
        $design->products()->attach($product->id); // not confirmed

        $response = $this->actingAs($creator)->postJson("/api/creator/designs/{$design->id}/submit");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Masih ada jenis apparel yang belum dikonfirmasi.',
                'unconfirmed_product_ids' => [$product->id],
            ]);
    }

    public function test_confirm_apparel_then_submit_moves_to_menunggu_approval(): void
    {
        $creator = $this->activeCreator();
        $design = Design::factory()->for($creator, 'creator')->create(['status' => 'draft']);
        $product = Product::factory()->create();
        $design->products()->attach($product->id);

        $this->actingAs($creator)
            ->postJson("/api/creator/designs/{$design->id}/apparel/{$product->id}/confirm")
            ->assertOk();

        $this->actingAs($creator)->postJson("/api/creator/designs/{$design->id}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'menunggu_approval');
    }

    /** BR-028 */
    public function test_rejected_design_can_be_revised_in_place(): void
    {
        $creator = $this->activeCreator();
        $design = Design::factory()->rejected()->for($creator, 'creator')->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($creator)->patchJson("/api/creator/designs/{$design->id}", [
            'title' => 'Revisi Judul',
            'product_ids' => [$product->id],
        ]);

        $response->assertOk()->assertJsonPath('data.title', 'Revisi Judul');
        $this->assertNull($design->fresh()->rejection_reason);
    }

    public function test_revision_rejected_outside_ditolak_status(): void
    {
        $creator = $this->activeCreator();
        $design = Design::factory()->for($creator, 'creator')->create(['status' => 'draft']);
        $product = Product::factory()->create();

        $this->actingAs($creator)->patchJson("/api/creator/designs/{$design->id}", [
            'title' => 'X',
            'product_ids' => [$product->id],
        ])->assertUnprocessable();
    }

    public function test_creator_cannot_manage_another_creators_design(): void
    {
        $creator = $this->activeCreator();
        $other = $this->activeCreator();
        $design = Design::factory()->for($other, 'creator')->create();

        $this->actingAs($creator)->postJson("/api/creator/designs/{$design->id}/submit")
            ->assertNotFound();
    }
}
