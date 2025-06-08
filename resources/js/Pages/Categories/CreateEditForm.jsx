import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// Reusable Input components (can be moved to separate files)
const InputLabel = ({ forInput, value, className, children }) => (
    <label htmlFor={forInput} className={`block font-medium text-sm text-gray-700 ` + className}>
        {value ? value : children}
    </label>
);

const TextInput = ({ type = 'text', name, id, value, className, autoComplete, isFocused, handleChange, ...props }) => {
    useEffect(() => {
        if (isFocused) {
            document.getElementById(id)?.focus();
        }
    }, []);

    return (
        <input
            type={type}
            name={name}
            id={id}
            value={value}
            className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ` + className}
            autoComplete={autoComplete}
            onChange={handleChange}
            {...props}
        />
    );
};

const PrimaryButton = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        className={
            `inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
                disabled && 'opacity-25'
            } ` + className
        }
        disabled={disabled}
    >
        {children}
    </button>
);


export default function CreateEditForm({ auth, category }) {
    const isEditing = !!category; // True if 'category' prop is provided

    const { data, setData, post, processing, errors, reset } = useForm({
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
        _method: 'PUT', // We'll use this for method spoofing on the update
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // For updates, we use POST but spoof it as PUT. Inertia handles this nicely.
            post(route('categories.update', category.slug), {
                onSuccess: () => reset(),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{isEditing ? `Edit Category: ${category.name}` : 'Create New Category'}</h2>}
        >
            <Head title={isEditing ? 'Edit Category' : 'Create Category'} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
                        <form onSubmit={handleSubmit}>
                            {/* Category Name */}
                            <div className="mb-4">
                                <InputLabel forInput="name" value="Category Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    handleChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Category Slug */}
                            <div className="mb-4">
                                <InputLabel forInput="slug" value="Slug (URL Friendly)" />
                                <TextInput
                                    id="slug"
                                    name="slug"
                                    value={data.slug}
                                    className="mt-1 block w-full"
                                    handleChange={(e) => setData('slug', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional. If left blank, it will be automatically generated from the name.</p>
                                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            {/* Category Description */}
                            <div className="mb-6">
                                <InputLabel forInput="description" value="Description" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="4"
                                    placeholder="A brief description of the category..."
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end mt-6">
                                <Link href={route('categories.index')} className="text-sm text-gray-600 hover:text-gray-900 mr-4">
                                    Cancel
                                </Link>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
