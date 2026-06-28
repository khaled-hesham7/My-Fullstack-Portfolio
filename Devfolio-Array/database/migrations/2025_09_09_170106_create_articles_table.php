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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();

            // البيانات النصية بالإنجليزي
            $table->string('title_en')->nullable();
            $table->text('excerpt_en')->nullable();
            $table->longText('content_en')->nullable(); // مصفوفة البلوكات النصية EN

            // البيانات النصية بالعربي
            $table->string('title_ar')->nullable();
            $table->text('excerpt_ar')->nullable();
            $table->longText('content_ar')->nullable(); // مصفوفة البلوكات النصية AR

            // الميديا والعدادات المشتركة (تُرفع وتُحفظ مرة واحدة)
            $table->string('feature_image')->nullable();
            $table->string('feature_video')->nullable();
            $table->bigInteger('views')->default(0);
            $table->bigInteger('likes')->default(0);
            $table->json('tags')->nullable();

            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
