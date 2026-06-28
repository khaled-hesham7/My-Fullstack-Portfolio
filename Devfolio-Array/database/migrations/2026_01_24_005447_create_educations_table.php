<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->string('degree');      // مثلاً: Bachelor of Social Work
            $table->string('university');  // Helwan University
            $table->string('location');    // Cairo, Egypt
            $table->string('duration');    // 2022 - 2026
            $table->string('grade');       // مثلاً: Very Good
            $table->text('description');   // نبذة عن دراستك
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educations');
    }
};
