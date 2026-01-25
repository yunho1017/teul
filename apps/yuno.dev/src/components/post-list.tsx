"use client";

import { use } from "react";
import { PostCard } from "./post-card";
import type { Post } from "../lib/posts";

interface PostListProps {
  postsPromise: Promise<Post[]>;
}

export function PostList({ postsPromise }: PostListProps) {
  const posts = use(postsPromise);

  return (
    <section>
      <div className="grid gap-3 md:gap-4 lg:gap-6">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>

      {posts.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 md:py-24 px-4 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="p-8 md:p-12  from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl  transition-all duration-300 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl md:text-7xl mb-6 animate-bounce">📝</div>
              <h3 className="text-xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                아직 작성된 글이 없습니다
              </h3>
              <div className="space-y-2 text-base md:text-lg text-gray-700">
                <p>열심히 작성하고 있어요!</p>
                <p>조금만 기다려주세요 ✨</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
