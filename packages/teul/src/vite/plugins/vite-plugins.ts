/**
 * Teul Vite 플러그인 통합 (Combined Plugins)
 *
 * Teul 프레임워크의 모든 Vite 플러그인을 결합하고 통합하는 메인 엔트리 포인트입니다.
 *
 * 플러그인 구성 순서:
 * 1. extraPlugins - 사용자 정의 플러그인 및 React 플러그인
 * 2. allowServerPlugin - "use client" DCE 처리 (RSC 변환 전에 적용)
 * 3. @vitejs/plugin-rsc - React Server Components 핵심 플러그인
 * 4. mainPlugin - 환경별 설정 및 서버 구성
 * 5. userEntriesPlugin - 사용자 entry 파일 매핑
 * 6. virtualConfigPlugin - 설정 값을 virtual 모듈로 노출
 * 7. patchWebpackPlugin - Webpack 호환성 패치
 * 8. handleBuildPlugin - 빌드 후처리
 * 9. fallbackHtmlPlugin - HTML 템플릿 처리
 *
 * @example
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import teul from 'teul/vite';
 *
 * export default defineConfig({
 *   plugins: [teul()]
 * });
 */

import rsc from "@vitejs/plugin-rsc";
import type { PluginOption } from "vite";
import { type ResolvedTeulConfig, type TeulConfig } from "../../config.js";
import { allowServerPlugin } from "./allow-server.js";
import { cloudflarePlugin } from "./cloudflare.js";
import { defaultAdapterPlugin } from "./default-adapter.js";
import { extraPlugins } from "./extra-plugins.js";
import { fallbackHtmlPlugin } from "./fallback-html.js";
import { handleBuildPlugin } from "./handle-build.js";
import { mainPlugin } from "./main.js";
import { patchWebpackPlugin } from "./patch-webpack.js";
import { userEntriesPlugin } from "./user-entries.js";
import { virtualConfigPlugin } from "./virtual-config.js";
import { fsRouterTypegenPlugin } from "./fs-router-typegen.js";

export type Flags = {};

export type RscPluginOptions = {
  flags?: Flags;
  config: Required<TeulConfig>;
};

/**
 * Teul Vite 플러그인
 *
 * React Server Components를 Vite에서 사용할 수 있도록 하는 통합 플러그인입니다.
 */
export function combinedPlugins(config: ResolvedTeulConfig): PluginOption {
  return [
    // 사용자 정의 플러그인 및 React 플러그인
    extraPlugins(config),
    // "use client" 처리 (DCE 적용)
    allowServerPlugin(),
    cloudflarePlugin(),
    // React Server Components 핵심 플러그인
    rsc({
      serverHandler: false,
      keepUseCientProxy: true,
      useBuildAppHook: true,
      clientChunks: (meta) => meta.serverChunk,
    }),
    // 메인 설정 플러그인
    mainPlugin(config),
    // 사용자 entry 파일 매핑
    userEntriesPlugin(config),
    // 설정 값을 virtual 모듈로 노출
    ...virtualConfigPlugin(config),
    defaultAdapterPlugin(config),
    // Webpack 호환성 패치
    patchWebpackPlugin(),
    // 빌드 후처리
    handleBuildPlugin(config),
    // HTML 템플릿 처리
    fallbackHtmlPlugin(),
    fsRouterTypegenPlugin(config),
  ];
}
