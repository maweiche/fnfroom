"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full text-left group py-2"
      >
        <h2 className="text-xl md:text-2xl font-display font-bold">
          {title}
        </h2>
        {badge !== undefined && badge !== null && (
          <span className="px-2 py-0.5 bg-card border border-border rounded text-xs font-mono tabular-nums text-muted">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted ml-auto transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}
