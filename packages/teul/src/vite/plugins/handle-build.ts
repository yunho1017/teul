/**
 * Handle Build 플러그인
 *
 * Vite 빌드가 완료된 후 추가 작업을 처리하는 플러그인입니다.
 * - 서버 엔트리 모듈을 import하여 processBuild 함수 실행
 * - 정적 파일 생성 및 빌드 후처리 작업 수행
 *
 * buildApp 훅을 사용하여 Vite가 모든 환경(client, ssr, rsc)을 빌드한 후
 * 서버 엔트리의 로직을 실행합니다.
 *
 * @example
 * // 빌드 프로세스:
 * // 1. Vite가 client, ssr, rsc 빌드
 * // 2. 이 플러그인이 서버 엔트리 import
 * // 3. processBuild 실행으로 정적 파일 생성
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Plugin } from "vite";
import type { TeulConfig } from "../../config.js";
import { emitStaticFile, waitForTasks } from "../../utils/builder/build.js";

export function handleBuildPlugin(
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">,
): Plugin {
  return {
    name: "rsc:teul:handle-build",
    buildApp: {
      async handler(builder) {
        // 서버 엔트리 import
        const viteConfig = builder.config;
        const entryPath = path.join(
          viteConfig.environments.rsc!.build.outDir,
          "index.js",
        );
        console.log("[teul] Starting processBuild...");
        const entry: typeof import("../entries/entry.server.js") =
          await import(pathToFileURL(entryPath).href);
        await entry.processBuild(viteConfig, config, emitStaticFile);
        await waitForTasks();

        console.log("[teul] Build complete!");
      },
    },
  };
}
