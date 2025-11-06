import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 py-8 min-h-[90svh] flex flex-col items-center justify-center max-w-xl mx-auto">
      <h1 className="mb-4 text-2xl">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600 font-normal text-center">
        The page you're looking for doesn't exist or you don't have permission
        to view it.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
      >
        Return to Home
      </Link>
    </main>
  );
}
