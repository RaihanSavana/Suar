import { Link, usePage } from "@inertiajs/react";

export default function PublicLayout({ children }) {
    const { auth, categories, currentCategory } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-300 shadow-sm">
                {/* This div now just adds horizontal padding, not a max-width */}
                <div className="px-4 sm:px-6 lg:px-8">
                    {/* Top part: Title and Auth links */}
                    <div className="py-4 flex justify-between items-center">
                        <div className="w-24" /> {/* Spacer */}
                        <div className="text-center">
                            <Link href="/" className="text-3xl md:text-4xl font-serif text-gray-800 hover:text-gray-600 transition">
                                Suar
                            </Link>
                        </div>
                        <div className="w-24 flex justify-end space-x-4 text-sm whitespace-nowrap font-serif text-gray-600">
                            {auth.user ? (
                                <Link href={route("dashboard")} className="hover:underline">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route("login")} className="hover:underline">
                                    Sign in
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Bottom part: Dynamic Category Navigation */}
                    <div className="border-t border-gray-200">
                        {/* This nav also just has horizontal padding */}
                        <nav className="px-4 py-2 flex space-x-6 justify-center text-sm font-serif overflow-x-auto">
                            <Link href={route('home')} className={`hover:underline ${!currentCategory ? 'font-bold text-black' : 'text-gray-700'}`}>
                                Home
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={route('categories.show', category.slug)}
                                    className={`hover:underline whitespace-nowrap ${currentCategory && currentCategory.id === category.id ? 'font-bold text-black' : 'text-gray-700'}`}
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Page Content */}
            <main className="py-8">
                {children}
            </main>

            {/* Optional Footer */}
            <footer className="bg-white border-t mt-12 py-6">
                <div className="px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Suar. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
