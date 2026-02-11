"use client";
import { Navigation } from "@/components/navigation";

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

function FAQItem({ question, children }: FAQItemProps) {
  return (
    <div className="faq-item bg-card border border-border rounded-lg p-7 mb-4 relative overflow-hidden animate-slide-up">
      <h3 className="font-sans text-lg font-semibold text-foreground mb-3 leading-snug">
        {question}
      </h3>
      <div className="faq-content text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  icon: string;
  title: string;
  className?: string;
}

function SectionHeader({ icon, title, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-3 mt-10 mb-5 animate-slide-up ${className}`}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 faq-icon">
        {icon}
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <style jsx global>{`
        .faq-page {
          --faq-red: #e63946;
          --faq-gold: #f4a623;
          --faq-ice: #a8dadc;
        }

        .faq-section-general .faq-item::before { background: var(--faq-red); }
        .faq-section-photographer .faq-item::before { background: var(--faq-red); }
        .faq-section-player .faq-item::before { background: var(--faq-gold); }
        .faq-section-coach .faq-item::before { background: var(--faq-ice); }
        .faq-section-fans .faq-item::before { background: #E6BC6A; }

        .faq-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
        }

        .faq-section-general .faq-icon { background: rgba(230, 57, 70, 0.15); color: var(--faq-red); }
        .faq-section-photographer .faq-icon { background: rgba(230, 57, 70, 0.15); color: var(--faq-red); }
        .faq-section-player .faq-icon { background: rgba(244, 166, 35, 0.15); color: var(--faq-gold); }
        .faq-section-coach .faq-icon { background: rgba(168, 218, 220, 0.15); color: var(--faq-ice); }
        .faq-section-fans .faq-icon { background: rgba(230, 188, 106, 0.15); color: #E6BC6A; }

        .faq-content ul li::before {
          content: '→';
          position: absolute;
          left: 0;
          font-weight: 600;
          color: hsl(var(--muted));
        }

        .faq-content ul {
          list-style: none;
          padding: 0;
        }

        .faq-content ul li {
          position: relative;
          padding-left: 1.4rem;
          margin-bottom: 0.5rem;
          font-size: 0.92rem;
          opacity: 0.85;
        }
      `}</style>

      <div className="min-h-screen faq-page">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
          {/* Header */}
          <header className="text-center mb-14 animate-slide-up">
            <div className="inline-block font-display text-xs tracking-[0.25em] uppercase border border-[var(--faq-red)] text-[var(--faq-red)] px-3 py-1 rounded-sm mb-5">
              Frequently Asked Questions
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wide text-foreground mb-3">
              Friday Night Film Room
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto font-sans">
              Everything you need to know about credentialing, coverage, and how we're
              changing the game for NC high school sports.
            </p>
          </header>

          {/* Coaches Section */}
          <div className="faq-section-coach">
            <SectionHeader icon="📋" title="For Coaches" />

            <FAQItem question="How do I submit game scores?">
              <p>
                Snap a photo of your scorebook or stat sheet after the game. Our system automatically
                extracts scores and stats in seconds. Review the data, make any edits, and approve.
                That's it — your game is live on FNFR.
              </p>
            </FAQItem>

            <FAQItem question="What exposure does my team get?">
              <ul>
                <li>Game recaps published on FNFR with team branding</li>
                <li>Team profile page with schedule, roster, and season stats</li>
                <li>Automatic inclusion in state rankings and conference standings</li>
                <li>Media gallery showcasing your team's highlights</li>
              </ul>
            </FAQItem>

            <FAQItem question="Do I get a coach profile?">
              <p>
                Yes — your own profile page showing your program's coverage. Track your team's
                media mentions and game recaps. Showcase season achievements and player development.
              </p>
            </FAQItem>

            <FAQItem question="Can I credential my own photographer?">
              <p>
                Absolutely. If you have a parent, booster, or volunteer who shoots games, we can
                credential them through FNFR for official press access.
              </p>
            </FAQItem>
          </div>

          {/* Players Section */}
          <div className="faq-section-player">
            <SectionHeader icon="🏀" title="For Players & Families" />

            <FAQItem question="What is my player page?">
              <p>
                Your own shareable profile with all your stats, highlights, and game coverage
                in one place. Think of it like social media for your athletic career — easy to
                share with friends, family, and coaches.
              </p>
            </FAQItem>

            <FAQItem question="Will my highlights show up automatically?">
              <p>
                Yes. If there are highlights of you from any FNFR-covered game, they'll appear
                on your player page. You can also submit your own footage for review.
              </p>
            </FAQItem>

            <FAQItem question="How does this help with recruiting?">
              <p>
                When college coaches search your name, your FNFR profile shows up with stats,
                highlights, and game recaps. Your player page stays live throughout your high
                school career and beyond.
              </p>
            </FAQItem>

            <FAQItem question="What if my school doesn't get coverage?">
              <p>
                That's why we exist. FNFR covers games that traditional outlets ignore — smaller
                conferences, rural areas, underserved programs. Request coverage and we'll assign
                a contributor or help you find one.
              </p>
            </FAQItem>
          </div>

          {/* Photographers Section */}
          <div className="faq-section-photographer">
            <SectionHeader icon="🎥" title="For Photographers & Videographers" />

            <FAQItem question="How do I get media credentials?">
              <p>
                Once approved as an FNFR contributor, we issue you a press credential letter
                and digital badge. Present this to schools and athletic directors for sideline
                and press box access.
              </p>
            </FAQItem>

            <FAQItem question="Will my work be credited?">
              <p>
                Always. Every photo and video you publish gets your byline and links back to
                your profile page. Your name appears on all game recaps and media galleries.
              </p>
            </FAQItem>

            <FAQItem question="Do I get a profile page?">
              <p>
                Yes — a dedicated portfolio page showing all your published work. Includes your
                bio, coverage history, and media gallery. Great for building your reputation and
                attracting freelance opportunities.
              </p>
            </FAQItem>

            <FAQItem question="Can I keep shooting for other outlets?">
              <p>
                Absolutely. FNFR credentials don't restrict you from freelancing elsewhere —
                we're here to support your work, not limit it.
              </p>
            </FAQItem>

            <FAQItem question="What equipment do I need?">
              <p>
                Whatever you already have. Smartphone, DSLR, or camcorder — as long as you can
                capture the game, we'll publish it.
              </p>
            </FAQItem>
          </div>

          {/* Fans Section */}
          <div className="faq-section-fans">
            <SectionHeader icon="⭐" title="For Fans" />

            <FAQItem question="Is FNFR free to use?">
              <p>
                Yes. No membership required, no paywalls, no subscriptions. All game scores,
                recaps, rankings, and highlights are free for everyone.
              </p>
            </FAQItem>

            <FAQItem question="Do you have ads or tracking?">
              <p>
                No intrusive ads. No user tracking. We don't sell your data. We're funded by
                community support, not by advertising.
              </p>
            </FAQItem>

            <FAQItem question="How do I stay updated?">
              <p>
                Easy — just visit FNFR to see the latest scores, rankings, and recaps. Follow
                your favorite teams and players to get updates on their games.
              </p>
            </FAQItem>

            <FAQItem question="What makes FNFR different?">
              <ul>
                <li>We cover NC high school sports that traditional media ignores</li>
                <li>Privacy-first approach with no data selling or invasive tracking</li>
                <li>Built by people who care about high school sports, not venture capital</li>
              </ul>
            </FAQItem>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-[rgba(230,57,70,0.08)] to-[rgba(244,166,35,0.06)] border border-[rgba(230,57,70,0.2)] rounded-lg p-8 mt-12 text-center animate-slide-up">
            <h3 className="font-display text-xl tracking-wide text-[var(--faq-red)] mb-3">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              We're here to help. Reach out and we'll walk you through how FNFR works for
              your situation.
            </p>
            <a
              href="mailto:contact@fnfroom.com"
              className="inline-block font-display text-sm tracking-[0.12em] text-white bg-[var(--faq-red)] px-8 py-3 rounded hover:bg-[#d32f3d] transition-all hover:-translate-y-0.5"
            >
              Get In Touch
            </a>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-6 border-t border-border animate-slide-up">
            <p className="text-muted-foreground text-xs tracking-wide">
              Friday Night Film Room — covering the games that matter most.
            </p>
            <div className="font-display text-xs tracking-[0.12em] text-muted opacity-50 mt-2">
              Owned & operated by HRD Studio
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
