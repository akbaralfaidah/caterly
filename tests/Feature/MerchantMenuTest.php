<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class MerchantMenuTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_merchant_can_create_a_menu_without_an_optional_image(): void
    {
        $this->seed();
        $merchant = User::query()->where('email', 'angsoduo@caterly.test')->firstOrFail();
        $category = Category::query()->where('slug', 'nasi-box')->firstOrFail();

        $response = $this->actingAs($merchant)->post('/merchant/menus', [
            'name' => 'Nasi Goreng Udang',
            'description' => 'Nasi goreng khas Sumatra dengan udang dan bumbu pilihan.',
            'price_idr' => 35000,
            'category_id' => $category->id,
        ]);

        $response
            ->assertRedirect()
            ->assertSessionHas('success', 'Menu berhasil ditambahkan.')
            ->assertSessionDoesntHaveErrors('image');
        $this->assertDatabaseHas('menus', [
            'merchant_id' => $merchant->id,
            'name' => 'Nasi Goreng Udang',
            'image_path' => null,
        ]);
    }
}
