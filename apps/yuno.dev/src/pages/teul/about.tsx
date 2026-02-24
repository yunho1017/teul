import { Link } from "teul";
import { Suspense } from "react";
import { RSCRandomDemo } from "./_components/rsc-random-demo";
import { TeulFlowVisualizer } from "./_components/teul-flow-visualizer";
import { InteractiveCounter } from "./_components/interactive-counter";

export default async function TeulAboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <title>Teul Framework - SSR & RSC Demo</title>

      {/* Header */}
      <header className="pb-6 md:pb-8 lg:pb-12  ">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Teul Framework
        </h1>
        <p className="text-base md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
          틀 프레임워크의 동작 방식과 데모를 확인해보세요 !
        </p>
      </header>

      {/* Introduction */}
      <section
        className="mb-8 md:mb-10 lg:mb-12  "
        style={{ animationDelay: "0.1s" }}
      >
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl border border-blue-100">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
            ⚡️ Teul(틀)이란?
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
            Teul(틀)은{" "}
            <a
              href="https://waku.gg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Waku
            </a>
            를 참고하여 만든 최소한의 React 프레임워크입니다.
            <br />
            React Server Components와 Server-Side Rendering을 지원하며, 불필요한
            복잡성 없이 필요한 기능만 담았습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
              React Server Components
            </span>
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs md:text-sm font-medium">
              Server-Side Rendering
            </span>
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium">
              File-based Routing
            </span>
          </div>
        </div>
      </section>

      {/* Teul Flow Visualization */}
      <section
        className="mb-8 md:mb-10 lg:mb-12  "
        style={{ animationDelay: "0.25s" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
          ⚙️ Teul의 동작 흐름
        </h2>
        <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
          틀이 페이지를 렌더링하는 단계를 시각화합니다.
        </p>
        <TeulFlowVisualizer />
      </section>

      {/* Live Demos */}
      <section
        className="mb-8 md:mb-10 lg:mb-12  "
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
          🎯 라이브 데모
        </h2>
        <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
          SSR, RSC, RCC(Client Component)의 차이를 직접 확인해보세요.
        </p>
        <div className="grid gap-4 md:gap-6 lg:gap-8">
          {/* SSR Demo */}
          <div className="p-4 md:p-6 lg:p-8 bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 text-lg md:text-xl">
                📄
              </span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                SSR (Server-Side Rendering)
              </h3>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
              서버에서 렌더링된 HTML이 초기 응답에 포함됩니다.
            </p>

            {/* 확인 방법 */}
            <div className="bg-slate-50 p-4 md:p-5 rounded-lg md:rounded-xl border border-slate-200">
              <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                <span>🔍</span>
                <span>확인 방법</span>
              </h4>
              <ol className="space-y-2 text-sm text-gray-600 leading-relaxed break-words">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">1.</span>
                  <span className="break-words min-w-0">
                    브라우저 개발자 도구를 엽니다 (F12 또는 Cmd+Option+I)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">2.</span>
                  <span className="break-words min-w-0">
                    Network 탭으로 이동합니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">3.</span>
                  <span className="break-words min-w-0">
                    페이지를 새로고침합니다 (Cmd+R 또는 Ctrl+R)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">4.</span>
                  <span className="break-words min-w-0">
                    첫 번째 document 요청을 클릭하고 Response 탭을 확인합니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">5.</span>
                  <span className="break-words min-w-0">
                    HTML에서 돔 트리가 있는 상태로 전달된 것을 확인 할 수
                    있습니다
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* RSC Demo */}
          <div className="p-4 md:p-6 lg:p-8 bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 text-lg md:text-xl">
                ⚛️
              </span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                RSC (React Server Components)
              </h3>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
              서버에서만 실행되는 컴포넌트입니다. 서버 로직과 코드가 클라이언트
              번들에 포함되지 않습니다.
            </p>

            {/* RSC 랜덤 컴포넌트 */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-lg md:rounded-xl mb-4 md:mb-6 border border-slate-200">
              <Suspense
                fallback={
                  <div className="text-center p-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent mb-4"></div>
                    <p className="text-gray-500 font-medium">로딩 중...</p>
                  </div>
                }
              >
                <RSCRandomDemo />
              </Suspense>
            </div>

            {/* 서버 코드 예제 */}
            <div className="bg-slate-50 p-4 md:p-5 rounded-lg md:rounded-xl mb-4 border border-slate-200">
              <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                <span>💻</span>
                <span>서버 코드 (클라이언트에 전달되지 않음)</span>
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-3 md:p-4 rounded-lg text-[10px] md:text-xs overflow-x-auto">
                {`// Server Component
const SECRET_SERVER_LOGIC = {
  componentA: "🎨 컴포넌트 A",
  componentB: "🚀 컴포넌트 B",
  serverOnlyMessage: "클라이언트 비포함!"
};

export async function RSCRandomDemo() {
  const randomValue = Math.random();
  const selected = randomValue > 0.5 ? "A" : "B";

  return selected === "A"
    ? <ComponentA />
    : <ComponentB />;
}`}
              </pre>
            </div>

            {/* 확인 방법 */}
            <div className="bg-slate-50 p-4 md:p-5 rounded-lg md:rounded-xl border border-slate-200">
              <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                <span>🔍</span>
                <span>확인 방법</span>
              </h4>
              <ol className="space-y-2 text-xs md:text-sm text-gray-600 leading-relaxed break-words">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">1.</span>
                  <span className="break-words min-w-0">
                    브라우저 개발자 도구를 엽니다 (F12)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">2.</span>
                  <span className="break-words min-w-0">
                    Sources 탭에서 Cmd+P (또는 Ctrl+P)를 눌러 파일 검색을 엽니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">3.</span>
                  <span className="break-words min-w-0">
                    "SECRET_SERVER_LOGIC"이나 "component-a"를 검색합니다
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">4.</span>
                  <span className="font-bold text-gray-800 break-words min-w-0">
                    ❌ 파일을 찾을 수 없습니다! 서버 코드는 클라이언트 번들에
                    포함되지 않기 때문입니다.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">5.</span>
                  <span className="break-words min-w-0">
                    페이지를 새로고침할 때마다 다른 컴포넌트가 렌더링됩니다.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0">6.</span>
                  <span className="break-words min-w-0">
                    핵심: 컴포넌트 A가 렌더링되면 component-b.tsx는 클라이언트로
                    전송되지 않고, B가 렌더링되면 component-a.tsx가 전송되지
                    않습니다!
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* RCC Demo */}
          <div className="p-4 md:p-6 lg:p-8 bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 text-lg md:text-xl">
                🖥️
              </span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                RCC (React Client Component)
              </h3>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
              브라우저에서 실행되는 인터랙티브한 컴포넌트입니다. useState,
              useEffect 등의 훅을 사용할 수 있습니다.
            </p>

            {/* 인터랙티브 카운터 */}
            <div className="bg-slate-50 rounded-lg md:rounded-xl mb-4 md:mb-6 border border-slate-200 overflow-hidden">
              <Suspense
                fallback={
                  <div className="text-center p-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent mb-4"></div>
                    <p className="text-gray-500 font-medium">로딩 중...</p>
                  </div>
                }
              >
                <InteractiveCounter />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section
        className="mb-8 md:mb-10 lg:mb-12  "
        style={{ animationDelay: "0.35s" }}
      >
        <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Teul에 대해 더 궁금하신가요?
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              소스 코드를 직접 확인하거나, 관련 글을 읽어보세요.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yunho1017/yuno.dev/tree/main/packages/teul"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub에서 보기
              <span className="group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </a>
            <Link
              to="/posts/list?tag=teul"
              className="group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-xl border border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              관련 글 보기
              <span className="group-hover:translate-x-0.5 transition-transform">
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
    render: "static",
  } as const;
};
