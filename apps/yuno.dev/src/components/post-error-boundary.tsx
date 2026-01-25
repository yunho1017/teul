"use client";

import { Component, ReactNode } from "react";
import { Link } from "teul/client";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class PostErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-fade-in">
          <title>글을 찾을 수 없습니다</title>
          <div
            className="p-8 md:p-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="text-center">
              <div className="text-7xl md:text-8xl mb-6 animate-bounce">🔍</div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                글을 찾을 수 없습니다
              </h1>
              <p className="text-lg md:text-xl text-amber-800 mb-8 leading-relaxed">
                요청하신 글이 존재하지 않거나 삭제되었습니다.
              </p>

              <div className="bg-amber-100 p-4 md:p-6 rounded-lg md:rounded-xl border border-amber-300 mb-8">
                <p className="text-sm md:text-base text-amber-800">
                  💡 다른 흥미로운 글들을 확인해보세요!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  홈으로 돌아가기
                </Link>
                <Link
                  to="/post/list"
                  className="px-8 py-3 border-2 border-amber-300 bg-white/80 backdrop-blur rounded-lg md:rounded-xl font-semibold hover:border-amber-400 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg text-amber-900"
                >
                  전체 글 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
