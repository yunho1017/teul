import { defineConfig } from "teul/config";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// @vitejs/plugin-rsc 의 `rsc:patch-react-server-dom-webpack` 트랜스폼은 id 필터 없이
// 모든 모듈 코드에 대고 무조건 문자열 치환을 한다:
//   __webpack_require__.u → ({}).u
//   __webpack_require__   → __vite_rsc_require__
// 게시글 .md 를 ?raw 로 불러오면 글 전체가 `export default "..."` JS 문자열 리터럴이 되는데,
// 그 안에 든 코드 예제의 __webpack_require__ 까지 같이 치환돼 본문이 깨진다.
//
// plugin-rsc 의 치환은 normal-order transform 이므로, enforce:"pre" 로 먼저 돌면서
// .md?raw 모듈 안의 토큰을 \x5f(=_) 이스케이프로 숨겨 치환을 우회시킨다.
// JS 문자열 리터럴 안에서 `\x5f` 는 `_` 로 파싱되므로 런타임 값은 완전히 동일하다.
function preserveWebpackTokenInMarkdown(): Plugin {
  return {
    name: "teul:preserve-webpack-token-in-md",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/content/posts/") || !id.includes(".md")) return;
      if (!code.includes("__webpack_require__")) return;
      return {
        code: code.replaceAll(
          "__webpack_require__",
          "\\x5f\\x5fwebpack_require\\x5f\\x5f",
        ),
        map: null,
      };
    },
  };
}

export default defineConfig({
  pagesDir: "pages",
  vite: {
    plugins: [preserveWebpackTokenInMarkdown(), tailwindcss()],
    // .md를 asset으로 취급해 HMR 시 JS로 파싱하려다 깨지는 문제 방지
    // (import.meta.glob의 ?raw 쿼리는 그대로 동작)
    assetsInclude: ["**/*.md"],
  },
});
