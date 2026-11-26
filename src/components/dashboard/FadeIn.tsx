"use client";

import { motion } from "framer-motion";

/** Entry animation used on every dashboard card (old pages used framer-motion inline). */
export function FadeIn({ children, delay = 0, y = 16, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }} className={className}>
      {children}
    </motion.div>
  );
}
