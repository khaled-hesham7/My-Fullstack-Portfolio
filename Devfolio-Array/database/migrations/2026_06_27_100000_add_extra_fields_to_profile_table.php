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
        Schema::table('_profile_', function (Blueprint $table) {
            $table->string('sub_title')->nullable()->after('description');
            $table->text('skills')->nullable()->after('sub_title');
            $table->text('typewriter_text')->nullable()->after('skills');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('_profile_', function (Blueprint $table) {
            $table->dropColumn(['sub_title', 'skills', 'typewriter_text']);
        });
    }
};
