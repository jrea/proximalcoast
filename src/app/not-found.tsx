import type { Metadata } from "next";

import { NotFoundPage } from "./_components/not-found-page";

export const metadata: Metadata = {
  title: "Page Not Found | Proximal Coast",
  description: "The page you are looking for does not exist on Proximal Coast.",
};

export default function NotFound() {
  return <NotFoundPage siteName="Proximal Coast" homeHref="/" />;
}
