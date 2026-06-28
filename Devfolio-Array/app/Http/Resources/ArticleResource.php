<?php

namespace App\Http\Resources;

use App\Models\ArticleLike;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $ip = $request->ip();
        // $lang = app()->getLocale(); // قراءة اللغة الحالية (سواء ar أو en)
        $lang = $request->header('Accept-Language', 'en');
        // تحديد البيانات النصية بناءً على اللغة المطلوبة، مع عمل fallback للإنجليزي لو العربي مش موجود
        $title   = ($lang === 'ar' && $this->title_ar) ? $this->title_ar : $this->title_en;
        $excerpt = ($lang === 'ar' && $this->excerpt_ar) ? $this->excerpt_ar : $this->excerpt_en;
        $content = ($lang === 'ar' && $this->content_ar) ? $this->content_ar : $this->content_en;

        // الحل الذكي بتاعك للـ N+1 زي ما هو بدون أي تغيير
        $liked = $this->whenHas(
            'is_liked',
            $this->is_liked,
            ArticleLike::where('article_id', $this->id)->where('ip_address', $ip)->exists()
        );

        return [
            'id'            => $this->id,
            'title'         => $title,
            'excerpt'       => $excerpt,
            'feature_image' => $this->feature_image ? asset('storage/' . $this->feature_image) : null,
            'feature_video' => $this->feature_video ? asset('storage/' . $this->feature_video) : null,
            'tags'          => $this->tags ?? [],
            'author'        => $this->author ? [
                'id'   => $this->author->id,
                'name' => $this->author->name,
            ] : null,
            'stats'         => [
                'views' => $this->views ?? 0,
                'likes' => $this->likes_relation_count ?? $this->likes_count ?? 0,
                'liked' => $liked,
            ],
            'is_featured'   => (bool)$this->is_featured,
            'date'          => [
                'raw'  => $this->created_at, // استبدلنا $this->date بـ created_at لضمان الدقة
                'diff' => $this->created_at ? $this->created_at->diffForHumans() : null,
            ],
            'content'       => collect($content)->map(function ($item, $index) {
                return [
                    'id'     => $index + 1,
                    'title'  => $item['title'] ?? null,
                    'text'   => $item['text'] ?? null,
                    'code'   => $item['code'] ?? null, // الكود بينزل هنا مباشرة من غير تكرار رفع
                    'images' => collect($item['images'] ?? [])->map(fn($img) => asset('storage/' . $img))->toArray(),
                    'videos' => collect($item['videos'] ?? [])->map(fn($vid) => asset('storage/' . $vid))->toArray(),
                ];
            })->values()->toArray(),
        ];
    }
}
