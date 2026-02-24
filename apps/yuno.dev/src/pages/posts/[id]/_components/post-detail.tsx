"use client";

import { use } from "react";
import { Link } from "teul";
import { Post } from "../../../../lib/posts";

type PostDetailProps = {
  postPromise: Promise<Post | null>;
};

export default function PostDetail({ postPromise }: PostDetailProps) {
  const post = use(postPromise);

  if (!post) {
    throw new Error("Post not found");
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8  ">
      <title>{post.title} - Yuno.dev</title>

      {/* Post Header */}
      <header className="mb-4 sm:mb-8 pb-6 sm:pb-8 border-b  ">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600">
          <time className="flex items-center gap-2 text-sm sm:text-base">
            <span>
              {new Date(post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </time>
        </div>
      </header>

      {/* Post Content */}
      <div
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-8 sm:mb-12   break-words overflow-hidden"
        style={{ animationDelay: "0.1s", maxWidth: "none" }}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t  "
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
            태그
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div
        className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4  "
        style={{ animationDelay: "0.3s" }}
      >
        <Link
          to="/posts/list"
          className="inline-flex items-center justify-center sm:justify-start gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group py-2 px-4 sm:p-0 border sm:border-0 border-blue-200 rounded-lg sm:rounded-none"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          전체 글 보기
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center sm:justify-start gap-2 text-gray-600 hover:text-gray-700 font-semibold transition-colors group py-2 px-4 sm:p-0 border sm:border-0 border-gray-200 rounded-lg sm:rounded-none"
        >
          홈으로
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
