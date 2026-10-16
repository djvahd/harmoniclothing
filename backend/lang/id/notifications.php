<?php

/** In-app notification texts, rendered at read time from notifications.params (see NotificationResource). */
return [
    'order' => [
        'paid' => ['title' => 'Pembayaran berhasil', 'body' => 'Pesanan :order telah dibayar dan menunggu approval Admin.'],
        'shipped' => ['title' => 'Pesanan dikirim', 'body' => 'Pesanan :order sedang dalam perjalanan.'],
        'delivered' => ['title' => 'Pesanan sampai', 'body' => 'Pesanan :order telah sampai. Konfirmasi penerimaan sekarang.'],
        'rejected' => ['title' => 'Pesanan ditolak', 'body' => 'Pesanan :order ditolak: :reason'],
        'auto_cancelled' => ['title' => 'Pesanan dibatalkan', 'body' => 'Pesanan :order dibatalkan otomatis karena belum dibayar dalam 24 jam.'],
        'auto_completed' => ['title' => 'Pesanan selesai', 'body' => 'Pesanan :order otomatis diselesaikan. Anda tetap dapat memberi rating lewat Riwayat Pesanan.'],
    ],
    'shipment' => [
        'problem' => ['title' => 'Pengiriman bermasalah', 'body' => 'Pengiriman pesanan :order bermasalah: :status. Perlu dicek manual.'],
    ],
    'chat' => [
        'message' => ['title' => 'Pesan baru', 'body' => 'Pesan baru dari :name.'],
        'admin_reply' => ['title' => 'Pesan baru dari Admin', 'body' => 'Anda menerima balasan baru di chat support.'],
    ],
    'design' => [
        'approved' => ['title' => 'Desain disetujui', 'body' => 'Desain ":design" telah disetujui dan tayang di marketplace.'],
        'rejected' => ['title' => 'Desain ditolak', 'body' => 'Desain ":design" ditolak: :reason'],
    ],
    'creator' => [
        'approved' => ['title' => 'Pengajuan Creator disetujui', 'body' => 'Selamat! Pengajuan Anda sebagai Creator telah disetujui.'],
        'rejected' => ['title' => 'Pengajuan Creator ditolak', 'body' => 'Pengajuan Anda sebagai Creator ditolak: :reason'],
        'banned' => ['title' => 'Akun Creator diblokir', 'body' => 'Akun Creator Anda telah diblokir: :reason'],
    ],
    'payout' => [
        'paid' => ['title' => 'Komisi dicairkan', 'body' => 'Komisi Rp :amount telah ditransfer ke rekening Anda (ref: :reference).'],
    ],
];
