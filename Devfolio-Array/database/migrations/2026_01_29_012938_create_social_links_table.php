<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->enum('platform', [
                // العمل الحر (Freelance)
                'khamsat', 'mostaql', 'upwork', 'fiverr', 'freelancer',

                // حل المشكلات والبرمجة (Problem Solving)
                'hackerrank', 'codeforces', 'leetcode', 'codewars', 'hackerearth',

                // احترافي وتقني
                'github', 'linkedin', 'stackoverflow', 'discord',

                // التواصل الاجتماعي
                'facebook', 'instagram', 'twitter', 'whatsapp', 'telegram', 'tiktok', 'snapchat',

                // محتوى وإبداع
                'behance', 'dribbble', 'youtube', 'medium', 'pinterest',

                // أخرى
                'website'
            ]);
            $table->string('url');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
