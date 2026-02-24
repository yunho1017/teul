import { Link } from "teul";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-6 border-b lg:fixed lg:left-0 lg:right-0 lg:top-0 bg-white z-10">
      <Link
        to="/"
        className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        Teul
      </Link>
      <nav className="flex gap-6">
        <Link to="/about" className="text-sm font-medium hover:underline">
          About
        </Link>
        <Link to="/post/list" className="text-sm font-medium hover:underline">
          Posts
        </Link>
      </nav>
    </header>
  );
};
