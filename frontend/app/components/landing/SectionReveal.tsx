"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function SectionReveal({
    children,
    delay = 0,
    y = 36,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
