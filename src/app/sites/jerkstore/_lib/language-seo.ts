import type { Metadata } from "next";
import { CREDIT_PACKAGES, FREE_ROAST_LIMIT, STANDARD_LANGUAGES } from "../constants";
import type { LanguagePage } from "./language-pages";

export const JERKSTORE_URL = "https://jerkstore.proximalcoast.com";

export function languagePath(page: Pick<LanguagePage, "slug">) {
  return `/ai-insults/${page.slug}`;
}

export function languageMetadata(page: LanguagePage): Metadata {
  const title = `AI Insults in ${page.name} | Jerkstore`;
  const url = `${JERKSTORE_URL}${languagePath(page)}`;
  const image = `${url}/opengraph-image`;

  return {
    metadataBase: new URL(JERKSTORE_URL),
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: page.description,
      url,
      siteName: "Jerkstore",
      type: "website",
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: `AI insults in ${page.name} — Jerkstore` }],
    },
    twitter: { card: "summary_large_image", title, description: page.description, images: [image] },
  };
}

export function languageFaq(page: LanguagePage) {
  const isStandard = STANDARD_LANGUAGES.some(language => language.value === page.value);
  const starter = CREDIT_PACKAGES[0];

  return [
    ...page.faq,
    {
      question: `How do I generate AI insults in ${page.name}?`,
      answer: `Use the generator on this page with ${page.name} already selected. Enter a topic with a specific habit or situation, choose the available heat level, and generate up to five roasts. You can change the language in the selector at any time.`,
    },
    {
      question: `Can I try the ${page.name} roast generator for free?`,
      answer: `${isStandard ? `${page.name} is one of the languages available to guests.` : `${page.name} is in the expanded language selector; sign in to use it.`} Jerkstore includes ${FREE_ROAST_LIMIT} free roast results per 24-hour window, subject to usage limits. Standard requests return up to five roasts, using your remaining free results and then credits when available. Prepaid credit packs start at $${(starter.amount / 100).toFixed(0)} for ${starter.credits} credits.`,
    },
    {
      question: "Can I write the topic in English?",
      answer: `Yes. The topic and the output language are separate settings. You can describe the situation in English and keep ${page.name} selected for the result. AI wording can be uneven; read the roast before sharing it.`,
    },
  ];
}

export function languageStructuredData(page: LanguagePage) {
  const url = `${JERKSTORE_URL}${languagePath(page)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `AI insults in ${page.name}`,
        description: page.description,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: "Jerkstore", url: JERKSTORE_URL },
        breadcrumb: { "@id": `${url}#breadcrumbs` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Jerkstore", item: JERKSTORE_URL },
          { "@type": "ListItem", position: 2, name: "Languages", item: `${JERKSTORE_URL}/languages` },
          { "@type": "ListItem", position: 3, name: `AI insults in ${page.name}`, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: languageFaq(page).map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
}
