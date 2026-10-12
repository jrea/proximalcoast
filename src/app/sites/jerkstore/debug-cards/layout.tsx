import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Card preview | Jerkstore",
  robots: { index: false, follow: false },
};

export default function DebugCardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
