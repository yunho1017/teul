import { Link } from "teul";
import { Suspense, lazy } from "react";
import { RSCRandomDemo } from "./_components/rsc-random-demo";
import { TeulFlowVisualizer } from "./_components/teul-flow-visualizer";
import { InteractiveCounter } from "./_components/interactive-counter";

export default async function TeulAboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <title>Teul Framework - SSR & RSC Demo</title>

      {/* Header */}
      <header className="pb-6 md:pb-8 lg:pb-12 animate-fade-in">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Teul Framework
        </h1>
        <p className="text-base md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
          틀 프레임워크의 동작 방식과 데모를 확인해보세요 !
        </p>
      </header>

      {/* Introduction */}
      <section
        className="mb-8 md:mb-10 lg:mb-12 animate-slide-up"
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
        className="mb-8 md:mb-10 lg:mb-12 animate-slide-up"
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
        className="mb-8 md:mb-10 lg:mb-12 animate-slide-up"
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
          <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl">📄</span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-amber-900">
                SSR (Server-Side Rendering)
              </h3>
            </div>
            <p className="text-sm md:text-base text-amber-800 mb-4 md:mb-6 leading-relaxed">
              서버에서 렌더링된 HTML이 초기 응답에 포함됩니다.
            </p>

            {/* 확인 방법 */}
            <div className="bg-amber-100 p-4 md:p-5 rounded-lg md:rounded-xl border border-amber-300">
              <h4 className="text-sm md:text-base font-bold text-amber-900 mb-2 md:mb-3 flex items-center gap-2">
                <span>🔍</span>
                <span>확인 방법</span>
              </h4>
              <ol className="space-y-2 text-sm text-amber-800 leading-relaxed break-words">
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
          <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl md:rounded-2xl border-2 border-violet-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl">⚛️</span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-violet-900">
                RSC (React Server Components)
              </h3>
            </div>
            <p className="text-sm md:text-base text-violet-800 mb-4 md:mb-6 leading-relaxed">
              서버에서만 실행되는 컴포넌트입니다. 서버 로직과 코드가 클라이언트
              번들에 포함되지 않습니다.
            </p>

            {/* RSC 랜덤 컴포넌트 */}
            <div className="bg-white/80 backdrop-blur p-4 md:p-6 rounded-lg md:rounded-xl mb-4 md:mb-6 border border-violet-200">
              <Suspense
                fallback={
                  <div className="text-center p-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                    <p className="text-emerald-600 font-medium">로딩 중...</p>
                  </div>
                }
              >
                <RSCRandomDemo />
              </Suspense>
            </div>

            {/* 서버 코드 예제 */}
            <div className="bg-violet-100 p-4 md:p-5 rounded-lg md:rounded-xl mb-4 border border-violet-300">
              <h4 className="text-sm md:text-base font-bold text-violet-900 mb-2 md:mb-3 flex items-center gap-2">
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
            <div className="bg-violet-100 p-4 md:p-5 rounded-lg md:rounded-xl border border-violet-300">
              <h4 className="text-sm md:text-base font-bold text-violet-900 mb-2 md:mb-3 flex items-center gap-2">
                <span>🔍</span>
                <span>확인 방법</span>
              </h4>
              <ol className="space-y-2 text-xs md:text-sm text-violet-800 leading-relaxed break-words">
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
                  <span className="font-bold text-violet-900 break-words min-w-0">
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
          <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl md:rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl">💻</span>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-emerald-900">
                RCC (React Client Component)
              </h3>
            </div>
            <p className="text-sm md:text-base text-emerald-800 mb-4 md:mb-6 leading-relaxed">
              브라우저에서 실행되는 인터랙티브한 컴포넌트입니다. useState,
              useEffect 등의 훅을 사용할 수 있습니다.
            </p>

            {/* 인터랙티브 카운터 */}
            <div className="bg-white/80 backdrop-blur rounded-lg md:rounded-xl mb-4 md:mb-6 border border-emerald-200 overflow-hidden">
              <Suspense
                fallback={
                  <div className="text-center p-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                    <p className="text-emerald-600 font-medium">로딩 중...</p>
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
        className="mb-8 md:mb-10 lg:mb-12 animate-slide-up"
        style={{ animationDelay: "0.35s" }}
      >
        <div className="text-center mb-6">
          <p className="text-lg md:text-xl text-gray-700 font-medium">
            Teul에 대해 더 궁금하신가요?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://github.com/yunho1017/yuno.dev/tree/main/packages/teul"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300 text-center"
          >
            Teul GitHub 보러가기
          </a>
          <Link
            to="/posts/list?tag=teul"
            className="px-8 py-4 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all duration-300 text-center"
          >
            Teul 관련 글 보러가기
          </Link>
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
