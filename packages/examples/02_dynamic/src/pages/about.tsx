import { Link } from "teul";

export default async function AboutPage() {
  const data = await getData();

  return (
    <div className="max-w-3xl">
      <title>{data.title}</title>

      <h1 className="text-5xl font-bold tracking-tight mb-6">{data.headline}</h1>

      <div className="space-y-6 text-lg leading-relaxed text-gray-700">
        <p className="text-xl font-medium text-gray-900">
          {data.description}
        </p>

        <p>
          Teul is designed to make building modern web applications simple and enjoyable.
          It combines the best features of React with a minimal, opinionated framework that
          gets out of your way.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
          <p className="font-semibold text-blue-900 mb-2">Note: This page uses noSsr mode</p>
          <p className="text-sm text-blue-800">
            This demonstrates client-side rendering. The page is rendered entirely in the browser,
            showing Teul's flexibility in handling different rendering strategies.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">Key Features</h2>

        <ul className="space-y-3 list-none">
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold text-xl">✓</span>
            <span><strong>React Server Components:</strong> Zero-config support for the latest React features</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold text-xl">✓</span>
            <span><strong>File-based Routing:</strong> Your file structure defines your routes</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold text-xl">✓</span>
            <span><strong>Dynamic Routes:</strong> Handle URL parameters with ease using [param] syntax</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold text-xl">✓</span>
            <span><strong>Suspense Support:</strong> Built-in loading states for async components</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 font-bold text-xl">✓</span>
            <span><strong>Modern Tooling:</strong> Vite, Tailwind CSS, and TypeScript out of the box</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">Perfect For</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🚀 New Projects</h3>
            <p className="text-sm text-gray-600">Start fresh with modern React patterns</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">📚 Learning</h3>
            <p className="text-sm text-gray-600">Understand Server Components concepts</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🔨 Prototyping</h3>
            <p className="text-sm text-gray-600">Quick iteration with minimal setup</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">🎯 Production Apps</h3>
            <p className="text-sm text-gray-600">Performant and scalable by default</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>←</span>
          Return home
        </Link>
      </div>
    </div>
  );
}

const getData = async () => {
  const data = {
    title: "About Teul",
    headline: "About Teul",
    description: "A minimal React framework with built-in support for Server Components and modern development patterns.",
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: "static",
    noSsr: true,
  } as const;
};
