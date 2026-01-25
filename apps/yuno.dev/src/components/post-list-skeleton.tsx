import { PostCardSkeleton } from "./post-card-skeleton";

interface PostListSkeletonProps {
  title?: string;
  showViewAll?: boolean;
  count?: number;
}

export function PostListSkeleton({
  title,
  showViewAll = false,
  count = 3,
}: PostListSkeletonProps) {
  return (
    <section className="mt-6 md:mt-10 lg:mt-14 pb-8 md:pb-12 lg:pb-16">
      {title && (
        <div className="flex items-center justify-between mb-5 md:mb-6 lg:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          {showViewAll && (
            <div className="text-sm md:text-base text-blue-600 font-medium flex items-center gap-1.5 md:gap-2">
              전체보기
              <span>→</span>
            </div>
          )}
        </div>
      )}
      <div className="grid gap-3 md:gap-4 lg:gap-6">
        {[...Array(count)].map((_, i) => (
          <PostCardSkeleton key={i} index={i} />
        ))}
      </div>
    </section>
  );
}
