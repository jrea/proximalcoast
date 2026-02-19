import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Backlinks - AI Directory Submission Agent",
  description: "Automated SaaS directory submission tool. The 'Magic' agent that fills forms for you. Currently in Beta.",
  openGraph: {
    title: "Backlinks - AI Directory Submission Agent",
    description: "Launch your SaaS in minutes, not days. The AI agent that handles directory submissions for you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backlinks - AI Directory Submission Agent",
    description: "Launch your SaaS in minutes. Automated directory submissions.",
  }
};

export default function BacklinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900`}>
      {children}
    </div>
  );
}
