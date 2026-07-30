<?php

/**
 * Custom app-level messages (validation exceptions, ad-hoc abort()/response()
 * text) that aren't covered by Laravel's default validation.php rule set.
 * Keyed by domain to mirror the Services/Controllers they came from.
 */
return [

    'auth' => [
        'invalid_credentials' => 'Email atau password salah.',
        'email_not_verified' => 'Akun belum verifikasi email. Silakan cek email Anda atau kirim ulang tautan verifikasi.',
        'verification_link_expired' => 'Tautan verifikasi tidak valid atau sudah kedaluwarsa.',
        'verification_link_invalid' => 'Tautan verifikasi tidak valid.',
        'email_verified' => 'Email berhasil diverifikasi.',
        'verification_resent' => 'Jika email terdaftar dan belum terverifikasi, tautan verifikasi telah dikirim.',
        'reset_link_sent' => 'Jika email terdaftar, tautan reset password telah dikirim.',
        'password_reset_success' => 'Password berhasil diubah.',
    ],

    'catalog' => [
        'variant_combination_exists' => 'Kombinasi warna/ukuran/potongan ini sudah ada untuk produk ini.',
    ],

    'order' => [
        'cancel_invalid_status' => 'Pesanan hanya dapat dibatalkan selama status Menunggu Approval.',
        'confirm_invalid_status' => 'Pesanan hanya dapat dikonfirmasi selama status Menunggu Konfirmasi.',
        'production_invalid_status' => 'Pesanan hanya dapat dimasukkan ke produksi selama status Menunggu Approval.',
        'reject_invalid_status' => 'Pesanan sudah tidak dalam status Menunggu Approval.',
        'shipment_invalid_status' => 'Pengiriman hanya dapat dibuat selama status Diproses Produksi.',
        'shipment_already_exists' => 'Pesanan ini sudah memiliki data pengiriman.',
    ],

    'review' => [
        'not_completed' => 'Rating hanya dapat diberikan setelah pesanan Selesai.',
        'item_not_found' => 'Item tidak ditemukan pada pesanan ini.',
        'already_reviewed' => 'Item ini sudah direview sebelumnya.',
    ],

    'checkout' => [
        'product_unavailable' => 'Produk ini sudah tidak tersedia.',
        'bulk_quantity_no_tier' => 'Kuantitas tidak memenuhi tingkat harga Bulk Order manapun.',
        'cart_item_unavailable' => 'Salah satu item di keranjang sudah tidak tersedia.',
    ],

    'design' => [
        'revise_invalid_status' => 'Desain hanya dapat direvisi selama status Ditolak.',
        'not_pending_approval' => 'Desain ini tidak sedang menunggu approval.',
        'unconfirmed_apparel' => 'Masih ada jenis apparel yang belum dikonfirmasi.',
    ],

    'creator' => [
        'already_applied' => 'Akun ini sudah mengajukan diri sebagai Creator.',
        'not_applied_yet' => 'Ajukan diri sebagai Creator terlebih dahulu.',
        'not_pending_approval' => 'Pengajuan Creator ini tidak sedang menunggu approval.',
        'terms_required' => 'Anda harus menyetujui Syarat & Ketentuan Creator.',
        'guardian_name_required' => 'Nama wali wajib diisi untuk Creator di bawah 18 tahun.',
        'guardian_id_required' => 'Nomor KTP wali wajib diisi untuk Creator di bawah 18 tahun.',
        'guardian_consent_required' => 'Persetujuan wali wajib diberikan untuk Creator di bawah 18 tahun.',
    ],

];
