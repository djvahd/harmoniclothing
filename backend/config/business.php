<?php

/*
|--------------------------------------------------------------------------
| Business Rules — angka-angka aturan bisnis di satu tempat
|--------------------------------------------------------------------------
|
| Setiap nilai di sini menerapkan satu Business Rule (BR-xxx) dari
| "Required Document/Phase 1 - Product Discovery.md", bagian 1.2, sub-bagian 6.
| Kode lain TIDAK boleh menulis angka-angka ini langsung —
| baca lewat config('business.*') supaya mengubah aturan cukup di sini.
|
*/

return [

    /*
    | BR-017 — Pesanan "belum_dibayar" otomatis "dibatalkan" setelah sekian jam
    | sejak checkout (mengikuti masa berlaku transaksi Midtrans: 24 jam).
    | Dipakai oleh: orders:cancel-unpaid.
    */
    'unpaid_order_cancel_hours' => 24,

    /*
    | BR-014 — Pesanan "menunggu_konfirmasi" otomatis "selesai" setelah sekian
    | HARI KERJA (Senin–Jumat) sejak paket "Delivered" bila customer tidak
    | mengonfirmasi / berkomplain. Dipakai oleh: orders:auto-complete-deliveries.
    */
    'auto_complete_business_days' => 3,

    /*
    | BR-007 — Komisi Creator dihitung otomatis per transaksi yang memakai
    | desainnya. Persentasenya TIDAK ditentukan di dokumen perencanaan mana
    | pun: 20% ini placeholder (acuan margin default Redbubble di riset
    | kompetitor), BUKAN keputusan bisnis. Set CREATOR_COMMISSION_RATE
    | sebelum launch. Dipakai oleh: CommissionService.
    */
    'creator_commission_rate' => (float) env('CREATOR_COMMISSION_RATE', 0.20),

    /*
    | BR-007 (revisi 2026-07-22) — Pencairan komisi otomatis, batch mingguan.
    | Total komisi "terhutang" seorang Creator harus mencapai nominal ini
    | sebelum dicairkan (menghindari transfer receh tiap minggu). Juga
    | placeholder — atur lewat CREATOR_PAYOUT_MINIMUM sebelum launch.
    | Dipakai oleh: PayoutService.
    */
    'creator_payout_minimum' => (float) env('CREATOR_PAYOUT_MINIMUM', 50000),

];
