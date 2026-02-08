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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');

        .faq-page {
          --faq-red: #e63946;
          --faq-gold: #f4a623;
          --faq-ice: #a8dadc;
        }

        .faq-section-general .faq-item::before { background: var(--faq-red); }
        .faq-section-photographer .faq-item::before { background: var(--faq-red); }
        .faq-section-player .faq-item::before { background: var(--faq-gold); }
        .faq-section-coach .faq-item::before { background: var(--faq-ice); }
        .faq-section-ai .faq-item::before {
          background: linear-gradient(180deg, var(--faq-red), var(--faq-gold));
        }

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
        .faq-section-ai .faq-icon { background: rgba(168, 218, 220, 0.15); color: var(--faq-ice); }

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
            <div className="inline-block font-['Bebas_Neue'] text-xs tracking-[0.25em] uppercase border border-[var(--faq-red)] text-[var(--faq-red)] px-3 py-1 rounded-sm mb-5">
              Frequently Asked Questions
            </div>
            <h1 className="font-['Bebas_Neue'] text-5xl md:text-6xl font-normal tracking-wide text-foreground mb-3">
              Friday Night Film Room
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto italic font-['Source_Serif_4']">
              Everything you need to know about credentialing, coverage, and how we're
              changing the game for NC high school sports.
            </p>
          </header>

          {/* General Section */}
          <div className="faq-section-general">
            <SectionHeader icon="💡" title="General" />

            <FAQItem question="What is Friday Night Film Room?">
              <p>
                FNFR is a sports media outlet and credentialing platform covering North
                Carolina high school athletics. We provide press credentials, publish game
                coverage, and build recruiting profiles for players — filling the gap left
                by shrinking local newspapers.
              </p>
            </FAQItem>

            <FAQItem question="Who can join FNFR?">
              <p>We work with three main groups:</p>
              <ul>
                <li>
                  <strong>Photographers & videographers</strong> who want press credentials
                  and a platform to publish their work
                </li>
                <li>
                  <strong>Players & families</strong> who need recruiting exposure and
                  documented game coverage
                </li>
                <li>
                  <strong>Coaches</strong> who want consistent media coverage for their
                  programs
                </li>
              </ul>
            </FAQItem>

            <FAQItem question="What sports do you cover?">
              <p>
                We cover all major NC high school sports with a focus on basketball,
                football, soccer, and volleyball. If there's demand for a sport in your
                area, we'll cover it.
              </p>
            </FAQItem>

            <FAQItem question="How much does it cost?">
              <p>
                FNFR is free for contributors (photographers/videographers) and readers. For
                players and coaches looking for premium features like enhanced recruiting
                profiles or priority coverage, we offer optional paid tiers.
              </p>
            </FAQItem>
          </div>

          {/* Photographers Section */}
          <div className="faq-section-photographer">
            <SectionHeader icon="🎥" title="For Photographers & Videographers" />

            <FAQItem question="How do I get media credentials?">
              <p>
                Once you're approved as an FNFR contributor, we issue you a press credential
                letter and digital badge. You present this to schools and athletic directors
                to gain sideline and press box access.
              </p>
            </FAQItem>

            <FAQItem question="Do I need to write articles?">
              <p>
                No. You can use our Press Box AI tool to dictate a game recap by voice — the
                AI writes the article for you. Or you can just submit photos/video and we'll
                handle the editorial side.
              </p>
            </FAQItem>

            <FAQItem question="What equipment do I need?">
              <p>
                Whatever you already have. A smartphone, DSLR, or camcorder works. As long as
                you can capture the game, we'll publish it.
              </p>
            </FAQItem>

            <FAQItem question="Can I keep shooting for other outlets?">
              <p>
                Yes. FNFR credentials don't restrict you from freelancing elsewhere. We're
                here to support your work, not limit it.
              </p>
            </FAQItem>

            <FAQItem question="Do I get paid?">
              <p>
                Currently, FNFR is a volunteer contributor model. We're working toward paid
                assignments as we grow. For now, you get credentials, a platform, and
                portfolio exposure.
              </p>
            </FAQItem>
          </div>

          {/* Players Section */}
          <div className="faq-section-player">
            <SectionHeader icon="🏀" title="For Players & Families" />

            <FAQItem question="How does FNFR help with recruiting?">
              <p>
                We publish game recaps with your stats, embed your highlight reels, and
                create a dedicated player profile page. When college coaches search your
                name, FNFR content shows up — even if the local paper never covered your
                game.
              </p>
            </FAQItem>

            <FAQItem question="What if my school doesn't get media coverage?">
              <p>
                That's exactly why we exist. FNFR covers games that traditional outlets
                ignore. If you're playing in a smaller conference or rural area, we'll be
                there — or find a local contributor who will.
              </p>
            </FAQItem>

            <FAQItem question="Can I submit my own highlights?">
              <p>
                Yes. Players, parents, and coaches can submit game footage and highlights for
                review. If it's quality content, we'll feature it.
              </p>
            </FAQItem>

            <FAQItem question="How do I get a player profile?">
              <p>
                Player profiles are created automatically when you're featured in game
                coverage. You can also request a profile by contacting us directly.
              </p>
            </FAQItem>
          </div>

          {/* Coaches Section */}
          <div className="faq-section-coach">
            <SectionHeader icon="📋" title="For Coaches" />

            <FAQItem question="How do I get my team covered?">
              <p>
                Reach out to us with your schedule. We'll assign a contributor to cover key
                games, or you can work with us to find a local photographer/videographer to
                credential.
              </p>
            </FAQItem>

            <FAQItem question="Can I credential my own team photographer?">
              <p>
                Yes. If you have a parent, booster, or volunteer who shoots games, we can
                credential them through FNFR so they get official press access.
              </p>
            </FAQItem>

            <FAQItem question="What kind of coverage do you provide?">
              <p>
                Game recaps, player spotlights, season previews, tournament coverage, stat
                tracking, and highlight reels. We also publish team rankings and conference
                standings.
              </p>
            </FAQItem>

            <FAQItem question="Can I submit stats and rosters?">
              <p>
                Absolutely. The more info you give us, the better the coverage. Send us
                rosters, stats, and any storylines you want highlighted.
              </p>
            </FAQItem>
          </div>

          {/* Press Box AI Section */}
          <div className="faq-section-ai">
            <SectionHeader icon="🤖" title="Press Box AI" />

            <FAQItem question="What is Press Box AI?">
              <p>
                It's our voice-first article writing tool. You talk through the game like
                you're explaining it to a friend — who scored, what happened, key moments —
                and the AI generates a polished article in minutes.
              </p>
            </FAQItem>

            <FAQItem question="Do I need to be a writer to use it?">
              <p>
                No. If you can talk about what you saw, the AI does the rest. It writes in
                your voice, structures the story, and publishes it under your name.
              </p>
            </FAQItem>

            <FAQItem question="Is the AI-generated content obvious?">
              <p>
                No. The output reads like a human-written recap — because it's based on your
                actual observations and voice. It's a tool for speed, not a replacement for
                judgment.
              </p>
            </FAQItem>

            <FAQItem question="Can I edit the article after it's generated?">
              <p>
                Yes. You review and edit before publishing. The AI gives you a draft — you
                make the final call.
              </p>
            </FAQItem>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-[rgba(230,57,70,0.08)] to-[rgba(244,166,35,0.06)] border border-[rgba(230,57,70,0.2)] rounded-lg p-8 mt-12 text-center animate-slide-up">
            <h3 className="font-['Bebas_Neue'] text-xl tracking-wide text-[var(--faq-red)] mb-3">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              We're here to help. Reach out and we'll walk you through how FNFR works for
              your situation.
            </p>
            <a
              href="mailto:contact@fnfroom.com"
              className="inline-block font-['Bebas_Neue'] text-sm tracking-[0.12em] text-white bg-[var(--faq-red)] px-8 py-3 rounded hover:bg-[#d32f3d] transition-all hover:-translate-y-0.5"
            >
              Get In Touch
            </a>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 pt-6 border-t border-border animate-slide-up">
            <p className="text-muted-foreground text-xs tracking-wide">
              Friday Night Film Room — covering the games that matter most.
            </p>
            <div className="font-['Bebas_Neue'] text-xs tracking-[0.12em] text-muted opacity-50 mt-2">
              Owned & operated by HRD Studio
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
