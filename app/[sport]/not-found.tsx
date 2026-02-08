import Link from "next/link";

export default function SportNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Sport Not Found</h1>
        <p className="text-lg text-secondary mb-8">
          We only cover Basketball, Football, and Lacrosse at this time.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/basketball"
            className="px-6 py-3 bg-basketball text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Basketball
          </Link>
          <Link
            href="/football"
            className="px-6 py-3 bg-football text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Football
          </Link>
          <Link
            href="/lacrosse"
            className="px-6 py-3 bg-lacrosse text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Lacrosse
          </Link>
        </div>
      </div>
    </div>
  );
}
