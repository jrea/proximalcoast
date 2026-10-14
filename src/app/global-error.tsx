"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Last-resort error shell. Rendered when the root layout itself fails, so
 * it must define its own <html>/<body> and cannot rely on the layout's
 * providers or fonts. Kept intentionally minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 max-w-md opacity-70">
            Proximal Coast hit an unexpected error. Trying again usually
            fixes it.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 inline-block rounded-md border border-current px-5 py-2.5 font-medium transition-opacity hover:opacity-75"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
