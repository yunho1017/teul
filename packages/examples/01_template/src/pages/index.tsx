import { Link } from 'teul/client';

import { Counter } from '../components/counter';

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="max-w-3xl">
      <title>{data.title}</title>

      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">{data.headline}</h1>
        <p className="text-xl text-gray-600">{data.body}</p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">⚡️ React Server Components</h3>
          <p className="text-sm text-gray-600">
            Zero-config support for modern React features
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">🚀 File-based Routing</h3>
          <p className="text-sm text-gray-600">
            Your file structure defines your routes automatically
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">🎨 Tailwind CSS</h3>
          <p className="text-sm text-gray-600">
            Modern styling with Tailwind CSS out of the box
          </p>
        </div>
      </div>

      <Counter />

      <div className="mt-8">
        <Link to="/about" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          Learn more about Teul
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Teul - Minimal React Framework',
    headline: 'Welcome to Teul',
    body: 'A minimal React framework with built-in support for Server Components and modern development patterns.',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
