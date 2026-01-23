/**
 * Fallback HTML 플러그인
 *
 * index.html 파일을 처리하고 fallback HTML을 제공하는 플러그인입니다.
 * - 개발 모드: index.html이 존재하면 해당 파일을 사용, 없으면 기본 템플릿 제공
 * - 빌드 모드: 클라이언트 빌드의 index.html을 SSR 환경에서 사용
 *
 * React Server Components는 전체 페이지를 동적으로 렌더링하지만,
 * 초기 HTML 셸이 필요한 경우가 있습니다. 이 플러그인이 그 역할을 합니다.
 *
 * @example
 * // 프로젝트 루트에 index.html이 있으면:
 * // - 개발: 해당 파일 사용 (HMR 적용)
 * // - 빌드: 클라이언트 번들과 함께 빌드
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

export function fallbackHtmlPlugin(): Plugin {
  let server: ViteDevServer | undefined;

  return {
    name: "teul:fallback-html",
    config() {
      return {
        environments: {
          client: {
            build: {
              rollupOptions: {
                input: {
                  indexHtml: "index.html",
                },
              },
            },
          },
        },
      };
    },
    configureServer(server_) {
      server = server_;
    },
    async resolveId(source, _importer, _options) {
      if (source === "index.html") {
        // 이 resolve는 Vite가 실제 index.html 파일을 찾지 못했을 때만 호출됩니다.
        // 출력 파일로 index.html을 유지하기 위해 정확히 같은 이름을 사용합니다.
        assert(this.environment.name === "client");
        assert(this.environment.mode === "build");
        return source;
      }
      if (source === "virtual:vite-rsc-teul/fallback-html") {
        assert(this.environment.name === "ssr");
        return { id: "\0" + source, moduleSideEffects: true };
      }
    },
    async load(id) {
      if (id === "index.html") {
        return `<html><body></body></html>`;
      }
      if (id === "\0virtual:vite-rsc-teul/fallback-html") {
        let html = `<html><body></body></html>`;
        if (this.environment.mode === "dev") {
          if (fs.existsSync("index.html")) {
            // 파일 변경 감지를 위해 watch에 추가
            this.addWatchFile(path.resolve("index.html"));
            html = fs.readFileSync("index.html", "utf-8");
            html = await server!.transformIndexHtml("/", html);
          }
        } else {
          // 빌드 스캔 중에는 건너뛰기
          if (this.environment.config.build.write) {
            const config = this.environment.getTopLevelConfig();
            const file = path.join(
              config.environments.client!.build.outDir,
              "index.html",
            );
            html = fs.readFileSync(file, "utf-8");
            // 기본 미리보기 서버가 제공하지 않도록 빌드에서 index.html 제거
            fs.rmSync(file);
          }
        }
        return `export default ${JSON.stringify(html)};`;
      }
    },
  };
}
