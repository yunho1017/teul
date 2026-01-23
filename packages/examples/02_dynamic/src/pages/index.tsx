import { Link } from 'teul/client';

import { InteractiveDemo } from '../components/counter';

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="max-w-4xl">
      <title>{data.title}</title>

      {/* Hero Section */}
      <div className="py-12">
        <h1 className="text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {data.headline}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          {data.body}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">⚡️</div>
          <h3 className="text-lg font-semibold mb-2">Server Components</h3>
          <p className="text-sm text-gray-600">
            Built-in support for React Server Components with zero configuration.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-lg font-semibold mb-2">File-based Routing</h3>
          <p className="text-sm text-gray-600">
            Intuitive routing system powered by your file structure.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">🎨</div>
          <h3 className="text-lg font-semibold mb-2">Styled with Tailwind</h3>
          <p className="text-sm text-gray-600">
            Modern styling with Tailwind CSS v4 out of the box.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="text-lg font-semibold mb-2">Zero Bundle Size</h3>
          <p className="text-sm text-gray-600">
            Server components mean less JavaScript shipped to the client.
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* CTA Section */}
      <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to explore?</h2>
        <p className="mb-6 text-blue-100">
          Check out our blog posts to learn more about dynamic routing and server components.
        </p>
        <div className="flex gap-4">
          <Link
            to="/post/list"
            className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            View Blog Posts
          </Link>
          <Link
            to="/about"
            className="px-6 py-2.5 border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Teul - The Minimal React Framework',
    headline: 'Welcome to Teul',
    body: 'A minimal React framework with built-in support for Server Components, file-based routing, and modern development tools.',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
