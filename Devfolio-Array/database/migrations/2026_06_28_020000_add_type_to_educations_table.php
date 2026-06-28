<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('educations', function (Blueprint $table) {
            if (!Schema::hasColumn('educations', 'type')) {
                $table->string('type')->nullable()->default('Education')->after('id');
            }
            $table->string('university')->nullable()->change();
            $table->string('location')->nullable()->change();
            $table->string('duration')->nullable()->change();
            $table->string('grade')->nullable()->change();
            $table->text('description')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('educations', function (Blueprint $table) {
            if (Schema::hasColumn('educations', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
