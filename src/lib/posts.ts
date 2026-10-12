import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');
const archiveDirectory = path.join(postsDirectory, 'archive');

export interface PostData {
  id: string;
  date: string;
  title: string;
  description: string;
  site?: string;
  game?: string;
  contentHtml?: string;
}

type PostFrontMatter = {
  date: string;
  title: string;
  description: string;
  site?: string;
  game?: string;
};

function getMarkdownFileNames(directory: string) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory).filter((fileName) => fileName.endsWith('.md'));
}

function getPostMetadata(directory: string): PostData[] {
  return getMarkdownFileNames(directory).map((fileName) => {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(directory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      ...(matterResult.data as PostFrontMatter),
    };
  });
}

function sortPosts(posts: PostData[]) {
  return posts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

export function getSortedCurrentPostsData(): PostData[] {
  return sortPosts(getPostMetadata(postsDirectory));
}

// Keep the original all-posts behavior for existing subsite consumers while
// the main blog and game pages use the current-only helper above.
export function getSortedPostsData(): PostData[] {
  return sortPosts([
    ...getPostMetadata(postsDirectory),
    ...getPostMetadata(archiveDirectory),
  ]);
}

export function getSortedArchivePostsData(): PostData[] {
  return sortPosts(getPostMetadata(archiveDirectory));
}

export function getPostsForGame(game: string): PostData[] {
  return getSortedCurrentPostsData().filter((post) => post.game === game);
}

export function getAllPostIds() {
  return getMarkdownFileNames(postsDirectory).map((fileName) => ({
    params: {
      slug: fileName.replace(/\.md$/, ''),
    },
  }));
}

export function getAllArchivePostIds() {
  return getMarkdownFileNames(archiveDirectory).map((fileName) => ({
    params: {
      slug: fileName.replace(/\.md$/, ''),
    },
  }));
}

export async function getPostData(id: string): Promise<PostData> {
  return getPostDataFromDirectory(postsDirectory, id);
}

export async function getArchivePostData(id: string): Promise<PostData> {
  return getPostDataFromDirectory(archiveDirectory, id);
}

async function getPostDataFromDirectory(directory: string, id: string): Promise<PostData> {
  const fullPath = path.join(directory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...(matterResult.data as PostFrontMatter),
  };
}
