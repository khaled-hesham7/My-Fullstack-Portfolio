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
        Schema::create('skill_groups', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // عنوان المجموعة: مثل Frontend Skills
            $table->string('icon');  // اسم الأيقونة: مثل 'fa-code' أو مسار SVG
            $table->json('skills');  // مصفوفة المهارات: ['HTML', 'CSS', 'JS']
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_groups');
    }
};
