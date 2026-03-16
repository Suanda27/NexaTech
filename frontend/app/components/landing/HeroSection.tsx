import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* LEFT CONTENT */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                                Upgrade Your Tech
                                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                    Experience
                                </span>
                            </h1>

                            <p className="max-w-xl text-lg text-gray-600 sm:text-xl">
                                Discover premium technology products designed to
                                enhance your digital lifestyle. Quality,
                                performance, and innovation in every device.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Link
                                href="/products"
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40"
                            >
                                Shop Now
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-gray-900 transition-all duration-300 hover:border-blue-200 hover:bg-gray-50 hover:shadow-lg"
                            >
                                Explore Products
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 to-blue-400/20 blur-3xl"></div>

                        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1641430034785-47f6f91ab6cf"
                                alt="Modern tech workspace"
                                width={1080}
                                height={720}
                                priority
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
