<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\ArticleView;
use Illuminate\Http\Request;
use App\Http\Resources\ArticleResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    use ApiResponse;

    /**
     * Step 1: Add article in English and upload all media and code blocks
     */
    public function store(Request $request)
    {
        $request->validate([
            'title_en'          => 'nullable|string|max:255',
            'excerpt_en'        => 'nullable|string',
            'title_ar'          => 'nullable|string|max:255',
            'excerpt_ar'        => 'nullable|string',
            'content_ar'        => 'nullable|array',
            'content_ar.*.title'=> 'nullable|string',
            'content_ar.*.text' => 'nullable|string',
            'tags'              => 'nullable',
            'feature_image'     => 'nullable',
            'feature_video'     => 'nullable',
            'blocks'            => 'nullable|array',
            'blocks.*.images.*' => 'nullable',
            'blocks.*.videos.*' => 'nullable',
            'is_featured'       => 'nullable|boolean',
            'category'          => 'nullable|string|in:technical,personal',
        ]);

        $featureImagePath = $request->hasFile('feature_image')
            ? $request->file('feature_image')->store('articles/images', 'public')
            : null;

        $featureVideoPath = $request->hasFile('feature_video')
            ? $request->file('feature_video')->store('articles/videos', 'public')
            : null;

        $contentEn = [];
        $blocks = $request->input('blocks', []);
        foreach ($blocks as $i => $blockInput) {
            $item = [];
            $item['title'] = $blockInput['subheading'] ?? $blockInput['title'] ?? null;
            $item['text']  = $blockInput['text'] ?? null;
            $item['code']  = $blockInput['code'] ?? null;

            $images = [];
            if (isset($blockInput['images']) && is_array($blockInput['images'])) {
                foreach ($blockInput['images'] as $img) {
                    if (is_string($img)) {
                        $parsed = parse_url($img);
                        $pathStr = $parsed['path'] ?? $img;
                        $pathStr = preg_replace('/^\/?(storage\/)?/', '', $pathStr);
                        if (!empty($pathStr)) {
                            $images[] = $pathStr;
                        }
                    }
                }
            }
            if ($request->hasFile("blocks.$i.images")) {
                foreach ($request->file("blocks.$i.images") as $imageFile) {
                    $images[] = $imageFile->store('articles/blocks', 'public');
                }
            }
            $item['images'] = $images;

            $videos = [];
            if (isset($blockInput['videos']) && is_array($blockInput['videos'])) {
                foreach ($blockInput['videos'] as $vid) {
                    if (is_string($vid)) {
                        $parsed = parse_url($vid);
                        $pathStr = $parsed['path'] ?? $vid;
                        $pathStr = preg_replace('/^\/?(storage\/)?/', '', $pathStr);
                        if (!empty($pathStr)) {
                            $videos[] = $pathStr;
                        }
                    }
                }
            }
            if ($request->hasFile("blocks.$i.videos")) {
                foreach ($request->file("blocks.$i.videos") as $videoFile) {
                    $videos[] = $videoFile->store('articles/blocks', 'public');
                }
            }
            $item['videos'] = $videos;

            if ($item['title'] || $item['text'] || $item['code'] || !empty($item['images']) || !empty($item['videos'])) {
                $contentEn[] = $item;
            }
        }

        $contentAr = [];
        if ($request->has('content_ar') && is_array($request->input('content_ar'))) {
            $contentArInput = $request->input('content_ar', []);
            foreach ($contentArInput as $i => $blockInput) {
                $item = [];
                $item['title']  = $blockInput['title'] ?? null;
                $item['text']   = $blockInput['text'] ?? null;
                $item['code']   = $contentEn[$i]['code'] ?? null;
                $item['images'] = $contentEn[$i]['images'] ?? [];
                $item['videos'] = $contentEn[$i]['videos'] ?? [];

                if ($item['title'] || $item['text'] || $item['code'] || !empty($item['images']) || !empty($item['videos'])) {
                    $contentAr[] = $item;
                }
            }
        }

        // Seamless block cross-fallback: if one language has content and the other doesn't, mirror it
        if (empty($contentEn) && !empty($contentAr)) {
            $contentEn = $contentAr;
        } elseif (empty($contentAr) && !empty($contentEn)) {
            $contentAr = $contentEn;
        }

        // Title and Excerpt cross-fallback: no language is strictly required
        $titleEn = $request->filled('title_en') ? $request->title_en : ($request->filled('title_ar') ? $request->title_ar : 'Untitled Article');
        $titleAr = $request->filled('title_ar') ? $request->title_ar : ($request->filled('title_en') ? $request->title_en : 'مقال جديد');
        $excerptEn = $request->excerpt_en ?: ($request->excerpt_ar ?: '');
        $excerptAr = $request->excerpt_ar ?: ($request->excerpt_en ?: '');

        $tags = $request->tags ?? [];
        if (is_string($tags)) {
            $tags = array_values(array_filter(array_map('trim', explode(',', $tags))));
        }

        $article = Article::create([
            'title_en'      => $titleEn,
            'excerpt_en'    => $excerptEn,
            'content_en'    => $contentEn,
            'title_ar'      => $titleAr,
            'excerpt_ar'    => $excerptAr,
            'content_ar'    => !empty($contentAr) ? $contentAr : null,
            'feature_image' => $featureImagePath,
            'feature_video' => $featureVideoPath,
            'tags'          => $tags,
            'author_id'     => auth()->id() ?? 1,
            'is_featured'   => $request->has('is_featured') ? (bool)$request->is_featured : false,
            'category'      => $request->input('category', 'technical'),
        ]);

        return $this->successResponse(
            ['article_id' => $article->id],
            __('messages.article_created'),
            201
        );
    }

    /**
     * Step 2: Add Arabic translation
     */
    public function translate(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $request->validate([
            'title_ar'          => 'nullable|string|max:255',
            'excerpt_ar'        => 'nullable|string',
            'content_ar'        => 'nullable|array',
            'content_ar.*.title'=> 'nullable|string',
            'content_ar.*.text' => 'nullable|string',
        ]);

        $contentAr = $request->input('content_ar', []);
        $contentEn = $article->content_en ?? [];

        foreach ($contentAr as $i => &$item) {
            $item['title']  = $item['title'] ?? null;
            $item['text']   = $item['text'] ?? null;
            $item['code']   = $contentEn[$i]['code'] ?? null;
            $item['images'] = $contentEn[$i]['images'] ?? [];
            $item['videos'] = $contentEn[$i]['videos'] ?? [];
        }
        unset($item);

        $article->update([
            'title_ar'   => $request->title_ar ?: ($article->title_ar ?: $article->title_en),
            'excerpt_ar' => $request->excerpt_ar ?: ($article->excerpt_ar ?: $article->excerpt_en),
            'content_ar' => !empty($contentAr) ? $contentAr : $article->content_ar,
        ]);

        return $this->successResponse(
            new \stdClass(),
            __('messages.article_translation_linked'),
            200
        );
    }

    /**
     * Display all articles
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $ip = $request->ip();

        if ($perPage > 50) {
            return $this->errorResponse(__('messages.max_per_page_exceeded'), 400);
        }

        $query = Article::with(['author'])
            ->withCount(['likesRelation as likes_relation_count'])
            ->withExists(['likesRelation as is_liked' => function($query) use ($ip) {
                $query->where('ip_address', $ip);
            }]);

        if ($request->filled('category')) {
            $cat = $request->query('category');
            if ($cat === 'technical') {
                $query->where(function($q) {
                    $q->where('category', 'technical')->orWhereNull('category');
                });
            } else {
                $query->where('category', $cat);
            }
        }

        $articles = $query->latest()
            ->paginate($perPage);

        return $this->paginatedResponse(
            ArticleResource::collection($articles),
            __('messages.articles_retrieved'),
            200
        );
    }

    /**
     * Update an existing article
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        \Illuminate\Support\Facades\Log::info('Incoming Article Update Request Data for Article ID ' . $id . ':', $request->all());

        $request->validate([
            'title_en'          => 'nullable|string|max:255',
            'excerpt_en'        => 'nullable|string',
            'title_ar'          => 'nullable|string|max:255',
            'excerpt_ar'        => 'nullable|string',
            'content_ar'        => 'nullable|array',
            'feature_image'     => 'nullable',
            'feature_video'     => 'nullable',
            'blocks'            => 'nullable|array',
            'blocks.*.images.*' => 'nullable', 
            'blocks.*.videos.*' => 'nullable', 
            'is_featured'       => 'nullable|boolean',
            'category'          => 'nullable|string|in:technical,personal',
        ]);

        if ($request->hasFile('feature_image')) {
            if($article->feature_image) Storage::disk('public')->delete($article->feature_image);
            $article->feature_image = $request->file('feature_image')->store('articles/images', 'public');
        }

        if ($request->hasFile('feature_video')) {
            if($article->feature_video) Storage::disk('public')->delete($article->feature_video);
            $article->feature_video = $request->file('feature_video')->store('articles/videos', 'public');
        }

        $contentEn = $article->content_en ?? [];
        if ($request->has('blocks') || $request->has('content_en')) {
            $blocksInput = $request->input('blocks', $request->input('content_en', []));
            $contentEn = [];
            foreach ($blocksInput as $i => $blockInput) {
                $item = [];
                $item['title'] = $blockInput['subheading'] ?? $blockInput['title'] ?? null;
                $item['text']  = $blockInput['text'] ?? null;
                $item['code']  = $blockInput['code'] ?? null;

                $images = [];
                if (isset($blockInput['images']) && is_array($blockInput['images'])) {
                    foreach ($blockInput['images'] as $img) {
                        if (is_string($img)) {
                            $parsed = parse_url($img);
                            $pathStr = $parsed['path'] ?? $img;
                            $pathStr = preg_replace('/^\/?(storage\/)?/', '', $pathStr);
                            if (!empty($pathStr)) {
                                $images[] = $pathStr;
                            }
                        }
                    }
                }
                if ($request->hasFile("blocks.$i.images")) {
                    foreach ($request->file("blocks.$i.images") as $imageFile) {
                        $images[] = $imageFile->store('articles/blocks', 'public');
                    }
                }
                $item['images'] = $images;

                $videos = [];
                if (isset($blockInput['videos']) && is_array($blockInput['videos'])) {
                    foreach ($blockInput['videos'] as $vid) {
                        if (is_string($vid)) {
                            $parsed = parse_url($vid);
                            $pathStr = $parsed['path'] ?? $vid;
                            $pathStr = preg_replace('/^\/?(storage\/)?/', '', $pathStr);
                            if (!empty($pathStr)) {
                                $videos[] = $pathStr;
                            }
                        }
                    }
                }
                if ($request->hasFile("blocks.$i.videos")) {
                    foreach ($request->file("blocks.$i.videos") as $videoFile) {
                        $videos[] = $videoFile->store('articles/blocks', 'public');
                    }
                }
                $item['videos'] = $videos;

                $contentEn[] = $item;
            }
        }

        $contentAr = $article->content_ar ?? [];
        if ($request->has('content_ar')) {
            $contentArInput = $request->input('content_ar', []);
            $contentAr = [];
            foreach ($contentArInput as $i => $blockInput) {
                $item = [];
                $item['title']  = $blockInput['title'] ?? null;
                $item['text']   = $blockInput['text'] ?? null;
                $item['code']   = $contentEn[$i]['code'] ?? null;
                $item['images'] = $contentEn[$i]['images'] ?? [];
                $item['videos'] = $contentEn[$i]['videos'] ?? [];

                $contentAr[] = $item;
            }
        }

        // Seamless cross-mirroring of blocks
        if (empty($contentEn) && !empty($contentAr)) {
            $contentEn = $contentAr;
        } elseif (empty($contentAr) && !empty($contentEn)) {
            $contentAr = $contentEn;
        }

        $titleEn = $request->filled('title_en') ? $request->title_en : ($request->filled('title_ar') ? $request->title_ar : $article->title_en);
        $titleAr = $request->filled('title_ar') ? $request->title_ar : ($request->filled('title_en') ? $request->title_en : $article->title_ar);
        $excerptEn = $request->has('excerpt_en') ? $request->excerpt_en : ($request->has('excerpt_ar') ? $request->excerpt_ar : $article->excerpt_en);
        $excerptAr = $request->has('excerpt_ar') ? $request->excerpt_ar : ($request->has('excerpt_en') ? $request->excerpt_en : $article->excerpt_ar);

        $tags = $request->has('tags') ? $request->tags : $article->tags;
        if (is_string($tags)) {
            $tags = array_values(array_filter(array_map('trim', explode(',', $tags))));
        }

        $article->update([
            'title_en'      => $titleEn,
            'excerpt_en'    => $excerptEn,
            'content_en'    => $contentEn,
            'title_ar'      => $titleAr,
            'excerpt_ar'    => $excerptAr,
            'content_ar'    => !empty($contentAr) ? $contentAr : null,
            'tags'          => $tags,
            'feature_image' => $article->feature_image,
            'feature_video' => $article->feature_video,
            'is_featured'   => $request->has('is_featured') ? (bool)$request->is_featured : $article->is_featured,
            'category'      => $request->has('category') ? $request->category : ($article->category ?? 'technical'),
        ]);

        return $this->successResponse(
            new ArticleResource($article),
            __('messages.article_updated'),
            200
        );
    }

    /**
     * Delete article and all its attachments
     */
    public function destroy($id)
    {
        $article = Article::findOrFail($id);

        if ($article->feature_image) Storage::disk('public')->delete($article->feature_image);
        if ($article->feature_video) Storage::disk('public')->delete($article->feature_video);

        $allContent = array_merge($article->content_en ?? [], $article->content_ar ?? []);
        foreach ($allContent as $block) {
            if (!empty($block['images'])) {
                foreach ($block['images'] as $img) Storage::disk('public')->delete($img);
            }
            if (!empty($block['videos'])) {
                foreach ($block['videos'] as $vid) Storage::disk('public')->delete($vid);
            }
        }

        $article->delete();

        return $this->successResponse(
            new \stdClass(),
            __('messages.article_deleted'),
            200
        );
    }

    /**
     * Display a single article and record a view
     */
    public function show(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $ip = $request->ip();
        $alreadyViewed = ArticleView::where('article_id', $article->id)->where('ip_address', $ip)->exists();

        if (!$alreadyViewed) {
            ArticleView::create(['article_id' => $article->id, 'ip_address' => $ip]);
            $article->increment('views');
        }

        return $this->successResponse(
            new ArticleResource($article),
            __('messages.article_retrieved'),
            200
        );
    }

    /**
     * Toggle article like status
     */
    public function toggleLike(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $ip = $request->ip();
        $existingLike = ArticleLike::where('article_id', $id)->where('ip_address', $ip)->first();

        if ($existingLike) {
            $existingLike->delete();
            $liked = false;
        } else {
            ArticleLike::create(['article_id' => $id, 'ip_address' => $ip]);
            $liked = true;
        }

        return $this->successResponse(
            [
                'liked'       => $liked,
                'likes_count' => ArticleLike::where('article_id', $id)->count()
            ],
            $liked ? __('messages.article_liked') : __('messages.article_unliked'),
            200
        );
    }

    /**
     * Delete a specific media item or storage file from article blocks
     */
    public function deleteMedia(Request $request, $idOrPath)
    {
        $path = urldecode($idOrPath);
        $parsedUrl = parse_url($path);
        $path = $parsedUrl['path'] ?? $path;
        $path = ltrim(preg_replace('/^\/?(storage\/)?/', '', $path), '/\\');

        // Security: Prevent path traversal and restrict deletions to the articles media directory
        if (str_contains($path, '..') || !str_starts_with($path, 'articles/')) {
            return $this->errorResponse(__('messages.media_not_found'), 400);
        }

        $articles = Article::all();
        $deleted = false;
        foreach ($articles as $article) {
            if ($this->removePathFromArticleBlocks($article, $path)) {
                $deleted = true;
            }
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            $deleted = true;
        }

        if ($deleted) {
            return $this->successResponse(
                new \stdClass(),
                __('messages.media_deleted'),
                200
            );
        }

        return $this->errorResponse(__('messages.media_not_found'), 404);
    }

    private function removePathFromArticleBlocks($article, $path)
    {
        $updated = false;

        $contentEn = $article->content_en ?? [];
        foreach ($contentEn as &$block) {
            if (isset($block['images'])) {
                $origCount = count($block['images']);
                $block['images'] = array_values(array_filter($block['images'], function($img) use ($path) {
                    return !str_contains($img, $path) && $img !== $path;
                }));
                if (count($block['images']) !== $origCount) {
                    $updated = true;
                }
            }
            if (isset($block['videos'])) {
                $origCount = count($block['videos']);
                $block['videos'] = array_values(array_filter($block['videos'], function($vid) use ($path) {
                    return !str_contains($vid, $path) && $vid !== $path;
                }));
                if (count($block['videos']) !== $origCount) {
                    $updated = true;
                }
            }
        }
        unset($block);

        $contentAr = $article->content_ar ?? [];
        foreach ($contentAr as &$block) {
            if (isset($block['images'])) {
                $origCount = count($block['images']);
                $block['images'] = array_values(array_filter($block['images'], function($img) use ($path) {
                    return !str_contains($img, $path) && $img !== $path;
                }));
                if (count($block['images']) !== $origCount) {
                    $updated = true;
                }
            }
            if (isset($block['videos'])) {
                $origCount = count($block['videos']);
                $block['videos'] = array_values(array_filter($block['videos'], function($vid) use ($path) {
                    return !str_contains($vid, $path) && $vid !== $path;
                }));
                if (count($block['videos']) !== $origCount) {
                    $updated = true;
                }
            }
        }
        unset($block);

        if ($updated) {
            $article->update([
                'content_en' => $contentEn,
                'content_ar' => $contentAr,
            ]);
        }

        return $updated;
    }
}
