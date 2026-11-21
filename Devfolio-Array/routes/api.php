<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AboutMeController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\SocialLinkController;
use App\Http\Controllers\ExperiencesController;
use App\Http\Controllers\SkillGroupsController;
use App\Http\Controllers\Api\AboutMeLandingPageController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CvController;
use App\Http\Controllers\DashboardStatsController;

/*
|--------------------------------------------------------------------------
| 1. Public Routes (للزوار - لا تتطلب تسجيل دخول)
|--------------------------------------------------------------------------
*/

Route::get('/portfolio-data', [AboutMeLandingPageController::class, 'index']);
Route::get('/Home', [HomeController::class, 'index']);
Route::get('/home', [HomeController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
Route::get('/contact/settings', [ContactController::class, 'getSettings']);

// Dashboard Overview & Statistics
Route::get('/dashboard/stats', [DashboardStatsController::class, 'index']);

// CVs (Public View)
Route::get('/cvs', [CvController::class, 'index']);

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// Portfolio Sections (Read-Only)
Route::get('/skills', [SkillGroupsController::class, 'index']);      // المهارات
Route::get('/experiences', [ExperiencesController::class, 'index']); // الخبرات
Route::get('/education', [EducationController::class, 'index']);     // التعليم

// Articles (Public View)
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::post('/articles/{id}/like', [ArticleController::class, 'toggleLike'])->middleware('throttle:30,1');

// Projects (Public View)
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);

// SocialLink (Standard REST & Legacy compatibility)
Route::get('/social-links', [SocialLinkController::class, 'index']);
Route::get('/social-links/platforms', [SocialLinkController::class, 'getPlatforms']);
Route::get('/SocialLinkindex', [SocialLinkController::class, 'index']);
Route::get('/SocialLink', [SocialLinkController::class, 'getPlatforms']);

// profile
Route::get('/profiles', [ProfileController::class, 'index']);

/*
|--------------------------------------------------------------------------
| 2. Protected Routes (لوحة التحكم - تتطلب Token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile & Logout
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- إدارة قسم About ---
    Route::get('/about', [AboutMeController::class, 'show']);           // بياناتك الشخصية
    Route::match(['POST', 'PUT'], '/about/update', [AboutMeController::class, 'storeOrUpdate']);
    
    // --- إدارة المهارات (Skills) ---
    Route::post('/skills', [SkillGroupsController::class, 'store']);
    Route::get('/skills/{id}', [SkillGroupsController::class, 'show']);
    Route::match(['POST', 'PUT'], '/skills/{id}', [SkillGroupsController::class, 'update']);
    Route::delete('/skills/{id}', [SkillGroupsController::class, 'destroy']);
    
    // --- إدارة الخبرات (Experiences) ---
    Route::post('/experiences', [ExperiencesController::class, 'store']);
    Route::get('/experiences/{id}', [ExperiencesController::class, 'show']);
    Route::match(['POST', 'PUT'], '/experiences/{id}', [ExperiencesController::class, 'update']); // تعديل خبرة
    Route::delete('/experiences/{id}', [ExperiencesController::class, 'destroy']);
    
    // --- إدارة التعليم (Education) ---
    Route::post('/education', [EducationController::class, 'store']);
    Route::get('/education/{id}', [EducationController::class, 'show']);
    Route::match(['POST', 'PUT'], '/education/{id}', [EducationController::class, 'update']); // تعديل تعليم
    Route::delete('/education/{id}', [ EducationController::class, 'destroy']);
    
    // --- إدارة المقالات (Articles) ---
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::post('/articles/{id}/translate', [ArticleController::class, 'translate']);
    Route::match(['POST', 'PUT'], '/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
    Route::delete('/media/{idOrPath}', [ArticleController::class, 'deleteMedia'])->where('idOrPath', '.*');
    
    
    // --- إدارة المشاريع (projects) ---
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::match(['POST', 'PUT'], '/projects/{id}', [ProjectController::class, 'update']);
    Route::match(['POST', 'PATCH'], '/projects/{id}/featured', [ProjectController::class, 'toggleFeatured']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);


    // SocialLink
    Route::delete('/SocialLink/{id}', [SocialLinkController::class, 'destroy']);
    Route::post('/SocialLink', [SocialLinkController::class, 'store']);
    Route::delete('/social-links/{id}', [SocialLinkController::class, 'destroy']);
    Route::post('/social-links', [SocialLinkController::class, 'store']);


    // Profile
    Route::post('/profiles', [ProfileController::class, 'store']);
    Route::get('/profiles/{id}', [ProfileController::class, 'show']);
    Route::post('/profiles/{id}', [ProfileController::class, 'update']);
    Route::delete('/profiles/{id}', [ProfileController::class, 'destroy']);

    // --- Contact Messages Management ---
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contacts/{id}', [ContactController::class, 'show']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
    Route::post('/contact/settings', [ContactController::class, 'updateSettings']);

    // --- CVs Management ---
    Route::post('/cvs', [CvController::class, 'store']);
    Route::get('/cvs/{id}', [CvController::class, 'show']);
    Route::post('/cvs/{id}', [CvController::class, 'update']);
    Route::delete('/cvs/{id}', [CvController::class, 'destroy']);

    });















