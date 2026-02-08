"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoonIcon } from "./moon-icon";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const navLinks = [
    { href: "/basketball", label: "Basketball" },
    { href: "/football", label: "Football" },
    { href: "/lacrosse", label: "Lacrosse" },
    { href: "/video", label: "Video" },
    { href: "/rankings", label: "Rankings" },
    { href: "/recruiting", label: "Recruiting" },
  ];

  return (
    <>
      {/* Header Section - Massive Title with Hamburger on Right (House of Heat style) */}
      <header className="relative pt-6 pb-4 md:pt-8 md:pb-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative">
            {/* Massive Site Title - Full Width with Theme Toggle as Second O */}
            <Link href="/" className="block">
              <h1 className="font-display font-black text-6xl md:text-8xl lg:text-[7.5rem] leading-none tracking-tighter text-foreground hover:text-primary transition-colors duration-150 pr-16 md:pr-20 uppercase">
                FRIDAY NIGHT FILM RO

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleTheme();
                  }}
                  className="top-[0.05em] hover:bg-transparent inline-flex items-center justify-center w-[0.9em] h-[0.9em] rounded-full transition-all duration-200 hover:scale-105 relative cursor-pointer"
                  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                  <motion.div
                    key={theme}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {theme === "light" ? (
                      <Sun className="w-[0.8em] h-[0.8em] text-foreground" strokeWidth={1} />
                    ) : (
                      <MoonIcon className="w-[0.8em] h-[0.8em] text-foreground" />
                    )}
                  </motion.div>
                </button>
                M
              </h1>
            </Link>

            {/* Hamburger Menu Button - Absolute Positioned on Right */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute top-6 right-0 w-12 h-12 md:w-16 md:h-16 bg-foreground rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-dark transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6 md:w-8 md:h-8 text-background" />
              ) : (
                <Menu className="w-6 h-6 md:w-8 md:h-8 text-background" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="container mx-auto px-4 md:px-6 h-full flex flex-col justify-center">
              {/* Close Button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-12 right-4 md:right-6 w-12 h-12 md:w-16 md:h-16 bg-foreground rounded-full flex items-center justify-center hover:bg-foreground/90 transition-colors duration-150"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 md:w-8 md:h-8 text-background" />
              </button>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-6 md:gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-display font-bold text-4xl md:text-6xl lg:text-7xl hover:text-primary transition-colors duration-150 block"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
