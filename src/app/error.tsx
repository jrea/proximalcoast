"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
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
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md opacity-70">
        This page hit an unexpected error. Trying again usually fixes it; if
        it keeps happening, head back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-block rounded-md border border-current px-5 py-2.5 font-medium transition-opacity hover:opacity-75"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-block rounded-md px-5 py-2.5 font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
