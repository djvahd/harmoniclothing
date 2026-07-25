<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** design_tag — pivot: tags attached to a design, many-to-many. */
    public function up(): void
    {
        Schema::create('design_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('design_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();

            $table->unique(['design_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_tag');
    }
};
