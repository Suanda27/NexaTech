"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
    const { t } = useLanguage();

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
            <motion.div
                animate={{
                    x: [0, 20, -12, 0],
                    y: [0, -18, 12, 0],
                }}
                transition={{
                    duration: 16,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="pointer-events-none absolute right-[-7rem] top-12 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl"
            />
            <motion.div
                animate={{
                    x: [0, -16, 8, 0],
                    y: [0, 20, -10, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="pointer-events-none absolute bottom-10 left-[-5rem] h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* LEFT CONTENT */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.12,
                                    delayChildren: 0.08,
                                },
                            },
                        }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60"
                            >
                                {t("Premium Tech Collection")}
                            </motion.div>

                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, y: 28 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                                className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl xl:text-7xl"
                            >
                                {t("Upgrade Your Tech")}{" "}
                                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                    {t("Experience")}
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, y: 24 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                                className="max-w-xl text-lg text-gray-600 sm:text-xl"
                            >
                                {t(
                                    "Discover premium technology products designed to enhance your digital lifestyle. Quality, performance, and innovation in every device.",
                                )}
                            </motion.p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 24 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col gap-4 sm:flex-row"
                        >
                            <Link
                                href="/product"
                                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
                            >
                                {t("Shop Now")}
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/product"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-4 font-bold text-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                {t("Explore Products")}
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: 42, y: 18 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <motion.div
                            animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.8, 0.55] }}
                            transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 to-blue-400/20 blur-3xl"
                        />

                        <motion.div
                            whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="relative overflow-hidden rounded-lg border border-blue-100 bg-white p-3 shadow-2xl shadow-blue-100"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1641430034785-47f6f91ab6cf"
                                alt={t("Modern tech workspace")}
                                width={1080}
                                height={720}
                                priority
                                className="h-auto w-full rounded-lg object-cover"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(59,130,246,0.12)_100%)]" />
                        </motion.div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {["Fast Delivery", "Secure Pay", "Top Rated"].map(
                                (item, index) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.55,
                                            delay: 0.34 + index * 0.08,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="rounded-lg border border-blue-100 bg-white px-3 py-3 text-center text-xs font-bold text-blue-700 shadow-sm"
                                    >
                                        {t(item)}
                                    </motion.div>
                                ),
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
