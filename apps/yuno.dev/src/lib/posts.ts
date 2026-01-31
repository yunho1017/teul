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

// Vite의 import.meta.glob을 사용하여 빌드 타임에 파일을 처리
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postFiles = (import.meta as any).glob("/content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

// 파일 경로에서 slug 추출
function getSlugFromPath(filePath: string): string {
  const match = filePath.match(/\/content\/posts\/(.+)\.md$/);
  return match?.[1] ?? "";
}

// 모든 포스트의 메타데이터 가져오기
export async function getAllPosts(tag?: string): Promise<Post[]> {
  try {
    const allPostsData = await Promise.all(
      Object.entries(postFiles).map(async ([filePath, fileContents]) => {
        const slug = getSlugFromPath(filePath);
        const { data, content } = matter(fileContents);
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
      }),
    );

    console.log("!!", allPostsData);

    // 태그 필터링
    let filteredPosts = allPostsData;
    if (tag) {
      filteredPosts = allPostsData.filter((post) =>
        post.tags.some(
          (postTag: string) => postTag.toLowerCase() === tag.toLowerCase(),
        ),
      );
    }

    // 날짜순으로 정렬 (최신순)
    return filteredPosts.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
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
    const filePath = `/content/posts/${slug}.md`;
    const fileContents = postFiles[filePath];

    if (!fileContents) {
      return null;
    }

    const { data, content } = matter(fileContents);
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
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// 모든 포스트의 slug 목록 가져오기 (동적 라우팅용)
export async function getAllPostSlugs(): Promise<string[]> {
  return Object.keys(postFiles).map(getSlugFromPath);
}
