import Link from "next/link";

interface NotFoundPageProps {
  /** Display name of the site the visitor is on. */
  siteName?: string;
  /** Where the "back home" link points. Defaults to the site's root. */
  homeHref?: string;
}

/**
 * Shared 404 body for every site. Deliberately neutral styling (inherits
 * the surrounding site layout's colors/fonts) so the same component reads
 * as native under the root site and each subdomain's chrome.
 */
export function NotFoundPage({ siteName = "Proximal Coast", homeHref = "/" }: NotFoundPageProps) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-black tracking-tight" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md opacity-70">
        The page you are looking for does not exist on {siteName}. It may have
        moved, or the link may be wrong.
      </p>
      <Link
        href={homeHref}
        className="mt-8 inline-block rounded-md border border-current px-5 py-2.5 font-medium transition-opacity hover:opacity-75"
      >
        Back to the {siteName} home page
      </Link>
    </main>
  );
}
