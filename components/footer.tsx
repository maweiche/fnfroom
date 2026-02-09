import Link from "next/link";
import { Twitter, Instagram } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-charcoal-black text-warm-cream border-t border-warm-cream/10 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo & Social */}
          <div>
            <div className="mb-4">
              <Logo variant="full" width={240} height={60} href="/" className="brightness-0 invert" />
            </div>
            <p className="text-sm text-white/70 mb-4">
              NC high school sports coverage
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-150"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-150"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <Link href="/about" className="hover:text-white transition-colors duration-150">
                About
              </Link>
              <Link href="/staff" className="hover:text-white transition-colors duration-150">
                Staff
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors duration-150">
                Contact
              </Link>
              <Link href="/rankings" className="hover:text-white transition-colors duration-150">
                Rankings
              </Link>
              <Link href="/recruiting" className="hover:text-white transition-colors duration-150">
                Recruiting
              </Link>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-white/70 mb-4">
              Get NC prep sports news in your inbox
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-dark font-medium rounded hover:opacity-90 transition-opacity duration-150"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/70">
          © 2026 Friday Night Film Room. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
