<?php

namespace App\Models;

use App\Enums\NewsStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
// For PHP 8.1+ Enums with Laravel 9/10+
// use App\Enums\NewsStatus; // Assuming you create an Enum for status

class News extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'content_blocks',
        'featured_image_url',
        'status',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'content_blocks' => 'array', // Casts the JSON 'content_blocks' to a PHP array automatically
        'published_at' => 'datetime', // Casts 'published_at' to a Carbon instance
        // For PHP 8.1+ Enums with Laravel 9/10+:
        'status' => NewsStatus::class,
    ];

    /**
     * Get the user that owns the news article.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category the news article belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Scope a query to only include published news articles.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    /**
     * Scope a query to only include draft news articles.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }
}
