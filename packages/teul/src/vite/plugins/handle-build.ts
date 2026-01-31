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

import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { joinPath } from "../../utils/path.js";
import fs from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createProgressLogger, logger } from "../../utils/logger.js";
import pc from "picocolors";

export function handleBuildPlugin({
  distDir,
}: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">): Plugin {
  return {
    name: "rsc:teul:handle-build",
    buildApp: {
      async handler(builder) {
        const progress = createProgressLogger();
        const rootDir = process.cwd();
        const viteConfig = builder.config;
        const entryPath = path.join(
          viteConfig.environments.rsc!.build.outDir,
          "build.js",
        );

        const emitFile = async (
          filePath: string,
          body: ReadableStream | string,
        ) => {
          const destFile = joinPath(rootDir, distDir, filePath);
          if (!destFile.startsWith(rootDir)) {
            throw new Error("Invalid filePath: " + filePath);
          }
          // In partial mode, skip if the file already exists.
          if (fs.existsSync(destFile)) {
            return;
          }
          progress.update(`파일 생성 중 ${pc.dim(filePath)}`);
          await mkdir(joinPath(destFile, ".."), { recursive: true });
          if (typeof body === "string") {
            await writeFile(destFile, body);
          } else {
            await pipeline(
              Readable.fromWeb(body as never),
              fs.createWriteStream(destFile),
            );
          }
        };
        logger.info("[ssg] 정적 파일 생성 중...");
        const startTime = performance.now();
        const entry: typeof import("../entries/entry.build.js") = await import(
          pathToFileURL(entryPath).href
        );
        await entry.runBuild({ rootDir, emitFile });
        progress.done();
        const fileCount = progress.getCount();
        logger.success(
          `${fileCount}개의 파일이 ${Math.ceil(performance.now() - startTime)}ms 만에 생성되었습니다`,
        );
      },
    },
  };
}
