import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/utils";

interface SportTagProps {
  sport: Sport;
  className?: string;
}

export function SportTag({ sport, className }: SportTagProps) {
  const sportConfig = {
    basketball: {
      label: "Basketball",
      className: "bg-basketball",
    },
    football: {
      label: "Football",
      className: "bg-football",
    },
    lacrosse: {
      label: "Lacrosse",
      className: "bg-lacrosse",
    },
  };

  const config = sportConfig[sport];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded text-white text-xs font-medium uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
