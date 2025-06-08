<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Category;
use App\Enums\NewsStatus; // Assuming you created this Enum
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // Crucial for Auth::id() and Auth::check()
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = News::query()
            ->with(['category', 'user']) // Eager load relationships
            ->when($request->input('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhereHas('category', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });

        // Show published news to everyone.
        // If a user is logged in, also show their own non-published news.
        if (Auth::check()) {
            $userId = Auth::id();
            $query->where(function($q) use ($userId) {
                $q->where('status', NewsStatus::PUBLISHED)
                  ->orWhere('user_id', $userId);
            });
        } else {
            $query->where('status', NewsStatus::PUBLISHED);
        }

        $newsItems = $query->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('News/Index', [
            'newsItems' => $newsItems,
            'filters' => $request->only(['search']),
            'canCreateNews' => Auth::check(), // Any logged-in user can attempt to create
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Any authenticated user can see the form to create news.
        if (!Auth::check()) {
            return Redirect::route('login')->with('error', 'You must be logged in to create news.');
        }

        return Inertia::render('News/CreateEditForm', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'newsStatuses' => collect(NewsStatus::cases())->map(fn($status) => ['value' => $status->value, 'label' => Str::title($status->name)]),
            'news' => null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            // This should ideally be caught by middleware (e.g., 'auth') on the route
            abort(403, 'You must be logged in.');
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => ['required', new Enum(NewsStatus::class)],
            'published_at' => 'nullable|date',
            'content_blocks' => 'required|array|min:1',
            'content_blocks.*.id' => 'required|string',
            'content_blocks.*.type' => 'required|string|in:text,image',
            'content_blocks.*.data' => 'required|array',
            'content_blocks.*.data.text' => 'nullable|string|required_if:content_blocks.*.type,text',
            'content_blocks.*.data.file' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048|required_if:content_blocks.*.type,image',
            'content_blocks.*.data.caption' => 'nullable|string|max:255',
            'featured_image_file' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        $news = new News();
        $news->user_id = Auth::id(); // Assign the logged-in user's ID
        $news->title = $validatedData['title'];
        $news->category_id = $validatedData['category_id'];
        $news->status = $validatedData['status'];
        $news->published_at = $validatedData['published_at'] ?? ($validatedData['status'] === NewsStatus::PUBLISHED->value ? now() : null);
        $news->slug = $this->generateUniqueSlug($validatedData['title']);

        if ($request->hasFile('featured_image_file')) {
            $news->featured_image_url = $request->file('featured_image_file')->store('news_featured_images', 'public');
        }

        $processedBlocks = [];
        foreach ($validatedData['content_blocks'] as $block) {
            if ($block['type'] === 'image' && isset($block['data']['file']) && $block['data']['file'] instanceof \Illuminate\Http\UploadedFile) {
                $path = $block['data']['file']->store('news_content_images', 'public');
                $block['data']['url'] = Storage::url($path);
                unset($block['data']['file']);
            }
            $processedBlocks[] = $block;
        }
        $news->content_blocks = $processedBlocks;

        $news->save();

        return Redirect::route('news.index')->with('success', 'News article created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(News $news)
    {
        // If the news is not published, only the owner can view it.
        if ($news->status !== NewsStatus::PUBLISHED->value && (!Auth::check() || $news->user_id !== Auth::id())) {
            abort(403, 'You are not authorized to view this news article.');
        }

        $news->load(['category', 'user']);

        return Inertia::render('News/Show', [
            'newsArticle' => $news
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news)
    {
        // Only the user who created the news can edit it.
        if (!Auth::check() || $news->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to edit this news article.');
        }

        $news->load('category');
        $contentBlocks = collect($news->content_blocks)->map(function ($block) {
            if ($block['type'] === 'image' && isset($block['data']['url'])) {
                $block['data']['previewUrl'] = $block['data']['url'];
            }
            return $block;
        })->all();

        return Inertia::render('News/CreateEditForm', [
            'news' => $news->toArray() + ['content_blocks' => $contentBlocks],
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'newsStatuses' => collect(NewsStatus::cases())->map(fn($status) => ['value' => $status->value, 'label' => Str::title($status->name)]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, News $news)
    {
        // Only the user who created the news can update it.
        if (!Auth::check() || $news->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to update this news article.');
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => ['required', new Enum(NewsStatus::class)],
            'published_at' => 'nullable|date',
            'content_blocks' => 'required|array|min:1',
            // ... (rest of the validation rules are the same as store, but also include 'url' for existing images)
            'content_blocks.*.id' => 'required|string',
            'content_blocks.*.type' => 'required|string|in:text,image',
            'content_blocks.*.data' => 'required|array',
            'content_blocks.*.data.text' => 'nullable|string|required_if:content_blocks.*.type,text',
            'content_blocks.*.data.file' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'content_blocks.*.data.url' => 'nullable|string', // For existing images
            'content_blocks.*.data.caption' => 'nullable|string|max:255',
            'featured_image_file' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'remove_featured_image' => 'nullable|boolean',
        ]);

        if ($news->title !== $validatedData['title']) {
            $news->slug = $this->generateUniqueSlug($validatedData['title'], $news->id);
        }
        $news->title = $validatedData['title'];
        $news->category_id = $validatedData['category_id'];
        $news->status = $validatedData['status'];
        $news->published_at = $validatedData['published_at'] ?? ($validatedData['status'] === NewsStatus::PUBLISHED->value && is_null($news->published_at) ? now() : $news->published_at);

        if ($request->boolean('remove_featured_image') && $news->featured_image_url) {
            Storage::disk('public')->delete($news->featured_image_url);
            $news->featured_image_url = null;
        } elseif ($request->hasFile('featured_image_file')) {
            if ($news->featured_image_url) {
                Storage::disk('public')->delete($news->featured_image_url);
            }
            $news->featured_image_url = $request->file('featured_image_file')->store('news_featured_images', 'public');
        }

        // Simplified image processing for update (for full robustness, refer to previous more complex example)
        $originalImageUrls = collect($news->content_blocks)->where('type', 'image')->pluck('data.url')->filter()->all();
        $processedBlocks = [];
        $currentRequestImageUrls = [];

        foreach ($validatedData['content_blocks'] as $block) {
            $newBlock = $block;
            if ($block['type'] === 'image') {
                if (isset($block['data']['file']) && $block['data']['file'] instanceof \Illuminate\Http\UploadedFile) {
                    $newPath = $block['data']['file']->store('news_content_images', 'public');
                    $newBlock['data']['url'] = Storage::url($newPath);
                    // Simple deletion: find if this block ID had an old URL and delete it
                    $originalBlockData = collect($news->content_blocks)->firstWhere('id', $block['id']);
                    if ($originalBlockData && isset($originalBlockData['data']['url']) && $originalBlockData['data']['url'] !== $newBlock['data']['url']) {
                        $oldPathToDelete = Str::replaceFirst(Storage::url(''), '', $originalBlockData['data']['url']);
                        if(Storage::disk('public')->exists($oldPathToDelete)) Storage::disk('public')->delete($oldPathToDelete);
                    }
                } elseif (isset($block['data']['url'])) {
                    $newBlock['data']['url'] = $block['data']['url']; // Keep existing URL
                } else { // No file, no URL, means image was cleared from block
                    $originalBlockData = collect($news->content_blocks)->firstWhere('id', $block['id']);
                    if ($originalBlockData && isset($originalBlockData['data']['url'])) {
                        $oldPathToDelete = Str::replaceFirst(Storage::url(''), '', $originalBlockData['data']['url']);
                        if(Storage::disk('public')->exists($oldPathToDelete)) Storage::disk('public')->delete($oldPathToDelete);
                    }
                    $newBlock['data']['url'] = null;
                }
                unset($newBlock['data']['file']);
                if(!empty($newBlock['data']['url'])) $currentRequestImageUrls[] = $newBlock['data']['url'];
            }
            $processedBlocks[] = $newBlock;
        }
        $news->content_blocks = $processedBlocks;
        $news->save();

        // Delete images from storage that were in original blocks but not in current request blocks
        $urlsToDelete = array_diff($originalImageUrls, $currentRequestImageUrls);
        foreach ($urlsToDelete as $url) {
            $pathToDelete = Str::replaceFirst(Storage::url(''), '', $url);
            if(Storage::disk('public')->exists($pathToDelete)) Storage::disk('public')->delete($pathToDelete);
        }

        return Redirect::route('news.index')->with('success', 'News article updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news)
    {
        // Only the user who created the news can delete it.
        if (!Auth::check() || $news->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to delete this news article.');
        }

        if ($news->featured_image_url) {
            Storage::disk('public')->delete($news->featured_image_url);
        }
        if (is_array($news->content_blocks)) {
            foreach ($news->content_blocks as $block) {
                if ($block['type'] === 'image' && isset($block['data']['url'])) {
                     $pathToDelete = Str::replaceFirst(Storage::url(''), '', $block['data']['url']);
                     if(Storage::disk('public')->exists($pathToDelete)) Storage::disk('public')->delete($pathToDelete);
                }
            }
        }
        $news->delete();

        return Redirect::route('news.index')->with('success', 'News article deleted successfully.');
    }

    /**
     * Helper function to generate a unique slug.
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;
        while (News::where('slug', $slug)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        return $slug;
    }
}
