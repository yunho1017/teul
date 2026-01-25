import { Suspense } from "react";
import { getPostBySlug } from "../../lib/posts";
import PostDetail from "../../components/post-detail";
import { PostErrorBoundary } from "../../components/post-error-boundary";

type PostPageProps = {
  id: string;
};

export default function PostPage({ id }: PostPageProps) {
  const postPromise = getPostBySlug(id);

  return (
    <PostErrorBoundary>
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b">
              <div className="h-12 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-4 sm:mb-6" />
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        }
      >
        <PostDetail postPromise={postPromise} />
      </Suspense>
    </PostErrorBoundary>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
