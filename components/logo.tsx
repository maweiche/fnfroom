import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "header" | "full";
  className?: string;
  width?: number;
  height?: number;
  href?: string;
}

/**
 * Logo component for Friday Night Film Room
 * - header variant: Optimized for navigation header (fnfr-logo-header.png)
 * - full variant: Full logo for footer, hero sections, etc. (fnfr-logo.png)
 */
export function Logo({
  variant = "header",
  className = "",
  width,
  height,
  href = "/",
}: LogoProps) {
  const src = variant === "header" ? "/fnfr-logo-header.png" : "/fnfr-logo.png";

  // Default dimensions based on variant
  const defaultWidth = variant === "header" ? 240 : 320;
  const defaultHeight = variant === "header" ? 60 : 80;

  const imgWidth = width ?? defaultWidth;
  const imgHeight = height ?? defaultHeight;

  const logoImage = (
    <Image
      src={src}
      alt="Friday Night Film Room"
      width={imgWidth}
      height={imgHeight}
      className={className}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-block hover:opacity-90 transition-opacity duration-150">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}
