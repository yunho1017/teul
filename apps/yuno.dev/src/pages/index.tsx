import { Suspense } from "react";
import { Link } from "teul";
import { getRecentPosts } from "../lib/posts";
import { HeroTitle } from "./_components/hero-title";
import { PostList } from "../components/post-list/post-list";
import { PostListSkeleton } from "../components/post-list/post-list-skeleton";

export default function HomePage() {
  const recentPostsPromise = getRecentPosts(5);

  return (
    <div className="max-w-5xl mx-auto">
      <title>Yuno.dev</title>
      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-16  ">
        <HeroTitle />
      </section>
      {/* Teul Framework Highlight */}
      <section
        className="py-6 md:py-10 lg:py-12  "
        style={{ animationDelay: "0.4s" }}
      >
        <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="text-3xl md:text-4xl">⚡️</div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900">
                이 사이트는 Teul 프레임워크로 만들어졌습니다
              </h2>
              <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                Teul(틀)은{" "}
                <a
                  href="https://waku.gg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Waku
                </a>
                를 참고하여 제가 직접 만든 최소한의 React 프레임워크입니다.
              </p>
              <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                React Server Components와 파일 기반 라우팅을 기본으로
                제공합니다.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                <span className="px-2.5 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                  React Server Components
                </span>
                <span className="px-2.5 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs md:text-sm font-medium">
                  File-based Routing
                </span>
                <span className="px-2.5 py-1 md:px-3 md:py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium">
                  Zero Config
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/teul/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors group"
                >
                  Teul 설명 보러가기
                  <span className="group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </Link>
                <a
                  href="https://github.com/yunho1017/yuno.dev/tree/main/packages/teul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors group"
                >
                  Teul 깃허브 보러가기
                  <span className="group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-6 md:mt-10 lg:mt-14 pb-8 md:pb-12 lg:pb-16  "
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between mb-5 md:mb-6 lg:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            최근 글
          </h2>
          <Link
            to={"/posts/list"}
            className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 md:gap-2 group transition-colors"
          >
            전체보기
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Recent Blog Posts */}
        <Suspense
          fallback={
            <PostListSkeleton title="최근 글" showViewAll={true} count={5} />
          }
        >
          <PostList postsPromise={recentPostsPromise} />
        </Suspense>
      </section>

      {/* About Me Section */}
      <section
        className="pb-8 md:pb-12 lg:pb-16  "
        style={{ animationDelay: "0.6s" }}
      >
        <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200 text-center">
          <p className="text-lg md:text-xl text-gray-700 mb-4">
            저에 대해 더 알고 싶으신가요?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium border border-gray-300 hover:border-blue-400 rounded-lg transition-all group"
            >
              About Me
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
            <Link
              to="/about/resume"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors group"
            >
              Resume
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
