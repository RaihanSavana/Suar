import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

// --- Reusable Components ---

const ContentBlockRenderer = ({ block }) => {
    if (!block || !block.type || !block.data) return null;
    switch (block.type) {
        case 'text':
            return <p className="my-6 text-lg leading-relaxed whitespace-pre-line">{block.data.text}</p>;
        case 'image':
            return (
                <figure className="my-8">
                    <img src={block.data.url} alt={block.data.caption || 'News image'} className="max-w-full h-auto rounded-lg shadow-md mx-auto" />
                    {block.data.caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                            {block.data.caption}
                        </figcaption>
                    )}
                </figure>
            );
        default:
            return null;
    }
};

const NewspaperArticleCard = ({ news }) => (
    <article className="flex flex-col">
        {news.featured_image_url && (
            <Link href={route('news.show', news.slug)}>
                <img src={`/storage/${news.featured_image_url}`} alt={news.title} className="w-full h-48 object-cover" />
            </Link>
        )}
        <div className="pt-4">
            <p className="text-xs text-indigo-600 font-semibold uppercase font-sans">
                <Link href={route('categories.show', news.category.slug)} className="hover:underline">
                    {news.category.name}
                </Link>
            </p>
            <h3 className="mt-1 text-xl font-bold font-serif text-gray-900 leading-tight">
                <Link href={route('news.show', news.slug)} className="hover:text-gray-700">
                    {news.title}
                </Link>
            </h3>
        </div>
    </article>
);


// --- Main Page Component ---

export default function NewsShow({ newsArticle, moreNews }) {
    const metaDescription = newsArticle.content_blocks.find(b => b.type === 'text')?.data.text.substring(0, 160) || newsArticle.title;

    return (
        <PublicLayout>
            <Head>
                <title>{newsArticle.title}</title>
                <meta name="description" content={metaDescription} />
            </Head>

            <div className="px-4 sm:px-6 lg:px-8">
                {/* Main container for the article content */}
                <div className="max-w-4xl mx-auto">
                    <main>
                        {/* The container below no longer has a background, shadow, or rounded corners */}
                        <div className="py-6 md:py-10">
                            {/* --- Header Section (Title & Main Picture) --- */}
                            <div className="border-b-2 border-gray-800 pb-6 mb-6">
                                <p className="text-sm text-indigo-600 font-sans uppercase font-semibold">
                                    <Link href={route('categories.show', newsArticle.category.slug)} className="hover:underline">
                                        {newsArticle.category.name}
                                    </Link>
                                </p>
                                <h1 className="mt-2 text-3xl md:text-5xl font-bold font-serif text-gray-900">
                                    {newsArticle.title}
                                </h1>
                                <p className="mt-4 text-base text-gray-700 font-sans">
                                    By {newsArticle.user.name} on {new Date(newsArticle.published_at || newsArticle.created_at).toLocaleDateString()}
                                </p>
                                {newsArticle.featured_image_url && (
                                    <img
                                        src={`/storage/${newsArticle.featured_image_url}`}
                                        alt={newsArticle.title}
                                        className="w-full h-auto object-cover mt-6"
                                    />
                                )}
                            </div>

                            {/* --- Body Section (Content Blocks) --- */}
                            <div className="prose prose-lg max-w-none">
                                {newsArticle.content_blocks && newsArticle.content_blocks.map((block) => (
                                    <ContentBlockRenderer key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- Bottom Section: More News Grid --- */}
                {moreNews.length > 0 && (
                    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-300">
                        <h2 className="font-bold font-serif text-3xl mb-8 text-center">More News</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {moreNews.map((news) => (
                                <NewspaperArticleCard key={`more-news-${news.id}`} news={news} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
