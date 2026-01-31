"use client";

import { TypeAnimation } from "react-type-animation";

export const HeroTitle = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
        안녕하세요 👋
      </h1>
      <p className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
        <span>프론트엔드 개발자</span>
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          <TypeAnimation
            sequence={["서윤호", 2000, "Yuno", 2000]}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            style={{ display: "inline-block" }}
          />
        </span>
        <span>입니다</span>
      </p>
    </div>
  );
};
