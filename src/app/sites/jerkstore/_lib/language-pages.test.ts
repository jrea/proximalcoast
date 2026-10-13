import { describe, expect, it } from "vitest";
import { PREMIUM_LANGUAGES } from "../constants";
import {
  getLanguagePage,
  LANGUAGE_CATEGORIES,
  LANGUAGE_GROUPS,
  LANGUAGE_PAGES,
} from "./language-pages";

describe("Jerkstore language page catalog", () => {
  it("covers each supported selector option exactly once with its canonical label", () => {
    expect(LANGUAGE_PAGES.map(({ value, label }) => ({ value, label }))).toEqual(
      PREMIUM_LANGUAGES,
    );
    expect(new Set(LANGUAGE_PAGES.map(({ slug }) => slug)).size).toBe(
      PREMIUM_LANGUAGES.length,
    );
  });

  it("gives every language substantive, distinct editorial content", () => {
    for (const page of LANGUAGE_PAGES) {
      expect(page.name.length).toBeGreaterThan(0);
      expect(page.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(page.description.length).toBeGreaterThanOrEqual(130);
      expect(page.description.length).toBeLessThanOrEqual(170);
      expect(page.intro.length).toBeGreaterThan(200);
      expect(page.styleNotes.length).toBeGreaterThanOrEqual(2);
      expect(page.promptExamples.length).toBeGreaterThanOrEqual(3);
      expect(page.faq.length).toBeGreaterThanOrEqual(2);
      expect(new Set(page.promptExamples).size).toBe(page.promptExamples.length);
      for (const { question, answer } of page.faq) {
        expect(question.length).toBeGreaterThan(20);
        expect(answer.length).toBeGreaterThan(100);
      }
    }
    expect(new Set(LANGUAGE_PAGES.map(({ intro }) => intro)).size).toBe(
      LANGUAGE_PAGES.length,
    );
    expect(new Set(LANGUAGE_PAGES.map(({ description }) => description)).size).toBe(
      LANGUAGE_PAGES.length,
    );
  });

  it("organizes pages into an exhaustive ordered directory", () => {
    expect(LANGUAGE_GROUPS.map(({ category }) => category)).toEqual(
      LANGUAGE_CATEGORIES,
    );
    expect(LANGUAGE_GROUPS.flatMap(({ pages }) => pages).length).toBe(
      LANGUAGE_PAGES.length,
    );
    for (const { category, pages } of LANGUAGE_GROUPS) {
      expect(pages.length).toBeGreaterThan(0);
      expect(pages.every((page) => page.category === category)).toBe(true);
    }
  });

  it("resolves human-readable slugs without silently inventing unsupported options", () => {
    for (const page of LANGUAGE_PAGES) {
      expect(getLanguagePage(page.slug)).toBe(page);
    }
    expect(getLanguagePage("unsupported-language")).toBeUndefined();
    expect(getLanguagePage("SPANISH")).toBeUndefined();
    expect(getLanguagePage("sindarin-elvish")?.value).toBe("Sindarin Elvish");
    expect(getLanguagePage("pirate-speak")?.value).toBe("Pirate");
    expect(getLanguagePage("minion-speak")?.value).toBe("Minion");
  });

  it("distinguishes historical languages from related performance styles and encodings", () => {
    for (const slug of ["ancient-greek", "latin", "old-english", "middle-english"]) {
      expect(getLanguagePage(slug)?.category).toBe("Historical languages");
    }
    for (const slug of ["shakespearean-english", "victorian-english", "ye-olde-english"]) {
      expect(getLanguagePage(slug)?.category).toBe("Slang and styles");
    }
    for (const slug of ["pig-latin", "morse-code", "binary", "base64", "lojban", "esperanto"]) {
      expect(getLanguagePage(slug)?.category).toBe("Codes and constructed languages");
    }
  });
});
