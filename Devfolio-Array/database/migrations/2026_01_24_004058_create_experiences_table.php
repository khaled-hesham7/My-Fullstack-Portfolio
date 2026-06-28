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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('job_title');  // مثلاً: Freelance Backend Developer
            $table->string('company');    // اسم الشركة أو المكان
            $table->string('location');   // مثلاً: Remote أو Cairo
            $table->string('duration');   // مثلاً: Apr 2025 - Jun 2025
            $table->json('tasks');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
