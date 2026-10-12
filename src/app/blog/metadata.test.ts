// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPostData, getArchivePostData, requestHeaders } = vi.hoisted(() => ({
  getPostData: vi.fn(),
  getArchivePostData: vi.fn(),
  requestHeaders: vi.fn(() => {
    throw new Error("Shared blog metadata must not depend on a tenant request host");
  }),
}));

vi.mock("@/lib/posts", () => ({
  getPostData,
  getArchivePostData,
  getAllPostIds: vi.fn(),
  getSortedCurrentPostsData: vi.fn(),
  getSortedArchivePostsData: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: requestHeaders }));

import { generateMetadata } from "./[slug]/page";
import { metadata as blogMetadata } from "./page";
import { metadata as archiveMetadata } from "./archive/page";

const post = {
  id: "example",
  title: "Example project note",
  description: "A note from a side project.",
  date: "2026-01-01",
  site: "jerkstore",
};

describe("shared blog canonical ownership", () => {
  beforeEach(() => {
    getPostData.mockReset();
    getArchivePostData.mockReset();
  });

  it("keeps a subsite-tagged current post on the main site's canonical domain", async () => {
    getPostData.mockResolvedValue(post);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: post.id }) });

    expect(metadata.alternates?.canonical).toBe("https://proximalcoast.com/blog/example");
    expect(metadata.openGraph?.url).toBe("https://proximalcoast.com/blog/example");
    expect(requestHeaders).not.toHaveBeenCalled();
  });

  it("points a legacy archived post URL at the main archive destination", async () => {
    getPostData.mockRejectedValue(new Error("No current post"));
    getArchivePostData.mockResolvedValue(post);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: post.id }) });

    expect(metadata.alternates?.canonical).toBe("https://proximalcoast.com/blog/archive/example");
    expect(metadata.openGraph?.url).toBe("https://proximalcoast.com/blog/archive/example");
    expect(requestHeaders).not.toHaveBeenCalled();
  });

  it("keeps both blog indexes canonical on the main domain", () => {
    expect(blogMetadata.alternates?.canonical).toBe("https://proximalcoast.com/blog");
    expect(archiveMetadata.alternates?.canonical).toBe("https://proximalcoast.com/blog/archive");
    expect(blogMetadata.openGraph?.url).toBe("https://proximalcoast.com/blog");
    expect(archiveMetadata.openGraph?.url).toBe("https://proximalcoast.com/blog/archive");
  });

  it("retains main-domain social preview images when index Open Graph fields replace inherited metadata", () => {
    const images = ["https://proximalcoast.com/opengraph-image"];
    expect(blogMetadata.openGraph?.images).toEqual(images);
    expect(archiveMetadata.openGraph?.images).toEqual(images);
  });
});
