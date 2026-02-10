"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoonIcon } from "./moon-icon";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Initialize theme from localStorage or default to dark (cinematic primary experience)
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Track scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Sport links (always visible on desktop)
  const sportLinks = [
    { href: "/basketball", label: "Basketball", color: "basketball" },
    { href: "/football", label: "Football", color: "football" },
    { href: "/lacrosse", label: "Lacrosse", color: "lacrosse" },
  ];

  // Content dropdown links
  const contentLinks = [
    { href: "/video", label: "Video" },
    { href: "/rankings", label: "Rankings" },
    { href: "/recruiting", label: "Recruiting" },
    { href: "/college", label: "College Corner" },
    { href: "/beer-cooler", label: "Beer Cooler" },
  ];

  // About dropdown links
  const aboutLinks = [
    { href: "/staff", label: "Staff" },
    { href: "/faq", label: "FAQ" },
    { href: "/scoresnap", label: "ScoreSnap" },
    { href: "/pressbox", label: "Press Box AI" },
  ];

  // For mobile menu - combine all links with grouping
  const mobileMainLinks = [
    ...sportLinks,
    { href: "/video", label: "Video", color: "primary" },
    { href: "/rankings", label: "Rankings", color: "primary" },
    { href: "/recruiting", label: "Recruiting", color: "primary" },
    { href: "/college", label: "College Corner", color: "primary" },
    { href: "/beer-cooler", label: "Beer Cooler", color: "primary" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getSportAccentClass = (color: string, isActive: boolean) => {
    if (!isActive) return "";
    switch (color) {
      case "basketball":
        return "text-[#D97B34] dark:text-[#D97B34]";
      case "football":
        return "text-[#2d5a3d] dark:text-[#4c8a5f]";
      case "lacrosse":
        return "text-[#1e3a5f] dark:text-[#4a6b9e]";
      default:
        return "text-primary";
    }
  };

  return (
    <>
      {/* Sticky Navigation Header */}
      <motion.header
        initial={{ y: 0 }}
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo
                variant="header"
                width={160}
                height={40}
                className="h-8 md:h-10 w-auto"
                href=""
              />
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Sport Links - Always Visible */}
              {sportLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 group ${
                      active
                        ? getSportAccentClass(link.color, true) + " font-semibold"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          link.color === "basketball"
                            ? "bg-[#D97B34]"
                            : link.color === "football"
                              ? "bg-[#2d5a3d] dark:bg-[#4c8a5f]"
                              : link.color === "lacrosse"
                                ? "bg-[#1e3a5f] dark:bg-[#4a6b9e]"
                                : "bg-primary"
                        }`}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Content Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors duration-150 outline-none">
                  Content
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48 bg-card border-border"
                >
                  {contentLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={`w-full cursor-pointer ${
                          isActive(link.href)
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* About Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors duration-150 outline-none">
                  More
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48 bg-card border-border"
                >
                  {aboutLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={`w-full cursor-pointer ${
                          isActive(link.href)
                            ? "text-primary font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/20 transition-colors duration-150"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <motion.div
                  key={theme}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "light" ? (
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to top, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                      }}
                    />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-foreground" />
                  )}
                </motion.div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded hover:bg-muted/20 transition-colors duration-150"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-16 md:top-20 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Main Navigation */}
                <nav className="space-y-1">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Coverage
                  </div>
                  {mobileMainLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-150 ${
                          active
                            ? "bg-primary/10 " + getSportAccentClass(link.color, true)
                            : "hover:bg-muted/10 text-foreground"
                        }`}
                      >
                        <span className="text-base">{link.label}</span>
                        {active && (
                          <motion.span
                            layoutId="activeDot"
                            className={`w-2 h-2 rounded-full ${
                              link.color === "basketball"
                                ? "bg-[#D97B34]"
                                : link.color === "football"
                                  ? "bg-[#2d5a3d] dark:bg-[#4c8a5f]"
                                  : link.color === "lacrosse"
                                    ? "bg-[#1e3a5f] dark:bg-[#4a6b9e]"
                                    : "bg-primary"
                            }`}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Utility Links */}
                <nav className="mt-8 space-y-1 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    More
                  </div>
                  {aboutLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-150 ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/10 text-secondary"
                        }`}
                      >
                        <span className="text-sm">{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
