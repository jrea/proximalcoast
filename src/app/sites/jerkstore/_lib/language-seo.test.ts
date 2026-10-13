// @vitest-environment node
import { describe, expect, it } from "vitest";
import { LANGUAGE_PAGES } from "./language-pages";
import { JERKSTORE_URL, languageFaq, languageMetadata, languagePath, languageStructuredData } from "./language-seo";

describe("language page search metadata", () => {
  it.each(LANGUAGE_PAGES)("uses a distinct public canonical and matching share image for $name", page => {
    const metadata = languageMetadata(page);
    const url = `${JERKSTORE_URL}${languagePath(page)}`;
    expect(metadata.title).toEqual({ absolute: `AI Insults in ${page.name} | Jerkstore` });
    expect(metadata.description).toBe(page.description);
    expect(metadata.alternates).toEqual({ canonical: url });
    expect(metadata.openGraph).toMatchObject({ url, description: page.description, images: [{ url: `${url}/opengraph-image` }] });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(JSON.stringify(metadata)).not.toContain("/sites/jerkstore");
  });

  it.each(LANGUAGE_PAGES)("uses the visible $name FAQs and English editorial language in structured data", page => {
    const graph = languageStructuredData(page)["@graph"];
    expect(graph[0]).toMatchObject({ "@type": "WebPage", inLanguage: "en" });
    expect(graph[1]).toMatchObject({ "@type": "BreadcrumbList", itemListElement: [
      { position: 1, item: JERKSTORE_URL },
      { position: 2, item: `${JERKSTORE_URL}/languages` },
      { position: 3, item: `${JERKSTORE_URL}${languagePath(page)}` },
    ] });
    expect(graph[2]).toMatchObject({ "@type": "FAQPage", mainEntity: languageFaq(page).map(faq => ({
      name: faq.question,
      acceptedAnswer: { text: faq.answer },
    })) });
    expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|reviewCount|ratingValue/);
  });

  it("makes every title, canonical, and description unique", () => {
    const metadata = LANGUAGE_PAGES.map(languageMetadata);
    expect(new Set(metadata.map(page => JSON.stringify(page.title))).size).toBe(LANGUAGE_PAGES.length);
    expect(new Set(metadata.map(page => page.alternates?.canonical)).size).toBe(LANGUAGE_PAGES.length);
    expect(new Set(metadata.map(page => page.description)).size).toBe(LANGUAGE_PAGES.length);
  });
});
