"use client";

import { useEffect } from "react";

/**
 * Root error boundary -- catches errors from app/layout.tsx itself, which
 * unmounts the whole tree including I18nProvider (Next.js docs: "the root
 * error.js UI is unable to access the root layout"). So unlike every other
 * error.tsx in this app, this one can't use next-intl/ErrorState and needs
 * its own dependency-free fallback.
 */
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
    <html>
      <body>
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-xl font-semibold">Something went wrong.</p>
          <p className="text-sm text-gray-600">Please try reloading the page.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
