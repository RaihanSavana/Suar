import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';


const MainHeadlineCard = ({ news }) => (
    <article className="pb-6 mb-6">
        {news.featured_image_url && (
            <Link href={route('news.show', news.slug)}>
                <img
                    src={`/storage/${news.featured_image_url}`}
                    alt={news.title}
                    className="w-full h-auto object-cover mb-4"
                />
            </Link>
        )}
        <p className="text-sm text-indigo-600 font-sans uppercase font-semibold">
            <Link href={route('categories.show', news.category.slug)} className="hover:underline">
                {news.category.name}
            </Link>
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold font-serif text-gray-900 leading-tight">
            <Link href={route('news.show', news.slug)} className="hover:text-gray-700">
                {news.title}
            </Link>
        </h1>
        <p className="mt-3 text-base text-gray-700 font-sans">
            By {news.user.name} on {new Date(news.published_at || news.created_at).toLocaleDateString()}
        </p>
    </article>
);

const LeftSidebarCard = ({ news }) => (
    <div className="py-4 border-b border-gray-200">
        <Link href={route('news.show', news.slug)}>
            <div className="grid grid-cols-3 gap-3 items-start">
                {news.featured_image_url && (
                    <img
                        src={`/storage/${news.featured_image_url}`}
                        alt={news.title}
                        className="col-span-1 h-16 w-full object-cover rounded"
                    />
                )}
                <h4 className={`font-semibold text-gray-800 leading-tight hover:text-indigo-700 ${news.featured_image_url ? 'col-span-2' : 'col-span-3'}`}>
                    {news.title}
                </h4>
            </div>
        </Link>
    </div>
);

const SideArticleLink = ({ news }) => (
    <div className="py-3 border-b border-gray-200">
        <h4 className="font-serif font-semibold text-gray-800 leading-tight">
            <Link href={route('news.show', news.slug)} className="hover:underline">
                {news.title}
            </Link>
        </h4>
    </div>
);

const BottomNewsCard = ({ news }) => (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {news.featured_image_url && (
            <Link href={route('news.show', news.slug)}>
                <img
                    src={`/storage/${news.featured_image_url}`}
                    alt={news.title}
                    className="w-full h-40 object-cover"
                />
            </Link>
        )}
        <div className="p-5 flex-grow">
            <p className="text-xs text-indigo-600 font-semibold uppercase font-sans">
                <Link href={route('categories.show', news.category.slug)} className="hover:underline">
                    {news.category.name}
                </Link>
            </p>
            <h3 className="mt-1 text-lg font-bold font-serif text-gray-900 leading-tight">
                <Link href={route('news.show', news.slug)} className="hover:text-indigo-700">
                    {news.title}
                </Link>
            </h3>
        </div>
    </article>
);


// --- Main Page Component ---

export default function Home({ newsItems }) {
    const articles = newsItems.data;
    const mainArticle = articles[0] || null;
    const leftSideArticles = articles.slice(1, 4);
    const rightSideArticles = articles.slice(4, 9);
    const bottomGridArticles = articles.slice(9);

    return (
        <PublicLayout>
            <Head title="Home" />

            {/* This div now only adds horizontal padding, not a max-width, so content can go edge-to-edge */}
            <div className="px-4 sm:px-6 lg:px-8">
                {/* --- Top Section: 3-Column Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-x-12">

                    {/* Left Side Column */}
                    <aside className="lg:col-span-1">
                         <h2 className="font-bold font-serif text-xl border-b-2 border-gray-800 pb-2 mb-2">Highlights</h2>
                        {leftSideArticles.length > 0 ? (
                            leftSideArticles.map(news => (
                                <LeftSidebarCard key={`left-${news.id}`} news={news} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 font-sans mt-4">No other articles.</p>
                        )}
                    </aside>

                    {/* Center Column */}
                    <main className="lg:col-span-2 mt-8 lg:mt-0 border-r border-l border-gray-300 px-0 lg:px-8">
                        {mainArticle ? (
                            <MainHeadlineCard news={mainArticle} />
                        ) : (
                            <div className="text-center py-24">
                                <p className="text-2xl text-gray-500 font-serif">Welcome to Suar.</p>
                                <p className="text-lg text-gray-400 font-sans">No articles published yet.</p>
                            </div>
                        )}
                    </main>

                    {/* Right Side Column */}
                    <aside className="lg:col-span-1 mt-8 lg:mt-0">
                        <h2 className="font-bold font-serif text-xl border-b-2 border-gray-800 pb-2 mb-2">Trending</h2>
                        {rightSideArticles.length > 0 ? (
                            rightSideArticles.map(news => (
                                <SideArticleLink key={`right-${news.id}`} news={news} />
                            ))
                        ) : (
                             <p className="text-sm text-gray-500 font-sans mt-4">No other articles.</p>
                        )}
                    </aside>

                </div>

                {/* --- Bottom Section: More News Grid --- */}
                {bottomGridArticles.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <h2 className="font-bold font-serif text-2xl mb-6 text-center">More From Suar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {bottomGridArticles.map((news) => (
                                <BottomNewsCard key={`bottom-${news.id}`} news={news} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination has been removed as requested */}

            </div>
        </PublicLayout>
    );
}
