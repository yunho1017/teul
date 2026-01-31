import fs from "node:fs/promises";
import path from "node:path";
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

const postsDirectory = path.join(process.cwd(), "content/posts");

// 모든 포스트의 메타데이터 가져오기
export async function getAllPosts(): Promise<Post[]> {
  try {
    const fileNames = await fs.readdir(postsDirectory);
    const allPostsData = await Promise.all(
      fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map(async (fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          const fullPath = path.join(postsDirectory, fileName);
          const fileContents = await fs.readFile(fullPath, "utf8");

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

    // 날짜순으로 정렬 (최신순)
    return allPostsData.sort((a, b) => {
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
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, "utf8");

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
  await new Promise((resolve) => setTimeout(resolve, 3000));
  try {
    const fileNames = await fs.readdir(postsDirectory);
    return fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => fileName.replace(/\.md$/, ""));
  } catch (error) {
    console.error("Error reading post slugs:", error);
    return [];
  }
}
