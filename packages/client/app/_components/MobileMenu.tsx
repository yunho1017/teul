"use client";

import React, { useState } from "react";
import Link from "../../framework/components/link";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 모바일 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Yuno.Dev
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/posts"
              className="text-gray-600 hover:text-gray-900 py-2"
              onClick={() => setIsOpen(false)}
            >
              Posts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
