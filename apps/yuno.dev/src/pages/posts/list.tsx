import { Suspense } from "react";
import { getAllPosts } from "../../lib/posts";
import { PostList } from "../../components/post-list/post-list";
import { PostListSkeleton } from "../../components/post-list/post-list-skeleton";

interface BlogListPageProps {
  query?: string;
}

export default function BlogListPage({ query }: BlogListPageProps) {
  const tag = new URLSearchParams(query).get("tag");
  const postsPromise = getAllPosts(tag || undefined);

  return (
    <div className="max-w-4xl mx-auto ">
      <title>블로그 - Yuno.dev</title>

      <header className="pb-6 md:pb-8 lg:pb-12 animate-fade-in">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          블로그
          {tag && (
            <span className="text-2xl md:text-3xl lg:text-4xl ml-4 text-gray-600">
              #{tag}
            </span>
          )}
        </h1>
        <p className="text-base md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
          {tag ? `"${tag}" 태그의 글들` : "배움에 대한 기록"}
        </p>
      </header>

      {/* Posts List */}
      <Suspense fallback={<PostListSkeleton count={6} />}>
        <PostList postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
