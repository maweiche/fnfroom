import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-lg text-secondary mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-dark font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/basketball"
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted/10 transition-colors"
          >
            Browse Basketball
          </Link>
        </div>
      </div>
    </div>
  );
}
