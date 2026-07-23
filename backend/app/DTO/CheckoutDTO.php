<?php

namespace App\DTO;

/** 5.3_API_Specification.md §8 POST /checkout — "pola: business logic kompleks (DTO, Pricing Engine)". */
class CheckoutDTO
{
    /** @param  array<int>  $cartItemIds */
    public function __construct(
        public readonly int $addressId,
        public readonly array $cartItemIds,
        public readonly ?string $notes = null,
    ) {}
}
