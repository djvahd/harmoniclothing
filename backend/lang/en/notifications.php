<?php

/** In-app notification texts, rendered at read time from notifications.params (see NotificationResource). */
return [
    'order' => [
        'paid' => ['title' => 'Payment successful', 'body' => 'Order :order has been paid and is waiting for Admin approval.'],
        'shipped' => ['title' => 'Order shipped', 'body' => 'Order :order is on its way.'],
        'delivered' => ['title' => 'Order delivered', 'body' => 'Order :order has arrived. Please confirm receipt now.'],
        'rejected' => ['title' => 'Order rejected', 'body' => 'Order :order was rejected: :reason'],
        'auto_cancelled' => ['title' => 'Order cancelled', 'body' => 'Order :order was cancelled automatically because it was not paid within 24 hours.'],
        'auto_completed' => ['title' => 'Order completed', 'body' => 'Order :order was completed automatically. You can still leave a rating from Order History.'],
    ],
    'shipment' => [
        'problem' => ['title' => 'Shipment problem', 'body' => 'The shipment of order :order has a problem: :status. Needs a manual check.'],
    ],
    'chat' => [
        'message' => ['title' => 'New message', 'body' => 'New message from :name.'],
        'admin_reply' => ['title' => 'New message from Admin', 'body' => 'You received a new reply in support chat.'],
    ],
    'design' => [
        'approved' => ['title' => 'Design approved', 'body' => 'Your design ":design" has been approved and is live in the marketplace.'],
        'rejected' => ['title' => 'Design rejected', 'body' => 'Your design ":design" was rejected: :reason'],
    ],
    'creator' => [
        'approved' => ['title' => 'Creator application approved', 'body' => 'Congratulations! Your Creator application has been approved.'],
        'rejected' => ['title' => 'Creator application rejected', 'body' => 'Your Creator application was rejected: :reason'],
        'banned' => ['title' => 'Creator account suspended', 'body' => 'Your Creator account has been suspended: :reason'],
    ],
    'payout' => [
        'paid' => ['title' => 'Commission paid out', 'body' => 'Rp :amount commission has been transferred to your account (ref: :reference).'],
    ],
];
