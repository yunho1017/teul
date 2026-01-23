import { Link } from "teul";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-6 lg:fixed lg:left-0 lg:right-0 lg:top-0 bg-white z-10">
      <h2 className="text-lg font-bold tracking-tight">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          Teul
        </Link>
      </h2>
      <nav>
        <Link to="/about" className="text-sm font-medium hover:underline">
          About
        </Link>
      </nav>
    </header>
  );
};
