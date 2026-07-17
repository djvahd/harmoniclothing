<?php

namespace App\Enums;

/**
 * 4.3_Table_Design.md: Creator is NOT a value here — it's existence-based via
 * creator_profiles.status (BR-013). `admin` is only ever set via manual
 * provisioning, never through /auth/register (2.2 §8).
 */
enum UserRole: string
{
    case Customer = 'customer';
    case Admin = 'admin';
}
