import { Link } from "teul";
import { Suspense } from "react";

async function PostList() {
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.id} className="border-l-4 border-blue-500 pl-6 py-4 hover:bg-gray-50 transition-colors rounded-r-lg">
          <Link
            to={`/post/${post.id}`}
            className="block group"
          >
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <span>👤</span>
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <span>📅</span>
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {post.category}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
            <span className="inline-flex items-center gap-2 mt-3 text-blue-600 font-medium text-sm group-hover:gap-3 transition-all">
              Read more
              <span>→</span>
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}

function PostListLoading() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-l-4 border-gray-300 pl-6 py-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex gap-4 mb-3">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostListPage() {
  return (
    <div className="max-w-4xl">
      <title>Blog Posts - Teul</title>

      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Blog Posts</h1>
        <p className="text-xl text-gray-600">
          Learn about Teul's features, best practices, and modern React patterns.
        </p>
      </div>

      <Suspense fallback={<PostListLoading />}>
        <PostList />
      </Suspense>

      <div className="mt-12 pt-8 border-t">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>←</span>
          Back to home
        </Link>
      </div>
    </div>
  );
}

const getPosts = async () => {
  // Simulate API delay to demonstrate Suspense
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    {
      id: "1",
      title: "Getting Started with Teul",
      author: "Teul Team",
      date: "2024-01-15",
      category: "Tutorial",
      excerpt:
        "Teul is a minimal React framework that makes building web applications simple and enjoyable. Learn the basics of getting started with Teul and discover how it simplifies modern React development.",
    },
    {
      id: "2",
      title: "Understanding Dynamic Routes",
      author: "Teul Team",
      date: "2024-01-20",
      category: "Guide",
      excerpt:
        "Dynamic routes allow you to create pages that respond to URL parameters. Master the [param] syntax and build flexible, data-driven pages that scale with your application.",
    },
    {
      id: "3",
      title: "Server Components vs Client Components",
      author: "Teul Team",
      date: "2024-01-25",
      category: "Concepts",
      excerpt:
        "Understanding the difference between server and client components is crucial for building performant applications. Explore when to use each pattern and optimize your app's performance.",
    },
  ];
};

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
