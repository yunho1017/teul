import { Link } from "teul";
import { Suspense } from "react";

type PostPageProps = {
  id: string;
};

async function PostContent({ id }: PostPageProps) {
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="max-w-3xl text-center py-20">
        <title>Post not found</title>
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Post not found</h1>
        <p className="text-xl text-gray-600 mb-8">
          The post with id <code className="px-2 py-1 bg-gray-100 rounded">{id}</code> does not exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Return home
          </Link>
          <Link to="/post/list" className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:border-gray-400 transition-colors">
            View all posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl">
      <title>{post.title} - Teul Blog</title>

      {/* Post Header */}
      <header className="mb-8 pb-8 border-b">
        <div className="mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-6 text-gray-600">
          <span className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span className="font-medium">{post.author}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span>{post.readTime} min read</span>
          </span>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none">
        <div className="text-xl leading-relaxed text-gray-700 space-y-6">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Tags */}
      {post.tags && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t flex items-center justify-between">
        <Link to="/post/list" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>←</span>
          All posts
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium">
          Home
          <span>→</span>
        </Link>
      </div>
    </article>
  );
}

function PostLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 pb-8 border-b">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-6">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          <div className="h-5 bg-gray-200 rounded w-28"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mt-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  );
}

export default function PostPage({ id }: PostPageProps) {
  return (
    <Suspense fallback={<PostLoading />}>
      <PostContent id={id} />
    </Suspense>
  );
}

// Mock data - In a real app, this would fetch from a database or API
const getPost = async (id: string) => {
  // Simulate API delay to demonstrate Suspense
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const posts: Record<
    string,
    { title: string; author: string; date: string; category: string; content: string; readTime: number; tags: string[] }
  > = {
    "1": {
      title: "Getting Started with Teul",
      author: "Teul Team",
      date: "2024-01-15",
      category: "Tutorial",
      readTime: 5,
      tags: ["getting-started", "tutorial", "basics"],
      content:
        "Teul is a minimal React framework that makes building web applications simple and enjoyable. This post will guide you through the basics of getting started with Teul.\n\nThe framework is designed with simplicity in mind. Unlike heavier alternatives, Teul focuses on providing just what you need to build modern web applications. With built-in support for React Server Components, file-based routing, and zero configuration, you can start building immediately.\n\nTo get started, simply create a new Teul project and begin adding pages to your pages directory. Each file becomes a route automatically. Dynamic routes use the [param] syntax, making it intuitive to build data-driven applications.\n\nTeul also includes excellent developer experience features like hot module replacement, TypeScript support, and integrated Tailwind CSS. Everything works together seamlessly, allowing you to focus on building your application rather than configuring tools.",
    },
    "2": {
      title: "Understanding Dynamic Routes",
      author: "Teul Team",
      date: "2024-01-20",
      category: "Guide",
      readTime: 7,
      tags: ["routing", "dynamic-routes", "guide"],
      content:
        "Dynamic routes allow you to create pages that respond to URL parameters. This is useful for blog posts, user profiles, product pages, and more. In Teul, you can create dynamic routes using the [param] syntax.\n\nFor example, creating a file at pages/post/[id].tsx will match any URL like /post/1, /post/hello, or /post/my-awesome-post. The parameter value is passed to your component as a prop, allowing you to fetch the appropriate data.\n\nDynamic routes can be combined with React Server Components to fetch data on the server before rendering. This means your pages can be both dynamic and performant, with data loading happening on the server where it's fastest.\n\nYou can also use multiple dynamic segments, like pages/blog/[category]/[slug].tsx, to create more complex routing patterns. Teul handles all the routing logic for you, so you can focus on building your application.",
    },
    "3": {
      title: "Server Components vs Client Components",
      author: "Teul Team",
      date: "2024-01-25",
      category: "Concepts",
      readTime: 8,
      tags: ["server-components", "client-components", "performance"],
      content:
        "Understanding the difference between server and client components is crucial for building performant applications. Server components run on the server and can directly access data sources, while client components run in the browser and can be interactive.\n\nServer components are the default in Teul. They allow you to fetch data, access files, and perform other server-side operations without sending JavaScript to the client. This results in smaller bundle sizes and faster page loads.\n\nClient components are used when you need interactivity. Add 'use client' at the top of your file to mark it as a client component. Use these for forms, buttons, animations, and any feature that requires user interaction or browser APIs.\n\nThe key is finding the right balance. Use server components for most of your application, and sprinkle in client components only where needed. This hybrid approach gives you the best of both worlds: the performance of server rendering with the interactivity of client-side React.",
    },
  };

  return posts[id] || null;
};

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
