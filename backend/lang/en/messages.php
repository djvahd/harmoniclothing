<?php

/**
 * Custom app-level messages (validation exceptions, ad-hoc abort()/response()
 * text) that aren't covered by Laravel's default validation.php rule set.
 * Keyed by domain to mirror the Services/Controllers they came from.
 */
return [

    'auth' => [
        'invalid_credentials' => 'The email or password is incorrect.',
        'session_expired' => 'Your session ended because the password was changed. Please sign in again.',
        'account_banned' => 'Your account has been banned. Please contact Harmoni Clothing support for more information.',
        'email_not_verified' => 'This account has not verified its email yet. Please check your email or resend the verification link.',
        'verification_link_expired' => 'The verification link is invalid or has expired.',
        'verification_link_invalid' => 'The verification link is invalid.',
        'email_verified' => 'Email verified successfully.',
        'verification_resent' => 'If the email is registered and not yet verified, a verification link has been sent.',
        'reset_link_sent' => 'If the email is registered, a password reset link has been sent.',
        'password_reset_success' => 'Password changed successfully.',

        'mail' => [
            'verify_subject' => 'Verify Your Email Address',
            'verify_line1' => 'Click the button below to verify your email address and activate your Harmoni Clothing account.',
            'verify_action' => 'Verify Email',
            'verify_line2' => 'If you did not create this account, no further action is required.',
            'reset_subject' => 'Reset Your Password',
            'reset_line1' => 'We received a request to reset the password for your account. Click the button below to choose a new one.',
            'reset_action' => 'Reset Password',
            'reset_line2' => 'This password reset link will expire in :count minutes.',
            'reset_line3' => 'If you did not request a password reset, no further action is required.',
        ],
    ],

    'http' => [
        'too_many_requests' => 'Too many attempts. Please wait a moment and try again.',
        'invalid_signature' => 'This link is invalid or has expired.',
    ],

    'catalog' => [
        'tier_overlap' => 'This quantity range overlaps an existing Bulk Order price tier.',
        'variant_combination_exists' => 'This color/size/cut combination already exists for this product.',
    ],

    'order' => [
        'cancel_invalid_status' => 'This order can only be cancelled while its status is Unpaid or Awaiting Approval.',
        'pay_invalid_status' => 'Payment can only be resumed for orders with Unpaid status.',
        'confirm_invalid_status' => 'This order can only be confirmed while its status is Awaiting Confirmation.',
        'production_invalid_status' => 'This order can only be moved to production while its status is Awaiting Approval.',
        'reject_invalid_status' => 'This order is no longer in the Awaiting Approval status.',
        'shipment_invalid_status' => 'A shipment can only be created while the order status is In Production.',
        'shipment_already_exists' => 'This order already has shipment data.',
    ],

    'review' => [
        'not_completed' => 'A rating can only be given after the order is Completed.',
        'item_not_found' => 'Item not found on this order.',
        'already_reviewed' => 'This item has already been reviewed.',
    ],

    'checkout' => [
        'product_unavailable' => 'This product is no longer available.',
        'bulk_quantity_no_tier' => 'This quantity does not meet any Bulk Order pricing tier.',
        'cart_item_unavailable' => 'One of the items in your cart is no longer available.',
        'shipping_rate_unavailable' => 'The selected courier is not available for this address. Please pick another courier.',
    ],

    'design' => [
        'revise_invalid_status' => 'A design can only be revised while its status is Rejected.',
        'not_pending_approval' => 'This design is not currently awaiting approval.',
        'unconfirmed_apparel' => 'There are still apparel types that have not been confirmed.',
        'cannot_submit' => 'Only designs with Draft or Rejected status can be submitted for review.',
    ],

    'creator' => [
        'already_applied' => 'This account has already applied to become a Creator.',
        'not_applied_yet' => 'Please apply to become a Creator first.',
        'not_pending_approval' => 'This Creator application is not currently awaiting approval.',
        'terms_required' => 'You must agree to the Creator Terms & Conditions.',
        'guardian_name_required' => 'Guardian name is required for Creators under 18 years old.',
        'guardian_id_required' => "Guardian's ID number is required for Creators under 18 years old.",
        'guardian_consent_required' => 'Guardian consent is required for Creators under 18 years old.',
    ],

];
