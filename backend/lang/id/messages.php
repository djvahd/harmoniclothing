<?php

/**
 * Custom app-level messages (validation exceptions, ad-hoc abort()/response()
 * text) that aren't covered by Laravel's default validation.php rule set.
 * Keyed by domain to mirror the Services/Controllers they came from.
 */
return [

    'auth' => [
        'invalid_credentials' => 'Email atau password salah.',
        'session_expired' => 'Sesi Anda sudah berakhir karena kata sandi diubah. Silakan masuk kembali.',
        'account_banned' => 'Akun Anda telah diblokir. Hubungi admin Harmoni Clothing untuk informasi lebih lanjut.',
        'account_inactive' => 'Akun Anda dinonaktifkan oleh admin. Hubungi admin Harmoni Clothing untuk informasi lebih lanjut.',
        'email_not_verified' => 'Akun belum verifikasi email. Silakan cek email Anda atau kirim ulang tautan verifikasi.',
        'verification_link_expired' => 'Tautan verifikasi tidak valid atau sudah kedaluwarsa.',
        'verification_link_invalid' => 'Tautan verifikasi tidak valid.',
        'email_verified' => 'Email berhasil diverifikasi.',
        'verification_resent' => 'Jika email terdaftar dan belum terverifikasi, tautan verifikasi telah dikirim.',
        'reset_link_sent' => 'Jika email terdaftar, tautan reset password telah dikirim.',
        'password_reset_success' => 'Password berhasil diubah.',

        'mail' => [
            'verify_subject' => 'Verifikasi Alamat Email Anda',
            'verify_line1' => 'Klik tombol di bawah untuk memverifikasi alamat email Anda dan mengaktifkan akun Harmoni Clothing.',
            'verify_action' => 'Verifikasi Email',
            'verify_line2' => 'Jika Anda tidak membuat akun ini, abaikan email ini.',
            'reset_subject' => 'Reset Password Anda',
            'reset_line1' => 'Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru.',
            'reset_action' => 'Reset Password',
            'reset_line2' => 'Tautan reset password ini akan kedaluwarsa dalam :count menit.',
            'reset_line3' => 'Jika Anda tidak meminta reset password, abaikan email ini.',
        ],
    ],

    'http' => [
        'too_many_requests' => 'Terlalu banyak percobaan. Silakan tunggu sebentar lalu coba lagi.',
        'invalid_signature' => 'Tautan tidak valid atau sudah kedaluwarsa.',
    ],

    'catalog' => [
        'tier_overlap' => 'Rentang kuantitas tumpang tindih dengan tier harga Bulk Order yang sudah ada.',
        'variant_combination_exists' => 'Kombinasi warna/ukuran/potongan ini sudah ada untuk produk ini.',
    ],

    'order' => [
        'cancel_invalid_status' => 'Pesanan hanya dapat dibatalkan selama status Belum Dibayar atau Menunggu Approval.',
        'pay_invalid_status' => 'Pembayaran hanya dapat dilanjutkan untuk pesanan berstatus Belum Dibayar.',
        'confirm_invalid_status' => 'Pesanan hanya dapat dikonfirmasi selama status Menunggu Konfirmasi.',
        'production_invalid_status' => 'Pesanan hanya dapat dimasukkan ke produksi selama status Menunggu Approval.',
        'reject_invalid_status' => 'Pesanan sudah tidak dalam status Menunggu Approval.',
        'shipment_invalid_status' => 'Pengiriman hanya dapat dibuat selama status Diproses Produksi.',
        'shipment_courier_failed' => 'Layanan kurir (Biteship) tidak dapat dihubungi atau menolak permintaan. Pengiriman belum dibuat, silakan coba lagi.',
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
        'shipping_rate_unavailable' => 'Kurir yang dipilih tidak tersedia untuk alamat ini. Silakan pilih kurir lain.',
    ],

    'design' => [
        'revise_invalid_status' => 'Desain hanya dapat direvisi selama status Ditolak.',
        'not_pending_approval' => 'Desain ini tidak sedang menunggu approval.',
        'unconfirmed_apparel' => 'Masih ada jenis apparel yang belum dikonfirmasi.',
        'cannot_submit' => 'Hanya desain berstatus Draft atau Ditolak yang dapat diajukan untuk review.',
    ],

    'payout' => [
        'nothing_owed' => 'Creator ini tidak memiliki komisi yang perlu dibayar.',
        'below_minimum' => 'Total komisi belum mencapai minimum pencairan.',
        'no_destination' => 'Creator belum mengisi rekening/e-wallet tujuan pencairan.',
    ],

    'admin_user' => [
        'cannot_change_admin' => 'Akun admin tidak dapat dinonaktifkan.',
        'banned' => 'Akun yang diblokir tidak dapat diubah statusnya dari sini.',
    ],

    'creator' => [
        'already_applied' => 'Akun ini sudah mengajukan diri sebagai Creator.',
        'not_applied_yet' => 'Ajukan diri sebagai Creator terlebih dahulu.',
        'not_pending_approval' => 'Pengajuan Creator ini tidak sedang menunggu approval.',
        'verification_locked' => 'Data verifikasi sedang ditinjau, sudah disetujui, atau akun diblokir, sehingga tidak dapat dikirim ulang.',
        'kyc_incomplete' => 'Data verifikasi (KTP, tanggal lahir, rekening) belum lengkap, Creator belum dapat disetujui.',
        'terms_required' => 'Anda harus menyetujui Syarat & Ketentuan Creator.',
        'guardian_name_required' => 'Nama wali wajib diisi untuk Creator di bawah 18 tahun.',
        'guardian_id_required' => 'Nomor KTP wali wajib diisi untuk Creator di bawah 18 tahun.',
        'guardian_consent_required' => 'Persetujuan wali wajib diberikan untuk Creator di bawah 18 tahun.',
    ],

];
