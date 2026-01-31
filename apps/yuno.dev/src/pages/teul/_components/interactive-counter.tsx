"use client";

import { useState } from "react";

// Client Component - 인터랙티브한 기능을 제공합니다
export function InteractiveCounter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 bg-emerald-100 border-2 border-emerald-300 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎮</span>
        <h3 className="text-lg font-bold text-emerald-900">
          인터랙티브 카운터
        </h3>
      </div>
      <div className="text-center mb-4">
        <div className="text-6xl font-bold text-emerald-800 mb-4">{count}</div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setCount(count - 1)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            감소
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            리셋
          </button>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            증가
          </button>
        </div>
      </div>
      <div className="text-sm text-emerald-700 leading-relaxed">
        ✨ 이 카운터는 Client Component에서만 작동합니다.
        <br />
        useState와 이벤트 핸들러는 클라이언트에서만 사용 가능합니다.
      </div>
    </div>
  );
}
