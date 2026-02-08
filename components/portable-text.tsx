import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { Image as SanityImage } from "sanity";

const components: PortableTextComponents = {
  types: {
    image: ({
      value,
    }: {
      value: SanityImage & { alt?: string; caption?: string; photographer?: string };
    }) => {
      const imageUrl = urlFor(value).width(1200).height(675).url();

      return (
        <figure className="my-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt || ""}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
          {(value.caption || value.photographer) && (
            <figcaption className="mt-2 text-sm text-secondary text-center">
              {value.caption}
              {value.photographer && (
                <span className="block text-xs text-muted mt-1">
                  Photo: {value.photographer}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 py-2 my-6 italic text-lg text-secondary">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = value.href?.startsWith("/")
        ? undefined
        : "noopener noreferrer";
      const target = value.href?.startsWith("/") ? undefined : "_blank";

      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-primary hover:underline font-medium"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

interface PortableTextRendererProps {
  content: any[];
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg">
      <PortableText value={content} components={components} />
    </div>
  );
}
