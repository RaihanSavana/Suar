import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Adjust path if needed
import { Head, Link, usePage } from '@inertiajs/react';

// Helper component to render individual content blocks
// You could move this to a separate file if it gets more complex
const ContentBlockRenderer = ({ block }) => {
    if (!block || !block.type || !block.data) {
        return null; // Or some fallback UI for invalid block data
    }

    switch (block.type) {
        case 'text':
            // If your text block can contain HTML and you trust the source,
            // you might use dangerouslySetInnerHTML={{ __html: block.data.text }}
            // BUT BE VERY CAREFUL ABOUT XSS VULNERABILITIES.
            // For plain text:
            return <p className="my-4 text-gray-700 leading-relaxed whitespace-pre-line">{block.data.text}</p>;
        case 'image':
            return (
                <figure className="my-6">
                    <img
                        src={block.data.url} // URL is from Storage::url() on the backend
                        alt={block.data.caption || 'News image'}
                        className="max-w-full h-auto rounded-lg shadow-md mx-auto" // Added mx-auto for centering
                    />
                    {block.data.caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                            {block.data.caption}
                        </figcaption>
                    )}
                </figure>
            );
        // Add cases for other block types here (e.g., 'video', 'quote')
        default:
            return (
                <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                    Unsupported block type: {block.type}
                </div>
            );
    }
};

export default function Show({ auth, newsArticle, success }) { // 'auth' and 'success' (flash message) are available
    // const { auth } = usePage().props; // Alternative way to get auth if not passed directly

    const canEdit = auth.user && newsArticle && auth.user.id === newsArticle.user_id;
    const canDelete = auth.user && newsArticle && auth.user.id === newsArticle.user_id; // Or some other permission

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {newsArticle.title}
                </h2>
            }
        >
            <Head title={newsArticle.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8"> {/* Increased max-width for article readability */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded">
                            {success}
                        </div>
                    )}
                    <article className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 md:p-8 bg-white border-b border-gray-200">
                            {/* Optional: Featured Image Display if you have one and it's not part of content_blocks */}
                            {newsArticle.featured_image_url && (
                                <img
                                    src={`/storage/${newsArticle.featured_image_url}`} // Adjust if Storage::url() already provides full path
                                    alt={newsArticle.title}
                                    className="w-full h-auto object-cover rounded-lg mb-6 shadow-lg"
                                    style={{ maxHeight: '400px' }} // Example max height
                                />
                            )}

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                {newsArticle.title}
                            </h1>
                            <div className="mb-6 text-sm text-gray-600">
                                <span>
                                    By <span className="font-medium">{newsArticle.user ? newsArticle.user.name : 'Unknown Author'}</span>
                                </span>
                                <span className="mx-2">|</span>
                                <span>
                                    In <Link href={route('categories.show', newsArticle.category.slug)} className="text-indigo-600 hover:underline">{newsArticle.category ? newsArticle.category.name : 'Uncategorized'}</Link>
                                </span>
                                <span className="mx-2">|</span>
                                <span>
                                    Published on: {new Date(newsArticle.published_at || newsArticle.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            {/* Render Content Blocks */}
                            <div className="prose prose-lg max-w-none"> {/* Tailwind Typography for nice article styling */}
                                {newsArticle.content_blocks && newsArticle.content_blocks.map((block) => (
                                    <ContentBlockRenderer key={block.id} block={block} />
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                                <Link href={route('news.index')} className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
                                    &larr; Back to All News
                                </Link>
                                <div className="space-x-3">
                                    {canEdit && (
                                        <Link
                                            href={route('news.edit', newsArticle.slug)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                    {/* Add Delete button here if needed, likely with a confirmation dialog */}
                                    {/* For delete, you'd use <Link method="delete" as="button" ... /> */}
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
