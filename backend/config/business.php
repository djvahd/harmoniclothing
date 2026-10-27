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
    | desainnya. Keputusan pemilik (2026-10-16): 20% dari subtotal item.
    | Besarnya hanya diketahui admin dan creator yang bersangkutan (tidak
    | ditampilkan sebagai baris harga). Ubah lewat CREATOR_COMMISSION_RATE.
    | Dipakai oleh: CommissionService.
    */
    'creator_commission_rate' => (float) env('CREATOR_COMMISSION_RATE', 0.20),

    /*
    | BR-007 (revisi 2026-10-16) — Pencairan komisi MANUAL oleh admin
    | (halaman /admin/payouts). Total komisi "terhutang" seorang Creator harus
    | mencapai nominal ini sebelum dapat dicairkan; keputusan pemilik: Rp 50.000.
    | Atur lewat CREATOR_PAYOUT_MINIMUM. Dipakai oleh: PayoutService.
    */
    'creator_payout_minimum' => (float) env('CREATOR_PAYOUT_MINIMUM', 50000),

    /*
    | Voucher (#98) — sisa tagihan minimum setelah diskon. Midtrans menolak
    | gross_amount 0, jadi potongan dibatasi agar total tetap >= nilai ini.
    */
    'voucher_min_payable' => (int) env('VOUCHER_MIN_PAYABLE', 1000),

];
