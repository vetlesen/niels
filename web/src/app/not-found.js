import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-4 mt-52 min-h-[90svh] flex flex-col max-w-lg">
      <h1 className="mb-4">404 - Page Not Found</h1>
      <p className="mb-6 font-normal">
        The page youre looking for doesnt exist or you dont have permission to
        view it.
      </p>
      <Link href="/" className="font-normal underline">
        Return to Home
      </Link>
    </main>
  );
}
