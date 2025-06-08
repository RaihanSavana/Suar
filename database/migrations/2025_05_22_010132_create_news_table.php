<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id(); // Use id() as primary key (it's bigIncrements by default)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');

            // Link to a categories table
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade'); // Or onDelete('set null') if a category can be deleted but news remains

            $table->json('content_blocks')->nullable(); // For dynamic text/image blocks. Nullable if content can be empty initially.

            $table->string('slug')->unique()->nullable(); // Good for SEO-friendly URLs
            $table->string('featured_image_url')->nullable(); // Optional: A main image for the article listing
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // To manage publication status
            $table->timestamp('published_at')->nullable(); // To schedule posts or record publish date

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
