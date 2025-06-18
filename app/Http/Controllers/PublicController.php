<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- **1. ADD THIS IMPORT**
use Inertia\Inertia;
use App\Models\News;
use App\Enums\NewsStatus;

class PublicController extends Controller
{
    /**
     * Display the public landing page with latest news.
     */
    public function home()
    {
        $newsItems = News::query()
            ->where('status', NewsStatus::PUBLISHED)
            ->with(['category', 'user']) // Eager load relationships
            ->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Public/Home', [
            'newsItems' => $newsItems,
        ]);
    }

    /**
     * Display a single public news article.
     *
     * @param  \App\Models\News  $news  (This uses Route Model Binding by slug)
     * @return \Inertia\Response
     */
    public function showNews(News $news)
    {
        if ($news->status !== NewsStatus::PUBLISHED && (!Auth::check() || Auth::id() !== $news->user_id)) {
             abort(404);
        }

        $news->load(['category', 'user']);

        // ** NEW: Fetch a few more recent articles for the sidebar **
        $moreNews = News::query()
            ->where('status', NewsStatus::PUBLISHED)
            ->where('id', '!=', $news->id) // Exclude the current article
            ->with('category')
            ->orderBy('published_at', 'desc')
            ->limit(5) // Get up to 5 articles
            ->get();

        return Inertia::render('Public/NewsShow', [
            'newsArticle' => $news,
            'moreNews' => $moreNews, // Pass the new data as a prop
        ]);
    }
}
