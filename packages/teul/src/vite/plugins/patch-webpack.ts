/**
 * Patch Webpack 플러그인
 *
 * react-server-dom-webpack/client 모듈을 Vite 환경에서 사용 가능하도록 변환하는 플러그인입니다.
 * @vitejs/plugin-rsc의 브라우저 모듈로 리다이렉트합니다.
 *
 * React Server Components는 원래 Webpack을 위해 설계되었지만,
 * 이 플러그인을 통해 Vite 환경에서도 동작할 수 있도록 합니다.
 *
 * @example
 * // 클라이언트 코드에서
 * import { createFromFetch } from 'react-server-dom-webpack/client';
 * // → @vitejs/plugin-rsc/browser로 자동 변환
 */

import type { Plugin } from "vite";

export function patchWebpackPlugin(): Plugin {
  return {
    // server-dom-webpack/client을 vite 플러그인으로 대체
    name: "rsc:teul:patch-webpack",
    enforce: "pre",
    resolveId(source, _importer, _options) {
      if (source === "react-server-dom-webpack/client") {
        return "\0" + source;
      }
    },
    load(id) {
      if (id === "\0react-server-dom-webpack/client") {
        if (this.environment.name === "client") {
          return `
            export * from ${JSON.stringify(
              import.meta.resolve("@vitejs/plugin-rsc/browser"),
            )};
            import * as ReactClient from ${JSON.stringify(
              import.meta.resolve("@vitejs/plugin-rsc/browser"),
            )};
            export default ReactClient;
          `;
        }
        return `export default {}`;
      }
    },
  };
}
