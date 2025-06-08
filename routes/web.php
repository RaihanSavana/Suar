<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Import your new controllers
use App\Http\Controllers\NewsController;
use App\Http\Controllers\CategoryController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // News Routes (Resourceful)
    // Most news actions (create, store, edit, update, destroy) typically require auth.
    // 'show' and 'index' might be public or also require auth, depending on your app.
    // For this example, let's put them all under 'auth' for simplicity,
    // but you can define public 'index' and 'show' routes separately if needed.
    Route::resource('news', NewsController::class);

    // Category Routes (Resourceful)
    // Typically, managing categories (create, store, edit, update, destroy) is an admin/auth-only task.
    // 'index' and 'show' are often public.
    Route::resource('categories', CategoryController::class);
});

// If you want the news index and show to be public as well, define them outside the auth group:
// Route::get('/news', [NewsController::class, 'index'])->name('news.index.public'); // Use a different name if you also have an auth one
// Route::get('/news/{news}', [NewsController::class, 'show'])->name('news.show.public'); // Assumes slug for binding

require __DIR__.'/auth.php';
