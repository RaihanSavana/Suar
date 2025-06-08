// resources/js/Pages/News/CreateEditForm.jsx
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique block IDs

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

const SelectInput = ({ name, id, value, className, handleChange, children, ...props }) => (
    <select
        name={name}
        id={id}
        value={value}
        className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ` + className}
        onChange={handleChange}
        {...props}
    >
        {children}
    </select>
);

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

const DangerButton = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        className={
            `inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
                disabled && 'opacity-25'
            } ` + className
        }
        disabled={disabled}
    >
        {children}
    </button>
);


export default function CreateEditForm({ auth, news, categories, newsStatuses }) {
    const isEditing = !!news; // True if 'news' prop is provided (editing mode)
    const { data, setData, post, put, processing, errors, progress, reset } = useForm({
        title: news?.title || '',
        category_id: news?.category_id || '',
        status: news?.status || (newsStatuses.length > 0 ? newsStatuses[0].value : 'draft'), // Default to first status or 'draft'
        published_at: news?.published_at ? news.published_at.substring(0, 16) : '', // Format for datetime-local
        featured_image_file: null, // For new uploads
        remove_featured_image: false,
        content_blocks: news?.content_blocks?.map(block => ({ // Prepare existing blocks for editing
            ...block,
            // If image block, ensure `file` is null initially and `previewUrl` is set from existing `url`
            data: block.type === 'image' ? { ...block.data, file: null, previewUrl: block.data.url || null } : block.data,
        })) || [],
        _method: isEditing ? 'PUT' : 'POST', // For method spoofing if using POST for PUT
    });

    // Handle featured image preview
    const [featuredImagePreview, setFeaturedImagePreview] = useState(news?.featured_image_url ? `/storage/${news.featured_image_url}` : null);

    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        setData('featured_image_file', file);
        if (file) {
            setFeaturedImagePreview(URL.createObjectURL(file));
        } else {
            setFeaturedImagePreview(news?.featured_image_url ? `/storage/${news.featured_image_url}` : null);
        }
    };

    // Content Blocks Management
    const addContentBlock = (type) => {
        const newBlock = {
            id: uuidv4(), // Frontend unique ID
            type: type,
            data: type === 'text' ? { text: '' } : { caption: '', file: null, previewUrl: null },
        };
        setData('content_blocks', [...data.content_blocks, newBlock]);
    };

    const updateContentBlockData = (id, field, value) => {
        setData('content_blocks', data.content_blocks.map(block =>
            block.id === id ? { ...block, data: { ...block.data, [field]: value } } : block
        ));
    };

    const handleContentBlockFileChange = (id, file) => {
        setData('content_blocks', data.content_blocks.map(block =>
            block.id === id ? { ...block, data: { ...block.data, file: file, previewUrl: file ? URL.createObjectURL(file) : null } } : block
        ));
    };

    const removeContentBlock = (id) => {
        const blockToRemove = data.content_blocks.find(b => b.id === id);
        if (blockToRemove?.data?.previewUrl && blockToRemove.data.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blockToRemove.data.previewUrl); // Clean up blob URL
        }
        setData('content_blocks', data.content_blocks.filter(block => block.id !== id));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionRoute = isEditing ? route('news.update', news.slug) : route('news.store');

        // When using POST for PUT, Inertia handles the _method field automatically if it's in the form data.
        // For file uploads, Inertia's useForm automatically uses FormData.
        // We need to ensure that for existing image blocks, if no new file is selected, we don't send `file: null`
        // and instead ensure the backend knows to keep the existing `url`.
        // The backend controller logic for update should handle this.

        const formDataToSubmit = {
            ...data,
            content_blocks: data.content_blocks.map(block => {
                if (block.type === 'image') {
                    const newBlockData = { caption: block.data.caption };
                    if (block.data.file instanceof File) { // If a new file is actually selected
                        newBlockData.file = block.data.file;
                    } else if (block.data.url && !isEditing) { // This case should ideally not happen for create
                        // This logic is more relevant for an update when an image is kept
                        newBlockData.url = block.data.url;
                    } else if (isEditing && block.data.url) { // If editing and no new file, send existing URL
                         newBlockData.url = block.data.url;
                    }
                    // Ensure file object is not sent if it's not a File instance (e.g. it was null)
                    // The backend validation for `file` being `required_if:content_blocks.*.type,image`
                    // might need adjustment if `url` is present for existing images during update.
                    // For CREATE: file is required for image blocks.
                    // For UPDATE: file is optional IF url is present and not being replaced.
                    return { ...block, data: newBlockData };
                }
                return block;
            })
        };

        if (isEditing) {
            // Inertia's post method can handle _method: 'PUT' for file uploads
            post(submissionRoute, {
                data: formDataToSubmit, // Explicitly pass data for clarity with complex objects
                forceFormData: true, // Ensure multipart/form-data for file uploads
                onSuccess: () => reset(), // Or redirect, or show message
            });
        } else {
            post(submissionRoute, {
                data: formDataToSubmit,
                forceFormData: true,
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{isEditing ? 'Edit News Article' : 'Create News Article'}</h2>}
        >
            <Head title={isEditing ? 'Edit News' : 'Create News'} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
                        <form onSubmit={handleSubmit}>
                            {/* Title */}
                            <div className="mb-4">
                                <InputLabel forInput="title" value="Title" />
                                <TextInput
                                    id="title"
                                    name="title"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    handleChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <InputLabel forInput="category_id" value="Category" />
                                <SelectInput
                                    id="category_id"
                                    name="category_id"
                                    value={data.category_id}
                                    className="mt-1 block w-full"
                                    handleChange={(e) => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </SelectInput>
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <InputLabel forInput="status" value="Status" />
                                <SelectInput
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    className="mt-1 block w-full"
                                    handleChange={(e) => setData('status', e.target.value)}
                                >
                                    {newsStatuses.map((status) => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </SelectInput>
                                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                            </div>

                            {/* Published At */}
                            <div className="mb-4">
                                <InputLabel forInput="published_at" value="Publish Date (Optional)" />
                                <TextInput
                                    id="published_at"
                                    name="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    className="mt-1 block w-full"
                                    handleChange={(e) => setData('published_at', e.target.value)}
                                />
                                {errors.published_at && <p className="text-red-500 text-xs mt-1">{errors.published_at}</p>}
                            </div>

                            {/* Featured Image */}
                            <div className="mb-6">
                                <InputLabel forInput="featured_image_file" value="Featured Image (Optional)" />
                                {featuredImagePreview && <img src={featuredImagePreview} alt="Featured Preview" className="mt-2 mb-2 max-h-48 object-contain rounded-md"/>}
                                {isEditing && news?.featured_image_url && !data.featured_image_file && (
                                    <div className="mt-2 mb-2">
                                        <InputLabel className="inline-flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                checked={data.remove_featured_image}
                                                onChange={(e) => setData('remove_featured_image', e.target.checked)}
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Remove current featured image</span>
                                        </InputLabel>
                                    </div>
                                )}
                                <TextInput
                                    id="featured_image_file"
                                    name="featured_image_file"
                                    type="file"
                                    className="mt-1 block w-full p-2 border"
                                    handleChange={handleFeaturedImageChange}
                                    accept="image/*"
                                />
                                {errors.featured_image_file && <p className="text-red-500 text-xs mt-1">{errors.featured_image_file}</p>}
                            </div>


                            {/* Content Blocks Editor */}
                            <div className="mb-6 p-4 border border-gray-200 rounded-md">
                                <h3 className="text-lg font-semibold mb-3">Content Blocks</h3>
                                {data.content_blocks.map((block, index) => (
                                    <div key={block.id} className="mb-4 p-3 border rounded-md bg-gray-50 relative">
                                        <div className="absolute top-2 right-2">
                                            <DangerButton type="button" onClick={() => removeContentBlock(block.id)} className="text-xs !px-2 !py-1">
                                                Remove
                                            </DangerButton>
                                        </div>
                                        <p className="font-medium capitalize text-gray-700 mb-1">{block.type} Block</p>
                                        {block.type === 'text' && (
                                            <div>
                                                <InputLabel forInput={`text_block_${block.id}`} value="Text" className="sr-only"/>
                                                <textarea
                                                    id={`text_block_${block.id}`}
                                                    value={block.data.text}
                                                    onChange={(e) => updateContentBlockData(block.id, 'text', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    rows="5"
                                                    placeholder="Enter text content..."
                                                ></textarea>
                                                 {errors[`content_blocks.${index}.data.text`] && <p className="text-red-500 text-xs mt-1">{errors[`content_blocks.${index}.data.text`]}</p>}
                                            </div>
                                        )}
                                        {block.type === 'image' && (
                                            <div>
                                                <InputLabel forInput={`image_caption_${block.id}`} value="Caption (Optional)" />
                                                <TextInput
                                                    id={`image_caption_${block.id}`}
                                                    value={block.data.caption}
                                                    handleChange={(e) => updateContentBlockData(block.id, 'caption', e.target.value)}
                                                    className="mt-1 block w-full mb-2"
                                                    placeholder="Image caption..."
                                                />
                                                {errors[`content_blocks.${index}.data.caption`] && <p className="text-red-500 text-xs mt-1">{errors[`content_blocks.${index}.data.caption`]}</p>}

                                                <InputLabel forInput={`image_file_${block.id}`} value={block.data.previewUrl && !block.data.file ? "Change Image" : "Image File"} />
                                                {block.data.previewUrl && <img src={block.data.previewUrl} alt="Preview" className="mt-2 mb-2 max-h-40 object-contain rounded-md" />}
                                                <TextInput
                                                    id={`image_file_${block.id}`}
                                                    type="file"
                                                    className="mt-1 block w-full p-2 border"
                                                    handleChange={(e) => handleContentBlockFileChange(block.id, e.target.files[0])}
                                                    accept="image/*"
                                                />
                                                {errors[`content_blocks.${index}.data.file`] && <p className="text-red-500 text-xs mt-1">{errors[`content_blocks.${index}.data.file`]}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="mt-4 space-x-2">
                                    <PrimaryButton type="button" onClick={() => addContentBlock('text')} className="bg-blue-500 hover:bg-blue-600">Add Text Block</PrimaryButton>
                                    <PrimaryButton type="button" onClick={() => addContentBlock('image')} className="bg-green-500 hover:bg-green-600">Add Image Block</PrimaryButton>
                                </div>
                                {errors.content_blocks && typeof errors.content_blocks === 'string' && (
                                    <p className="text-red-500 text-xs mt-2">{errors.content_blocks}</p>
                                )}
                            </div>


                            {/* Submit Button and Progress */}
                            <div className="flex items-center justify-end mt-6">
                                {progress && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-4">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                    </div>
                                )}
                                <Link href={isEditing ? route('news.show', news.slug) : route('news.index')} className="text-sm text-gray-600 hover:text-gray-900 mr-4">
                                    Cancel
                                </Link>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
