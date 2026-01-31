export function PostCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="p-4 md:p-5 lg:p-6 bg-white border border-gray-200 rounded-lg md:rounded-xl lg:rounded-2xl animate-pulse"
      style={{ animationDelay: `${0.1 * (index + 1)}s` }}
    >
      {/* Title and Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2 lg:gap-3 mb-2.5 md:mb-3 lg:mb-4">
        <div className="h-5 md:h-6 lg:h-7 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 md:h-4 bg-gray-200 rounded w-24 md:w-28"></div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2 mb-2.5 md:mb-3 lg:mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        <div className="h-6 md:h-7 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 md:h-7 bg-gray-200 rounded-full w-24"></div>
        <div className="h-6 md:h-7 bg-gray-200 rounded-full w-16"></div>
      </div>
    </div>
  );
}
