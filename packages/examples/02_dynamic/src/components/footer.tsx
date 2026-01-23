export const Footer = () => {
  return (
    <footer className="p-6 border-t lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>© 2024 Teul. A minimal React framework.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/yuno-dev/teul"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://yuno.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};
