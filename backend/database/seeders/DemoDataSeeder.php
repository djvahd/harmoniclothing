<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\AuditLog;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\CreatorProfile;
use App\Models\Design;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Wishlist;
use App\Services\CommissionService;
use Illuminate\Database\Seeder;

/**
 * A.2_Fix_Checklist.md Batch 1 (1.2–1.6) — demo data attached to the fixed
 * test accounts and to the orders/designs CatalogSeeder already created, so
 * every Customer/Creator/Admin page has something real to show after
 * `migrate:fresh --seed` instead of relying on chance (audit report §3.1/§3.2).
 */
class DemoDataSeeder extends Seeder
{
    public function run(User $customer, User $admin, User $creatorUser): void
    {
        $this->seedCustomerAccountData($customer, $admin);
        $this->seedOrderFulfillmentData($admin);
        $this->seedCreatorCommissions($creatorUser);
        $this->seedPendingApprovals();
        $this->seedAuditLogs($admin);
    }

    /** 1.2 — address book, cart, wishlist, notifications, chat thread for the fixed customer. */
    private function seedCustomerAccountData(User $customer, User $admin): void
    {
        Address::factory()->for($customer)->create([
            'label' => 'Rumah',
            'is_default' => true,
        ]);
        Address::factory()->for($customer)->create(['label' => 'Kantor']);

        ProductVariant::inRandomOrder()->take(3)->get()
            ->each(fn (ProductVariant $variant) => CartItem::factory()->create([
                'user_id' => $customer->id,
                'product_variant_id' => $variant->id,
            ]));

        Product::inRandomOrder()->take(2)->get()
            ->each(fn (Product $product) => Wishlist::factory()->create([
                'user_id' => $customer->id,
                'product_id' => $product->id,
            ]));
        Design::inRandomOrder()->take(2)->get()
            ->each(fn (Design $design) => Wishlist::factory()->create([
                'user_id' => $customer->id,
                'product_id' => null,
                'design_id' => $design->id,
            ]));

        Notification::factory()->count(3)->create([
            'user_id' => $customer->id,
            'type' => 'order.paid',
            'is_read' => true,
        ]);
        Notification::factory()->count(2)->create([
            'user_id' => $customer->id,
            'type' => 'order.shipped',
            'is_read' => false,
        ]);

        $thread = ChatThread::factory()->create([
            'customer_id' => $customer->id,
            'assigned_admin_id' => $admin->id,
            'last_message_at' => now(),
        ]);
        ChatMessage::factory()->create([
            'thread_id' => $thread->id,
            'sender_id' => $customer->id,
            'sender_role' => 'customer',
            'message' => 'Halo, saya mau tanya status pesanan saya.',
        ]);
        ChatMessage::factory()->create([
            'thread_id' => $thread->id,
            'sender_id' => $admin->id,
            'sender_role' => 'admin',
            'message' => 'Halo! Baik, saya bantu cek pesanannya ya.',
        ]);
    }

    /**
     * 1.3 — payments, invoices, shipments, and status history for every
     * "selesai" order CatalogSeeder created, so /admin/pembayaran,
     * /admin/pengiriman, and the order timeline aren't empty. A handful are
     * downgraded to "dikirim" so the in-transit state is represented too.
     */
    private function seedOrderFulfillmentData(User $admin): void
    {
        $selesaiOrders = Order::where('status', 'selesai')->get();
        $dikirimIds = $selesaiOrders->random(min(5, $selesaiOrders->count()))->pluck('id');

        foreach ($selesaiOrders as $order) {
            $isDikirim = $dikirimIds->contains($order->id);

            $paidAt = $order->created_at->clone()->addHours(2);
            $productionAt = $paidAt->clone()->addDay();
            $shippedAt = $productionAt->clone()->addDays(2);
            $deliveredAt = $shippedAt->clone()->addDays(3);

            Payment::factory()->berhasil()->create([
                'order_id' => $order->id,
                'amount' => $order->total,
                'paid_at' => $paidAt,
            ]);

            Invoice::factory()->create([
                'order_id' => $order->id,
                'issued_at' => $paidAt,
            ]);

            Shipment::factory()->create([
                'order_id' => $order->id,
                'courier' => fake()->randomElement(['JNE', 'J&T Express', 'SiCepat']),
                'tracking_number' => strtoupper(fake()->bothify('??##########')),
                'status' => $isDikirim ? 'dikirim' : 'delivered',
                'shipped_at' => $shippedAt,
                'delivered_at' => $isDikirim ? null : $deliveredAt,
            ]);

            $histories = [
                ['from_status' => 'belum_dibayar', 'to_status' => 'menunggu_approval', 'changed_by' => 'system'],
                ['from_status' => 'menunggu_approval', 'to_status' => 'diproses_produksi', 'changed_by' => 'admin', 'actor_id' => $admin->id],
                ['from_status' => 'diproses_produksi', 'to_status' => 'dikirim', 'changed_by' => 'admin', 'actor_id' => $admin->id],
            ];
            if (! $isDikirim) {
                $histories[] = ['from_status' => 'dikirim', 'to_status' => 'selesai', 'changed_by' => 'system'];
            }
            foreach ($histories as $history) {
                OrderStatusHistory::factory()->create(['order_id' => $order->id, ...$history]);
            }

            $order->update($isDikirim ? [
                'status' => 'dikirim',
                'paid_at' => $paidAt,
                'production_started_at' => $productionAt,
                'shipped_at' => $shippedAt,
            ] : [
                'paid_at' => $paidAt,
                'production_started_at' => $productionAt,
                'shipped_at' => $shippedAt,
                'delivered_at' => $deliveredAt,
                'completed_at' => $deliveredAt,
            ]);
        }
    }

    /** 1.4 — commissions for the fixed creator, generated through the real CommissionService so /creator/statistik has numbers. */
    private function seedCreatorCommissions(User $creatorUser): void
    {
        $commissionService = app(CommissionService::class);

        OrderItem::whereHas('design', fn ($q) => $q->where('creator_id', $creatorUser->id))
            ->get()
            ->each(function (OrderItem $item, int $index) use ($commissionService) {
                $commission = $commissionService->generateForOrderItem($item);

                if ($commission && $index % 2 === 0) {
                    $commission->update([
                        'status' => 'dibayar',
                        'paid_at' => now(),
                        'payout_reference' => 'PAYOUT-'.strtoupper(fake()->bothify('########')),
                    ]);
                }
            });
    }

    /** 1.5 — pending-approval records so the approval flows (BR-001/BR-002) aren't permanently empty. */
    private function seedPendingApprovals(): void
    {
        CreatorProfile::factory()->menungguApproval()->count(3)->create();

        $pendingDesignCreators = User::whereHas('creatorProfile')->inRandomOrder()->take(5)->get();
        $designCategories = Category::where('type', 'design')->get();

        Design::factory()
            ->pendingApproval()
            ->count(5)
            ->recycle($pendingDesignCreators)
            ->recycle($designCategories)
            ->create();
    }

    /** 1.6 — a handful of realistic audit log rows (endpoint exists, page lands in Batch 5). */
    private function seedAuditLogs(User $admin): void
    {
        CreatorProfile::where('status', 'aktif')->inRandomOrder()->take(3)->get()
            ->each(fn (CreatorProfile $profile) => AuditLog::factory()->create([
                'actor_id' => $admin->id,
                'action' => 'creator.approve',
                'entity_type' => CreatorProfile::class,
                'entity_id' => $profile->id,
                'description' => "Menyetujui profil creator {$profile->brand_name}.",
            ]));

        Design::where('status', 'aktif')->inRandomOrder()->take(3)->get()
            ->each(fn (Design $design) => AuditLog::factory()->create([
                'actor_id' => $admin->id,
                'action' => 'design.approve',
                'entity_type' => Design::class,
                'entity_id' => $design->id,
                'description' => "Menyetujui desain \"{$design->title}\".",
            ]));

        Order::inRandomOrder()->take(4)->get()
            ->each(fn (Order $order) => AuditLog::factory()->create([
                'actor_id' => $admin->id,
                'action' => 'order.status_update',
                'entity_type' => Order::class,
                'entity_id' => $order->id,
                'description' => 'Status diperbarui ke diproses_produksi.',
            ]));
    }
}
