"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTAMarquee() {
  const message = "Want us at your game? Need to upload stats? Send us a message.";

  // Repeat the message to create seamless scroll
  const repeatedMessage = Array(20).fill(message).join(" • ");

  return (
    <div className="bg-primary text-primary-dark overflow-hidden border-b border-primary-dark/10">
      <Link
        href="/contact"
        className="block hover:bg-primary/90 transition-colors duration-150"
      >
        <motion.div
          className="flex whitespace-nowrap py-3"
          animate={{
            x: [0, -1920], // Scroll distance
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span className="font-display font-semibold text-sm tracking-wide">
            {repeatedMessage}
          </span>
        </motion.div>
      </Link>
    </div>
  );
}
