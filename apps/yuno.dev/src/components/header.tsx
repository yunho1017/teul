"use client";

import { useState } from "react";
import { Link } from "teul";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button - Left */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="메뉴 열기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo - Center on mobile, Left on desktop */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Yuno.dev
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <nav className="flex gap-6 lg:gap-8">
                <Link
                  to="/"
                  className="text-sm md:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-sm md:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/about/resume"
                  className="text-sm md:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Resume
                </Link>
                <Link
                  to="/posts/list"
                  className="text-sm md:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </nav>

              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/yunho1017"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5 md:w-[22px] md:h-[22px]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>

                <a
                  href="https://www.linkedin.com/in/seoyuno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-[18px] h-[18px] md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                <a
                  href="mailto:yunho101775@gmail.com"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="Email"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Placeholder for mobile to keep layout balanced */}
            <div className="md:hidden w-10"></div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-xl animate-slide-in-left">
            <div className="flex flex-col h-full">
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/about/resume"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Resume
                </Link>
                <Link
                  to="/posts/list"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Blog
                </Link>
              </nav>

              {/* Social Icons */}
              <div className="px-4 py-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Connect
                </p>
                <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/yunho1017"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="GitHub"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/seoyuno"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>

                  <a
                    href="mailto:yunho101775@gmail.com"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="Email"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
