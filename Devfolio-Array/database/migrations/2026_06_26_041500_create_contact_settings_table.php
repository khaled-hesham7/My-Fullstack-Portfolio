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
        Schema::create('contact_settings', function (Blueprint $table) {
            $table->id();
            $table->json('emails')->nullable(); // array of {"label": "Work", "email": "khaled@example.com"}
            $table->json('phones')->nullable();  // array of {"label": "Mobile", "phone": "+2010..."}
            $table->json('locations')->nullable(); // array of {"address": "Giza", "gps_link": "https://maps.google.com/..."}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_settings');
    }
};
