"use client";

export default function Footer() {
    return (
        <footer className="w-full border-t border-gray-200 bg-white">
            {/* Container */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-[70px] py-4 md:py-0 gap-3 md:gap-0">
                    {/* Left (spacer for balance) */}
                    <div className="hidden md:block" />

                    {/* Center Text */}
                    <p className="text-sm text-gray-800 font-medium tracking-wide text-center">
                        © {new Date().getFullYear()} All rights reserved.
                    </p>

                    {/* Right Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
                        <a
                            href="#"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Privacy
                        </a>
                        <a
                            href="#"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Terms
                        </a>
                        <a
                            href="#"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>

                {/* Mobile Links */}
                <div className="flex md:hidden justify-center gap-6 pb-4 text-xs text-gray-500">
                    <a
                        href="#"
                        className="hover:text-blue-600 transition-colors"
                    >
                        Privacy
                    </a>
                    <a
                        href="#"
                        className="hover:text-blue-600 transition-colors"
                    >
                        Terms
                    </a>
                    <a
                        href="#"
                        className="hover:text-blue-600 transition-colors"
                    >
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}
