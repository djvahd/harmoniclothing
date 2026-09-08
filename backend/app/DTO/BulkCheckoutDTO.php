<?php

namespace App\DTO;

/** 5.3_API_Specification.md §8 pattern — POST /checkout/bulk (BR-012/026). */
class BulkCheckoutDTO
{
    /** @param  array<array{product_variant_id:int, quantity:int}>  $items */
    public function __construct(
        public readonly int $addressId,
        public readonly array $items,
        public readonly string $courierCompany,
        public readonly string $courierType,
        public readonly ?int $designId = null,
        public readonly ?string $customDesignFilePath = null,
        public readonly ?string $notes = null,
    ) {}
}
