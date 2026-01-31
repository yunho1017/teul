/**
 * Virtual Config 플러그인
 *
 * Teul 설정 값들을 가상 모듈(virtual module)로 노출하는 플러그인입니다.
 * 런타임에서 설정 값에 접근할 수 있도록 합니다.
 *
 * 제공하는 가상 모듈:
 * - virtual:vite-rsc-teul/config: 전체 Teul 설정 및 플래그
 * - virtual:vite-rsc-teul/rsc-config: RSC 관련 설정 (base, extension)
 *
 * @example
 * // 코드에서 설정 값 사용
 * import { config } from 'virtual:vite-rsc-teul/config';
 * import { RSC_BASE } from 'virtual:vite-rsc-teul/rsc-config';
 */

import type { Plugin } from "vite";
import type { ResolvedTeulConfig } from "../../config.js";

export function virtualConfigPlugin(config: ResolvedTeulConfig): Plugin[] {
  return [
    // Teul 전체 설정을 virtual 모듈로 노출
    createVirtualPlugin("vite-rsc-teul/config", async function () {
      return `
        export const config = ${JSON.stringify({ ...config, vite: undefined })};
        export const isBuild = ${JSON.stringify(
          this.environment.mode === "build",
        )};
      `;
    }),
    // RSC 관련 설정을 virtual 모듈로 노출
    createVirtualPlugin("vite-rsc-teul/rsc-config", async function () {
      return `
        export const RSC_BASE = ${JSON.stringify(config.rscBase)};
        export const RSC_EXTENSION = ${JSON.stringify(config.rscExtension)};
      `;
    }),
  ];
}

// 동적 값을 가상 모듈로 매핑하는 헬퍼 함수
function createVirtualPlugin(name: string, load: Plugin["load"]) {
  name = "virtual:" + name;
  return {
    name: `teul:virtual-${name}`,
    resolveId(source, _importer, _options) {
      return source === name ? "\0" + name : undefined;
    },
    load(id, options) {
      if (id === "\0" + name) {
        return (load as any).apply(this, [id, options]);
      }
    },
  } satisfies Plugin;
}
