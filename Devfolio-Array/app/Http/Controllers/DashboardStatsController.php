<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Project;
use App\Models\SkillGroups;
use App\Models\Experiences;
use App\Models\Education;
use App\Models\Cv;
use App\Models\ContactMessage;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardStatsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        // 1. Projects Statistics
        $totalProjects = Project::count();
        $featuredProjects = Project::where('is_featured', true)->count();
        $demoProjects = Project::whereNotNull('demo_link')
            ->where('demo_link', '!=', '')
            ->where('demo_link', '!=', '#')
            ->count();
        $githubProjects = Project::whereNotNull('github_link')
            ->where('github_link', '!=', '')
            ->where('github_link', '!=', '#')
            ->count();

        // 2. Articles Statistics
        $totalArticles = Article::count();
        $technicalArticles = Article::where(function($q) {
            $q->where('category', 'technical')->orWhereNull('category');
        })->count();
        $personalArticles = Article::where('category', 'personal')->count();
        $featuredArticles = Article::where('is_featured', true)->count();
        $totalViews = (int) Article::sum('views');
        
        // Count likes from ArticleLike table (primary source) or fallback to sum of likes column
        $articleLikesCount = ArticleLike::count();
        $columnLikesSum = (int) Article::sum('likes');
        $totalLikes = max($articleLikesCount, $columnLikesSum);

        // 3. Career & Skills
        $totalSkillGroups = SkillGroups::count();
        $totalExperiences = Experiences::count();
        $internshipsCount = Experiences::whereRaw("LOWER(COALESCE(type, 'Job')) = 'internship'")->count();
        $jobsCount = Experiences::whereRaw("LOWER(COALESCE(type, 'Job')) != 'internship'")->count();
        $totalEducation = Education::count();
        $totalCvs = Cv::count();

        // 4. Inquiries
        $totalContacts = ContactMessage::count();
        $latestContacts = ContactMessage::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);

        // 5. Recent Content Feeds
        $recentArticles = Article::withCount(['likesRelation as likes_relation_count'])
            ->latest()
            ->take(5)
            ->get(['id', 'title_en', 'title_ar', 'category', 'is_featured', 'views', 'likes', 'created_at'])
            ->map(function ($art) {
                return [
                    'id' => $art->id,
                    'title_en' => $art->title_en,
                    'title_ar' => $art->title_ar,
                    'category' => $art->category,
                    'is_featured' => (bool) $art->is_featured,
                    'views' => (int) $art->views,
                    'likes' => (int) ($art->likes_relation_count ?? $art->likes ?? 0),
                    'created_at' => $art->created_at,
                ];
            });

        $recentProjects = Project::latest()
            ->take(5)
            ->get(['id', 'title', 'is_featured', 'demo_link', 'github_link', 'created_at']);

        return $this->successResponse([
            'metrics' => [
                'projects' => [
                    'total' => $totalProjects,
                    'featured' => $featuredProjects,
                    'with_demo' => $demoProjects,
                    'with_github' => $githubProjects,
                ],
                'articles' => [
                    'total' => $totalArticles,
                    'technical' => $technicalArticles,
                    'personal' => $personalArticles,
                    'featured' => $featuredArticles,
                    'total_views' => $totalViews,
                    'total_likes' => $totalLikes,
                ],
                'career' => [
                    'skill_groups' => $totalSkillGroups,
                    'experiences' => $totalExperiences,
                    'jobs' => $jobsCount,
                    'internships' => $internshipsCount,
                    'education' => $totalEducation,
                    'cvs' => $totalCvs,
                ],
                'inquiries' => [
                    'total_messages' => $totalContacts,
                ],
            ],
            'recent' => [
                'articles' => $recentArticles,
                'projects' => $recentProjects,
                'contacts' => $latestContacts,
            ],
        ], 'Dashboard statistics retrieved successfully.', 200);
    }
}
