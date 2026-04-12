import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

export default function HeaderGuest() {
    return (
        <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            {/* Outer full width */}
            <div className="w-full px-6">
                {/* Inner container (biar rapi & center) */}
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="relative">
                            {/* Glow */}
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>

                            <Image
                                src="/logoNexaTech.png"
                                alt="NexaTech Logo"
                                width={100}
                                height={100}
                                className="relative h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Search Desktop */}
                    <div className="hidden flex-1 px-6 md:block">
                        <div className="relative max-w-md mx-auto">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full rounded-full border bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="customer/login"
                            className="rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                            Login
                        </Link>

                        <Link
                            href="customer/register"
                            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="border-t px-4 py-3 md:hidden">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full rounded-full border bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </header>
    );
}
