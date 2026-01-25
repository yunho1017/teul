export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white mt-12 md:mt-16 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Yuno.dev
            </h3>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Links</h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/yunho1017"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/seoyuno"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="mailto:yunho101775@gmail.com"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Email
              </a>
              <a
                href="https://github.com/yunho1017/yuno.dev/tree/main/packages/teul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Teul Framework
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-900">
              Built with
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                React
              </span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                Teul
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} Yuno.dev. Built with Teul Framework.
          </p>
        </div>
      </div>
    </footer>
  );
};
