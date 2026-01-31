import { Link } from "teul/client";
import type { Post } from "../lib/posts";

type PostCardProps = {
  post: Post;
  index?: number;
};

export const PostCard = ({ post, index = 0 }: PostCardProps) => {
  return (
    <Link to={`/posts/${post.slug}`}>
      <article
        className="group p-4 md:p-5 lg:p-6 bg-white border border-gray-200 rounded-lg md:rounded-xl lg:rounded-2xl hover:shadow-lg hover:border-blue-300 transition-all duration-300 animate-slide-up"
        style={{ animationDelay: `${0.1 * (index + 1)}s` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-2 lg:gap-3 mb-2.5 md:mb-3 lg:mb-4">
          <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <time className="text-xs md:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
            {new Date(post.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        <p className="text-sm md:text-base text-gray-600 mb-2.5 md:mb-3 lg:mb-4 leading-relaxed line-clamp-2 md:line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
};
