"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { MoonIcon } from "./moon-icon";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();

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

  const mainLinks = [
    { href: "/basketball", label: "Basketball" },
    { href: "/football", label: "Football" },
    { href: "/lacrosse", label: "Lacrosse" },
    { href: "/video", label: "Video" },
    { href: "/rankings", label: "Rankings" },
    { href: "/recruiting", label: "Recruiting" },
  ];

  const utilityLinks = [
    { href: "/staff", label: "Staff" },
    { href: "/faq", label: "FAQ" },
    { href: "/scoresnap", label: "ScoreSnap" },
    { href: "/pressbox", label: "Press Box AI" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Header Section - Massive Title with Hamburger on Right */}
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
                      <Sun className="w-[0.8em] h-[0.8em] text-foreground hover:text-primary " strokeWidth={1} />
                    ) : (
                      <MoonIcon className="w-[0.8em] h-[0.8em] text-foreground hover:text-primary " />
                    )}
                  </motion.div>
                </button>
                M
              </h1>
            </Link>

            {/* Hamburger Menu Button - Absolute Positioned on Right */}
            <button
              onClick={() => setMenuOpen(true)}
              className="absolute top-6 right-0 w-12 h-12 md:w-16 md:h-16 bg-foreground rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-dark transition-colors duration-150"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 md:w-8 md:h-8 text-background" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Sheet Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left font-display text-2xl">
              Navigation
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 flex flex-col gap-8">
            {/* Main Navigation */}
            <nav className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Sections
              </div>
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-150 ${
                    isActive(link.href)
                      ? "bg-primary text-primary-dark"
                      : "hover:bg-muted/10 text-foreground"
                  }`}
                >
                  <span className="text-base">{link.label}</span>
                  {isActive(link.href) && (
                    <span className="w-2 h-2 rounded-full bg-primary-dark" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Utility Links */}
            <nav className="flex flex-col gap-2 pt-6 border-t border-border">
              <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                More
              </div>
              {utilityLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-150 ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/10 text-foreground"
                  }`}
                >
                  <span className="text-sm">{link.label}</span>
                  {isActive(link.href) && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
