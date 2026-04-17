import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, ChevronDown } from "lucide-react";

export default function HeaderUser() {
    return (
        <header className="w-full border-b bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logoNexaTech.png"
                        alt="NexaTech Logo"
                        width={120}
                        height={48}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Search */}
                <div className="hidden flex-1 px-6 md:block">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />

                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Right Menu */}
                <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                    {/* Products */}
                    <Link
                        href="/product"
                        className="hidden text-gray-700 font-medium hover:text-black md:block"
                    >
                        Products
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className="relative">
                        <ShoppingCart className="text-gray-700" size={22} />

                        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            3
                        </span>
                    </Link>

                    {/* Profile */}
                    <button className="flex items-center gap-2 text-gray-700">
                        <User size={22} />
                        <ChevronDown size={16} />
                    </button>
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
                        className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </header>
    );
}
