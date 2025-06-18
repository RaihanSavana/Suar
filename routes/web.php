<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Import your controllers
use App\Http\Controllers\NewsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PublicController;

/*
|--------------------------------------------------------------------------
| Public Static Routes (Define these first)
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/news', [PublicController::class, 'newsIndex'])->name('public.news.index');
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');


/*
|--------------------------------------------------------------------------
| Authenticated Routes (This group contains /news/create)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->middleware(['verified'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Defines /news/create, /news (POST for store), /news/{news}/edit etc.
    // We except 'show' and 'index' because they are handled by our public routes.
    Route::resource('news', NewsController::class)->except(['show']);

    // Defines /categories/create, etc.
    // We except 'show' and 'index' because they are handled by our public routes.
    Route::resource('categories', CategoryController::class)->except(['show']);
});


/*
|--------------------------------------------------------------------------
| Public Wildcard Routes (Define these LAST)
|--------------------------------------------------------------------------
|
| These have wildcards, so they come after the more specific routes like
| /news/create to avoid conflicts.
|
*/
Route::get('/news/{news}', [PublicController::class, 'showNews'])->name('news.show');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');


/*
|--------------------------------------------------------------------------
| Authentication Routes (Login, Register, etc.)
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';
