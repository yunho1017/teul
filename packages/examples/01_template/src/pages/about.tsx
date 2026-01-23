import { Link } from "teul";

export default async function AboutPage() {
  const data = await getData();

  return (
    <div className="max-w-3xl">
      <title>{data.title}</title>

      <h1 className="text-5xl font-bold tracking-tight mb-6">{data.headline}</h1>

      <div className="space-y-4 text-lg leading-relaxed text-gray-700 mb-8">
        <p className="text-xl font-medium text-gray-900">
          {data.description}
        </p>

        <p>
          Teul is designed to make building modern web applications simple and enjoyable.
          It combines the best features of React with a minimal, opinionated framework that
          gets out of your way.
        </p>

        <p>
          With built-in support for React Server Components, file-based routing, and zero
          configuration, you can start building immediately without worrying about complex
          setup or tooling decisions.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <ul className="space-y-2 list-none">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>React Server Components with zero configuration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>File-based routing that follows your project structure</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Built-in Tailwind CSS for modern styling</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>TypeScript support out of the box</span>
          </li>
        </ul>
      </div>

      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
        <span>←</span>
        Return home
      </Link>
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
  } as const;
};
