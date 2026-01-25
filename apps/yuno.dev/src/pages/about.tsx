import { Link } from "teul/client";

export default async function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <title>About - Yuno.dev</title>

      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center py-20 px-4">
        <div className="space-y-8 animate-fade-in max-w-2xl">
          {/* 이모지 애니메이션 */}
          <div className="text-7xl md:text-8xl mb-4 animate-bounce">🚧</div>

          {/* 메인 타이틀 */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              페이지 준비 중
            </h1>
          </div>

          {/* 설명 */}
          <div className="space-y-3 text-gray-600">
            <p className="text-base md:text-lg">
              현재 이 페이지는 업데이트 작업 중입니다
            </p>
            <p className="text-sm md:text-base text-gray-500">
              곧 멋진 내용으로 돌아올게요! 🎨
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/post/list"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>블로그 보러가기</span>
              <span className="ml-2">→</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:shadow-md transition-all duration-300"
            >
              <span>홈으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
