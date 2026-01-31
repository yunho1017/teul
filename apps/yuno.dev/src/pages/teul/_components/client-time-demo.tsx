"use client";

import { useEffect, useState } from "react";

// Client Component - 브라우저에서 실행됩니다
export function ClientTimeDemo() {
  const [clientTime, setClientTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setClientTime(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-green-600 font-mono transition-all">
        {clientTime || "00:00:00"}
      </div>
      <p className="text-sm text-slate-600 mt-2">
        브라우저에서 1초마다 업데이트됩니다
      </p>
    </div>
  );
}
