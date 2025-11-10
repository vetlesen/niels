"use client";
import { useState, use } from "react";
import { getWorkBySlug } from "../../../../queries/getWorkBySlug";
import Link from "next/link";

// Revalidate this page every 60 seconds
export const revalidate = 60;

export default function WorkPasswordPage({ params }) {
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Unwrap params
  const resolvedParams = use(params);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const work = await getWorkBySlug(resolvedParams.slug);

      if (!work) {
        setError("Work not found");
        setLoading(false);
        return;
      }

      if (passwordInput === work.password) {
        // Save password to localStorage
        localStorage.setItem(
          `work_${resolvedParams.slug}_password`,
          passwordInput
        );
        // Redirect to the work page
        window.location.href = `/work/${resolvedParams.slug}`;
      } else {
        setError("Incorrect password");
        setPasswordInput("");
      }
    } catch (err) {
      setError("Failed to verify password");
    }

    setLoading(false);
  };

  return (
    <main className="px-4 min-h-[90svh] max-w-xl">
      <h1 className="mb-4 mt-52 uppercase">Password Protected</h1>
      <p className="mb-6 text-gray-600 font-normal">
        This work is password protected. Please enter the password to continue.
      </p>
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Enter password"
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
          autoFocus
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Unlock"}
        </button>
      </form>
      <Link href="/" className="underline text-sm mt-4 block">
        Back to home
      </Link>
    </main>
  );
}
