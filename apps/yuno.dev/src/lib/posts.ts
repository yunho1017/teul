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

// 모든 포스트의 메타데이터 가져오기
export async function getAllPosts(tag?: string): Promise<Post[]> {
  return [];
}

// 최근 N개의 포스트 가져오기
export async function getRecentPosts(count: number = 5): Promise<Post[]> {
  return [];
}

// 특정 포스트 가져오기
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return null;
}

// 모든 포스트의 slug 목록 가져오기 (동적 라우팅용)
export async function getAllPostSlugs(): Promise<string[]> {
  return [];
}
