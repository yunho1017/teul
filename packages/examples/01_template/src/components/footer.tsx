export const Footer = () => {
  return (
    <footer className="p-6 lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-white">
      <div className="text-sm text-gray-600">
        <a
          href="https://github.com/yuno-dev/teul"
          target="_blank"
          rel="noreferrer"
          className="inline-block underline hover:text-gray-900"
        >
          Teul
        </a>
        {" - "}A minimal React framework
      </div>
    </footer>
  );
};
