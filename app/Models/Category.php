<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * Get the news articles associated with this category.
     */
    public function news(): HasMany
    {
        return $this->hasMany(News::class);
    }

    /**
     * Get the route key for the model.
     *
     * By default, Laravel uses the primary key (id) for route model binding.
     * This changes it to use the 'slug' column instead.
     * e.g., Route::get('/categories/{category}', ...);
     *
     * @return string
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
