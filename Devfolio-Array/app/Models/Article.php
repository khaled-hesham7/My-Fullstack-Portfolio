<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
     protected $fillable = [
        'title_en',
        'excerpt_en',
        'content_en',
        'title_ar',
        'excerpt_ar',
        'content_ar',
        'views',
        'likes',
        'feature_image',
        'feature_video',
        'tags',
        'author_id',
        'is_featured',
        'category',
    ];

    protected $casts = [
        'tags' => 'array',
        'content_en' => 'array', // علشان يخزن الـ JSON كـ array للإنجليزي
        'content_ar' => 'array', // علشان يخزن الـ JSON كـ array للعربي
        'is_featured' => 'boolean',
    ];

    // علاقة مع المؤلف
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // علاقات المشاهدات واللايكات منفصلة
    public function viewsRelation()
    {
        return $this->hasMany(ArticleView::class);
    }

    public function likesRelation()
    {
        return $this->hasMany(ArticleLike::class);
    }

    // الـ Accessors لحساب العدد مباشرة لو احتجتها
    public function getViewsCountAttribute()
    {
        return $this->viewsRelation()->count();
    }

    public function getLikesCountAttribute()
    {
        return $this->likesRelation()->count();
    }

    // Local scope to filter by category (technical or personal)
    public function scopeCategory($query, $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }
        return $query;
    }
}
