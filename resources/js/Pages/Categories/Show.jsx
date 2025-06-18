import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

// --- Reusable Components with Newspaper Styling ---

// A card for the main featured article of the category
const NewspaperFeaturedCard = ({ news }) => (
    // No background or shadow, structure is defined by content and borders
    <article>
        {news.featured_image_url && (
            <Link href={route('news.show', news.slug)}>
                <img
                    src={`/storage/${news.featured_image_url}`}
                    alt={news.title}
                    className="w-full h-auto object-cover"
                />
            </Link>
        )}
        <div className="mt-4">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 leading-tight">
                <Link href={route('news.show', news.slug)} className="hover:text-gray-700">
                    {news.title}
                </Link>
            </h2>
            <p className="mt-3 text-sm text-gray-600 font-sans">
                By {news.user.name} on {new Date(news.published_at || news.created_at).toLocaleDateString()}
            </p>
        </div>
    </article>
);

// A smaller card for the rest of the articles in the grid
const NewspaperStandardCard = ({ news }) => (
    // No background or shadow
    <article>
        {news.featured_image_url && (
            <Link href={route('news.show', news.slug)}>
                <img
                    src={`/storage/${news.featured_image_url}`}
                    alt={news.title}
                    className="w-full h-40 object-cover"
                />
            </Link>
        )}
        <div className="mt-3">
            <h3 className="text-lg font-bold font-serif text-gray-900 leading-tight">
                <Link href={route('news.show', news.slug)} className="hover:text-gray-700">
                    {news.title}
                </Link>
            </h3>
        </div>
    </article>
);


const Pagination = ({ links }) => {
    if (!links || links.length <= 3) return null;
    return (
        <div className="mt-12 flex justify-center space-x-1">
            {links.map((link, key) => (
                link.url === null ? (
                    <div key={key} className="px-4 py-2 text-sm text-gray-400 border rounded-md" dangerouslySetInnerHTML={{ __html: link.label }} />
                ) : (
                    <Link key={`link-${key}`} className={`px-4 py-2 text-sm border rounded-md hover:bg-indigo-500 hover:text-white ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
                )
            ))}
        </div>
    );
};


// --- Main Page Component ---

export default function Show({ category, newsItems }) {
    const featuredArticle = newsItems.data.length > 0 ? newsItems.data[0] : null;
    const otherArticles = newsItems.data.length > 1 ? newsItems.data.slice(1) : [];

    return (
        <PublicLayout>
            <Head title={category.name} />

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* --- Category Header --- */}
                    <div className="py-8 text-center border-b-2 border-gray-800 mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">{category.name}</h1>
                        {category.description && (
                            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{category.description}</p>
                        )}
                    </div>

                    {/* --- Main Content Grid --- */}
                    {featuredArticle ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Featured Article (takes up 2 columns) */}
                            <div className="md:col-span-2">
                                <NewspaperFeaturedCard news={featuredArticle} />
                            </div>

                            {/* A smaller list of other articles (takes up 1 column) */}
                            <div className="md:col-span-1 space-y-8">
                                {otherArticles.slice(0, 2).map(news => ( // Show first 3 "other" articles here
                                    <NewspaperStandardCard key={`top-${news.id}`} news={news} />
                                ))}
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">No news articles found in this category yet.</p>
                        </div>
                    )}

                    {/* --- Grid for the rest of the articles --- */}
                    {otherArticles.length > 3 && (
                         <div className="mt-12 pt-8 border-t border-gray-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                 {otherArticles.slice(3).map(news => (
                                     <NewspaperStandardCard key={`bottom-${news.id}`} news={news} />
                                 ))}
                             </div>
                         </div>
                    )}

                    {/* Pagination for the category */}
                    <Pagination links={newsItems.links} />

                </div>
            </div>
        </PublicLayout>
    );
}
