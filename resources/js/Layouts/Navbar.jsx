import { Link, usePage } from "@inertiajs/react";

export default function Navbar({  }) {
    const { auth } = usePage().props;
    return (
        <div className="min-h-screen">
            <header className="border-b border-black">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="w-24" />
                    <h1 className="text-3xl font-serif text-center">Suar</h1>
                    <div className="flex space-x-4 text-sm whitespace-nowrap font-serif">
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="hover:underline"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="hover:underline"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="hover:underline"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="border-t border-black">
                    <nav className="max-w-6xl mx-auto px-4 py-2 flex space-x-6 justify-center text-sm font-serif">
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                        <Link href="/news" className="hover:underline">
                            News
                        </Link>
                        <Link href="/politic" className="hover:underline">
                            Politic
                        </Link>
                        <Link href="/sport" className="hover:underline">
                            Sport
                        </Link>
                        <Link href="/health" className="hover:underline">
                            Health
                        </Link>
                    </nav>
                </div>
            </header>
        </div>
    );
}
