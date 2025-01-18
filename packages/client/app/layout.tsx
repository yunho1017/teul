import React from "react";
import Link from "../framework/components/link";
import MobileMenu from "./_components/MobileMenu";
import { TypoAnimation } from "../common/components/TypoAnimation";
import { URLS } from "../common/url";

interface LayoutProps {
  children: React.ReactNode;
  params: Record<string, string>;
}

const Layout = React.memo(function Layout({ children, params }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <MobileMenu />

            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-xl font-bold text-gray-800 hover:text-gray-600"
              >
                <TypoAnimation sequence={["Yuno.dev"]} />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href={URLS.Home.toString()}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
              >
                Home
              </Link>
              <Link
                href={URLS.About.toString()}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
              >
                About
              </Link>
              <Link
                href={URLS.Posts.toString()}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700"
              >
                Posts
              </Link>
            </div>
            {/* 오른쪽 여백을 위한 빈 div */}
            <div className="sm:hidden w-10"></div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">{children}</div>
      </main>
    </div>
  );
});

export default Layout;
