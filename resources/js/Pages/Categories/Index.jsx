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

export default function Index({ auth, categories, filters, canCreateCategory, success, error }) {
    // The success and error props come from flash session messages passed by the controller

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Categories</h2>}
        >
            <Head title="Categories" />

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

                    {canCreateCategory && (
                        <div className="mb-4 text-right">
                            <Link
                                href={route('categories.create')}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Create Category
                            </Link>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {categories.data.length === 0 && (
                                <p>No categories found.</p>
                            )}
                            <ul className="divide-y divide-gray-200">
                                {categories.data.map((category) => (
                                    <li key={category.id} className="py-4 flex justify-between items-center">
                                        <div>
                                            <Link href={route('categories.show', category.slug)} className="text-lg font-medium text-gray-900 hover:text-indigo-600">
                                                {category.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{category.news_count} news articles</p>
                                        </div>

                                        {/* Show Edit and Delete buttons only if the user has permission */}
                                        {auth.user && canCreateCategory && ( // Assuming canCreateCategory implies canEdit/Delete for simplicity
                                             <div className="space-x-4">
                                                <Link href={route('categories.edit', category.slug)} className="text-sm text-blue-600 hover:text-blue-900">Edit</Link>

                                                {/* --- DELETE BUTTON ADDED HERE --- */}
                                                <Link
                                                    href={route('categories.destroy', category.slug)}
                                                    method="delete"
                                                    as="button"
                                                    type="button"
                                                    className="text-sm text-red-600 hover:text-red-900"
                                                    onBefore={() => confirm('Are you sure you want to delete this category? This action cannot be undone.')}
                                                    preserveScroll
                                                >
                                                    Delete
                                                </Link>
                                             </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <Pagination links={categories.links} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
