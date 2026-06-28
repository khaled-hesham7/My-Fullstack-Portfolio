<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;            // مهم جداً


class AboutMe extends Model implements HasMedia
{
    use InteractsWithMedia ;
    // السطر ده هو الحل: بيجبر لارفيل يستخدم اسم الجدول المفرد
    protected $table = 'about_me';

      protected $fillable = [
        'title',
        'description',

    ];


    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_images')->singleFile(); // بيمسح القديمة ويحط الجديدة أوتوماتيك

        $this->addMediaCollection('cvs')->singleFile(); // نفس الكلام للـ CV
        $this->addMediaCollection('general_cv')->singleFile();
        $this->addMediaCollection('backend_cv')->singleFile();
        $this->addMediaCollection('qa_cv')->singleFile();
    }



}
