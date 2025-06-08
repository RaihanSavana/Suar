import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// You can move this Pagination component to a shared file like /resources/js/Components/Pagination.jsx
const Pagination = ({ links }) => {
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-6 flex flex-wrap -mb-1">
            {links.map((link, key) => (
                link.url === null ?
                    (
                        <div
                            key={key}
                            className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) :
                    (
                        <Link
                            key={`link-${key}`}
                            className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-white' : ''}`}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
            ))}
        </div>
    );
};


export default function Show({ auth, category, newsItems }) {
    // A simple permission check. In a real app, you'd use a more robust role/permission system.
    // This assumes anyone who can create categories can also edit them.
    const canEditCategory = auth.user; // Simplified for this example.

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Category: {category.name}</h2>}
        >
            <Head title={`Category: ${category.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                                    {category.description && (
                                        <p className="mt-2 text-gray-600 max-w-2xl">{category.description}</p>
                                    )}
                                </div>
                                {canEditCategory && (
                                    <Link
                                        href={route('categories.edit', category.slug)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Edit Category
                                    </Link>
                                )}
                            </div>

                            <h3 className="text-2xl font-semibold mb-4 border-t pt-6">Articles in this Category</h3>

                            {/* List of News Articles */}
                            {newsItems.data.length === 0 ? (
                                <p>No news articles found in this category yet.</p>
                            ) : (
                                <div>
                                    {newsItems.data.map((news) => (
                                        <div key={news.id} className="mb-6 pb-6 border-b last:border-b-0">
                                            <h4 className="text-xl font-semibold hover:text-indigo-600">
                                                <Link href={route('news.show', news.slug)}>{news.title}</Link>
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                By {news.user ? news.user.name : 'Unknown Author'}
                                                {news.published_at && ` on ${new Date(news.published_at).toLocaleDateString()}`}
                                            </p>
                                            <div className="mt-3">
                                                <Link href={route('news.show', news.slug)} className="text-indigo-600 hover:text-indigo-900">Read more &rarr;</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Pagination links={newsItems.links} />

                        </div>
                    </div>
                     <div className="mt-6">
                        <Link href={route('categories.index')} className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
                            &larr; Back to All Categories
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
