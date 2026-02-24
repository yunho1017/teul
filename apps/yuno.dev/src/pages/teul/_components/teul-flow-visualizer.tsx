"use client";

import { useEffect, useState } from "react";

type Step =
  | "idle"
  | "client-request"
  | "client-to-server"
  | "server-receive"
  | "server-init"
  | "server-routing"
  | "server-to-ssr"
  | "ssr-render"
  | "ssr-to-server"
  | "server-send"
  | "server-to-client"
  | "client-receive"
  | "client-hydrate"
  | "client-rsc-request"
  | "client-to-server-rsc"
  | "server-rsc-receive"
  | "server-rsc-render"
  | "server-rsc-send"
  | "server-to-client-rsc"
  | "client-render"
  | "complete";

interface FlowStep {
  step: Step;
  location: "client" | "server" | "ssr";
  icon: string;
  title: string;
  subtitle: string;
  gridColumn: number;
  gridRow: number;
  showArrowOnStep?: Step;
  arrowDirection?: "→" | "←" | "↓";
}

const flowSteps: FlowStep[] = [
  {
    step: "client-request",
    location: "client",
    icon: "📨",
    title: "요청 전송",
    subtitle: "GET /about",
    gridColumn: 1,
    gridRow: 2,
    showArrowOnStep: "client-to-server",
    arrowDirection: "→",
  },
  {
    step: "server-receive",
    location: "server",
    icon: "📬",
    title: "요청 수신",
    subtitle: "클라이언트 요청",
    gridColumn: 2,
    gridRow: 3,
  },
  {
    step: "server-init",
    location: "server",
    icon: "⚙️",
    title: "Config 생성",
    subtitle: "최초 1회",
    gridColumn: 2,
    gridRow: 4,
  },
  {
    step: "server-routing",
    location: "server",
    icon: "🔍",
    title: "경로 매칭",
    subtitle: "레이아웃 + 페이지",
    gridColumn: 2,
    gridRow: 5,
    showArrowOnStep: "server-to-ssr",
    arrowDirection: "→",
  },
  {
    step: "ssr-render",
    location: "ssr",
    icon: "🖼️",
    title: "SSR 진행",
    subtitle: "HTML 생성",
    gridColumn: 3,
    gridRow: 6,
    showArrowOnStep: "ssr-to-server",
    arrowDirection: "←",
  },
  {
    step: "server-send",
    location: "server",
    icon: "📤",
    title: "응답 전송",
    subtitle: "HTML + JS",
    gridColumn: 2,
    gridRow: 7,
    showArrowOnStep: "server-to-client",
    arrowDirection: "←",
  },
  {
    step: "client-receive",
    location: "client",
    icon: "📄",
    title: "HTML 수신",
    subtitle: "초기 화면 표시",
    gridColumn: 1,
    gridRow: 8,
  },
  {
    step: "client-hydrate",
    location: "client",
    icon: "⚡",
    title: "하이드레이션",
    subtitle: "이벤트 연결",
    gridColumn: 1,
    gridRow: 9,
  },
  {
    step: "client-rsc-request",
    location: "client",
    icon: "📡",
    title: "RSC 요청",
    subtitle: "/__rsc",
    gridColumn: 1,
    gridRow: 10,
    showArrowOnStep: "client-to-server-rsc",
    arrowDirection: "→",
  },
  {
    step: "server-rsc-receive",
    location: "server",
    icon: "📬",
    title: "RSC 요청 수신",
    subtitle: "/__rsc",
    gridColumn: 2,
    gridRow: 11,
  },
  {
    step: "server-rsc-render",
    location: "server",
    icon: "🔧",
    title: "컴포넌트 렌더링",
    subtitle: "RSC Payload",
    gridColumn: 2,
    gridRow: 12,
  },
  {
    step: "server-rsc-send",
    location: "server",
    icon: "📤",
    title: "RSC 응답",
    subtitle: "Payload 전송",
    gridColumn: 2,
    gridRow: 13,
    showArrowOnStep: "server-to-client-rsc",
    arrowDirection: "←",
  },
  {
    step: "client-render",
    location: "client",
    icon: "🎭",
    title: "화면 업데이트",
    subtitle: "렌더링 완료",
    gridColumn: 1,
    gridRow: 14,
  },
];

const locationColors = {
  client: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  server: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    badge: "bg-purple-100 text-purple-700",
  },
  ssr: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    badge: "bg-orange-100 text-orange-700",
  },
};

const locationLabels = {
  client: "💻 Client",
  server: "🖥️ Server",
  ssr: "🎨 SSR",
};

export function TeulFlowVisualizer() {
  const [currentStep, setCurrentStep] = useState<Step>("idle");
  const [isPlaying, setIsPlaying] = useState(false);

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep("idle");
  };

  useEffect(() => {
    if (!isPlaying) return;

    const sequence = async () => {
      // 1. 클라이언트 요청 전송
      setCurrentStep("client-request");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. 클라이언트 → 서버 전송
      setCurrentStep("client-to-server");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 3. 서버 요청 수신
      setCurrentStep("server-receive");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 4. 서버 Config 생성 (최초 1회)
      setCurrentStep("server-init");
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 5. 경로 매칭 (레이아웃 + 페이지)
      setCurrentStep("server-routing");
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 6. 서버 → SSR 요청
      setCurrentStep("server-to-ssr");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 7. SSR 진행 (HTML 렌더링)
      setCurrentStep("ssr-render");
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // 8. SSR → 서버 응답
      setCurrentStep("ssr-to-server");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 9. 서버 응답 처리
      setCurrentStep("server-send");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 10. 서버 → 클라이언트 HTML 전송
      setCurrentStep("server-to-client");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 11. 클라이언트 HTML 수신
      setCurrentStep("client-receive");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 12. 클라이언트 하이드레이션
      setCurrentStep("client-hydrate");
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 13. 클라이언트 RSC 요청
      setCurrentStep("client-rsc-request");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 14. 클라이언트 → 서버 RSC 전송
      setCurrentStep("client-to-server-rsc");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 15. 서버 RSC 요청 수신
      setCurrentStep("server-rsc-receive");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 16. 서버 컴포넌트 렌더링 (RSC Payload 생성)
      setCurrentStep("server-rsc-render");
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // 17. 서버 RSC 응답 전송
      setCurrentStep("server-rsc-send");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 18. 서버 → 클라이언트 RSC 전송
      setCurrentStep("server-to-client-rsc");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 19. 클라이언트 렌더링
      setCurrentStep("client-render");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 20. 완료
      setCurrentStep("complete");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsPlaying(false);
    };

    sequence();
  }, [isPlaying]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
      {/* Mobile Timeline View */}
      <div className="block md:hidden space-y-3">
        {flowSteps.map((flowStep) => {
          const colors = locationColors[flowStep.location];
          const isActive = currentStep === flowStep.step;
          const showArrow =
            flowStep.showArrowOnStep &&
            currentStep === flowStep.showArrowOnStep;

          return (
            <div key={flowStep.step}>
              <div
                className={`p-3 rounded-lg border-2 transition-all duration-500 ${
                  isActive
                    ? `${colors.bg} ${colors.border} scale-105 shadow-lg`
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.badge}`}
                  >
                    {locationLabels[flowStep.location]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{flowStep.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-tight">
                      {flowStep.title}
                    </div>
                    <div className="text-xs text-slate-600 font-mono">
                      {flowStep.subtitle}
                    </div>
                  </div>
                </div>
              </div>
              {showArrow && (
                <div className="text-center py-2 text-2xl text-blue-500 animate-pulse">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop 3-Column Grid Layout */}
      <div
        className="hidden md:grid grid-cols-3 gap-4 mb-8 relative"
        style={{ gridAutoRows: "minmax(50px, auto)" }}
      >
        {/* Headers - Row 1 */}
        <div
          className="p-2 rounded-lg border-2 text-center font-bold text-sm bg-blue-100 border-blue-400 flex items-center justify-center"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          💻 Client
        </div>
        <div
          className="p-2 rounded-lg border-2 text-center font-bold text-sm bg-purple-100 border-purple-400 flex items-center justify-center"
          style={{ gridColumn: 2, gridRow: 1 }}
        >
          🖥️ Server
        </div>
        <div
          className="p-2 rounded-lg border-2 text-center font-bold text-sm bg-orange-100 border-orange-400 flex items-center justify-center"
          style={{ gridColumn: 3, gridRow: 1 }}
        >
          🎨 SSR
        </div>

        {/* Render all flow steps */}
        {flowSteps.map((flowStep) => {
          const colors = locationColors[flowStep.location];
          const isActive = currentStep === flowStep.step;
          const showArrow =
            flowStep.showArrowOnStep &&
            currentStep === flowStep.showArrowOnStep;

          return (
            <div
              key={flowStep.step}
              className={`py-2 px-3 rounded-lg border-2 transition-all duration-500 relative ${
                isActive
                  ? `${colors.bg} ${colors.border} scale-105 shadow-lg`
                  : "bg-white border-slate-200"
              }`}
              style={{
                gridColumn: flowStep.gridColumn,
                gridRow: flowStep.gridRow,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">{flowStep.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">
                    {flowStep.title}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {flowStep.subtitle}
                  </div>
                </div>
              </div>
              {showArrow && (
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-xl text-blue-500 animate-pulse z-10">
                  {flowStep.arrowDirection}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete Message */}
      {currentStep === "complete" && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-lg text-center   mt-4">
          <div className="text-3xl md:text-4xl mb-2">✅</div>
          <div className="text-base md:text-lg font-bold text-emerald-700">
            전체 플로우 완료!
          </div>
        </div>
      )}

      {/* Control Button */}
      <div className="text-center mt-6">
        <button
          onClick={startAnimation}
          disabled={isPlaying}
          className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
            isPlaying
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105"
          }`}
        >
          {isPlaying ? "애니메이션 진행 중..." : "▶ 흐름 보기"}
        </button>
      </div>
    </div>
  );
}
