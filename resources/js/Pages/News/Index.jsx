import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Simple Pagination Component (can be moved to a shared component later)
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


export default function Index({ auth, newsItems, filters, canCreateNews, success, error }) {
    // The success and error props come from the flash session messages passed by the controller

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">News Articles</h2>}
        >
            <Head title="News Articles" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Display Flash Messages */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-300 rounded">
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
                            {error}
                        </div>
                    )}


                    {canCreateNews && (
                        <div className="mb-4 text-right">
                            <Link
                                href={route('news.create')}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Create News
                            </Link>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {newsItems.data.length === 0 && (
                                <p>No news articles found.</p>
                            )}
                            {newsItems.data.map((news) => (
                                <div key={news.id} className="mb-6 pb-6 border-b last:border-b-0">
                                    <h3 className="text-2xl font-semibold hover:text-indigo-600">
                                        <Link href={route('news.show', news.slug)}>{news.title}</Link>
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        By {news.user ? news.user.name : 'Unknown Author'} in <Link href={route('categories.show', news.category.slug)} className="text-indigo-500 hover:underline">{news.category ? news.category.name : 'Uncategorized'}</Link>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Status: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${news.status === 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{news.status}</span>
                                        {news.published_at && ` | Published on: ${new Date(news.published_at).toLocaleDateString()}`}
                                    </p>
                                    <div className="mt-4 flex items-center space-x-4">
                                        <Link href={route('news.show', news.slug)} className="text-indigo-600 hover:text-indigo-900">Read more &rarr;</Link>

                                        {/* Show Edit and Delete buttons only if the authenticated user is the author */}
                                        {auth.user && auth.user.id === news.user_id && (
                                            <>
                                                <Link href={route('news.edit', news.slug)} className="text-blue-600 hover:text-blue-900">Edit</Link>

                                                {/* --- DELETE BUTTON ADDED HERE --- */}
                                                <Link
                                                    href={route('news.destroy', news.slug)}
                                                    method="delete"
                                                    as="button"
                                                    type="button"
                                                    className="text-red-600 hover:text-red-900"
                                                    onBefore={() => confirm('Are you sure you want to delete this news article? This action cannot be undone.')}
                                                    preserveScroll // Keeps you at the same scroll position on the page after deletion
                                                >
                                                    Delete
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Pagination links={newsItems.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
