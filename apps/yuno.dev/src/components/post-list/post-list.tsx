"use client";

import { use } from "react";
import { PostCard } from "../post-card/post-card";
import { Feedback } from "../feedback";
import type { Post } from "../../lib/posts";

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
        <Feedback
          icon="📝"
          title="아직 작성된 글이 없습니다"
          description="열심히 작성하고 있어요! 조금만 기다려주세요 ✨"
          buttons={[]}
        />
      )}
    </section>
  );
}
