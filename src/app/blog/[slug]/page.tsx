import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";

import { getAllPostIds, getArchivePostData, getPostData } from "@/lib/posts";
import styles from "../blog.module.css";

type Params = Promise<{ slug: string }>;

async function getRoutePost(slug: string) {
  try {
    return {
      postData: await getPostData(slug),
      archived: false,
    };
  } catch {
    try {
      return {
        postData: await getArchivePostData(slug),
        archived: true,
      };
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const routePost = await getRoutePost(slug);

  if (!routePost) {
    return {};
  }

  const { postData, archived } = routePost;
  const route = archived ? `/blog/archive/${slug}` : `/blog/${slug}`;
  const canonical = `https://www.proximalcoast.com${route}`;
  const title = `${postData.title} | Proximal Coast`;

  return {
    title,
    description: postData.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: postData.description,
      type: "article",
      publishedTime: postData.date,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: postData.description,
    },
  };
}

export function generateStaticParams() {
  return getAllPostIds().map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: { params: Params }) {
  const { slug } = await params;
  const routePost = await getRoutePost(slug);

  if (!routePost) {
    notFound();
  }

  if (routePost.archived) {
    permanentRedirect(`/blog/archive/${slug}`);
  }

  const { postData } = routePost;

  return (
    <main className={styles.article}>
      <Link href="/blog" className={styles.backLink}>
        ← Back to blog
      </Link>
      <div>
        <h1>{postData.title}</h1>
        <div className={styles.articleDate}>
          <time dateTime={postData.date}>{postData.date}</time>
        </div>
      </div>

      <article
        className={styles.articleBody}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />
    </main>
  );
}
