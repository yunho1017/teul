import matter from "gray-matter";
import { marked } from "marked";

export interface PostMetadata {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

export interface Post extends PostMetadata {
  slug: string;
  content: string;
  html: string;
}

// 빌드 타임에 모든 마크다운 파일을 번들에 포함
const postFiles = import.meta.glob("../../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function getSlugFromPath(filePath: string): string {
  const fileName = filePath.split("/").pop() || "";
  return fileName.replace(/\.md$/, "");
}

async function parsePost(filePath: string, raw: string): Promise<Post> {
  const slug = getSlugFromPath(filePath);
  const { data, content } = matter(raw);
  const html = await marked(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    tags: data.tags || [],
    content,
    html,
  };
}

interface GetAllPostsOptions {
  tag?: string | undefined;
}

// 모든 포스트의 메타데이터 가져오기
export async function getAllPosts(
  options?: GetAllPostsOptions,
): Promise<Post[]> {
  try {
    const allPostsData = await Promise.all(
      Object.entries(postFiles).map(([filePath, raw]) =>
        parsePost(filePath, raw),
      ),
    );

    // 날짜순으로 정렬 (최신순)
    let posts = allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });

    // 태그 필터링
    if (options?.tag) {
      posts = posts.filter((post) =>
        post.tags.some(
          (t: string) => t.toLowerCase() === options.tag!.toLowerCase(),
        ),
      );
    }

    return posts;
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// 최근 N개의 포스트 가져오기
export async function getRecentPosts(count: number = 5): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, count);
}

// 특정 포스트 가져오기
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const entry = Object.entries(postFiles).find(
      ([filePath]) => getSlugFromPath(filePath) === slug,
    );

    if (!entry) return null;

    return parsePost(entry[0], entry[1]);
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// 모든 포스트의 slug 목록 가져오기 (동적 라우팅용)
export async function getAllPostSlugs(): Promise<string[]> {
  return Object.keys(postFiles).map(getSlugFromPath);
}

// 특정 태그로 포스트 필터링
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

// 모든 태그 목록 가져오기 (중복 제거)
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagsSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

// 태그별 포스트 개수 가져오기
export async function getTagsWithCount(): Promise<
  { tag: string; count: number }[]
> {
  const allPosts = await getAllPosts();
  const tagCountMap = new Map<string, number>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCountMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
