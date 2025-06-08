<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\News; // To check if a category has news items
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $categories = Category::query()
            ->withCount('news') // Get the number of news articles in each category
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
            // For simplicity, only authenticated users can see the 'create' button.
            // In a real app, this would be a more specific permission.
            'canCreateCategory' => Auth::check(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Simple check: must be logged in. Refine with roles/permissions in a real app.
        if (!Auth::check()) {
            return Redirect::route('login')->with('error', 'You must be logged in to create a category.');
        }

        return Inertia::render('Categories/CreateEditForm', [
            'category' => null, // For the form, to indicate it's a create operation
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Simple check: must be logged in. Refine with roles/permissions in a real app.
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
            // Slug can be auto-generated or optionally provided
            'slug' => 'nullable|string|max:255|unique:categories,slug',
        ]);

        $category = new Category();
        $category->name = $validatedData['name'];
        $category->description = $validatedData['description'];
        $category->slug = !empty($validatedData['slug']) ? Str::slug($validatedData['slug']) : $this->generateUniqueSlug($validatedData['name']);

        $category->save();

        return Redirect::route('categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     * Category model uses slug for route model binding.
     */
    public function show(Request $request, Category $category)
    {
        // Anyone can view a category.
        // Load news for this category, paginated
        $newsItems = News::where('category_id', $category->id)
            ->where('status', \App\Enums\NewsStatus::PUBLISHED) // Assuming NewsStatus Enum
            ->with('user') // Eager load user for news items
            ->orderBy('published_at', 'desc')
            ->paginate(10, ['*'], 'newsPage') // Use a different page name for news pagination
            ->withQueryString();


        return Inertia::render('Categories/Show', [
            'category' => $category->loadCount('news'),
            'newsItems' => $newsItems,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        // Simple check: must be logged in. Refine with roles/permissions in a real app.
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Categories/CreateEditForm', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        // Simple check: must be logged in. Refine with roles/permissions in a real app.
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => 'nullable|string|max:1000',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
        ]);

        $category->name = $validatedData['name'];
        $category->description = $validatedData['description'];

        if (!empty($validatedData['slug'])) {
            $category->slug = Str::slug($validatedData['slug']);
        } elseif ($category->name !== $validatedData['name']) { // Auto-update slug if name changed and slug not provided
            $category->slug = $this->generateUniqueSlug($validatedData['name'], $category->id);
        }
        // If name didn't change and slug wasn't provided, keep the old slug.

        $category->save();

        return Redirect::route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Simple check: must be logged in. Refine with roles/permissions in a real app.
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        // Prevent deletion if category has news items associated with it.
        // Adjust this logic based on your application's requirements (e.g., set news.category_id to null, or cascade delete).
        if ($category->news()->count() > 0) {
            return Redirect::route('categories.index')->with('error', 'Cannot delete category: It has associated news articles.');
        }

        $category->delete();

        return Redirect::route('categories.index')->with('success', 'Category deleted successfully.');
    }

    /**
     * Helper function to generate a unique slug for categories.
     */
    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Category::where('slug', $slug)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        return $slug;
    }
}
