/**
 * Extra Plugins 플러그인
 *
 * 사용자가 설정한 추가 플러그인들을 처리합니다.
 * React 플러그인이 명시적으로 포함되지 않은 경우 자동으로 추가합니다.
 *
 * @example
 * // vite.config.ts
 * export default defineConfig({
 *   plugins: [
 *     teul({
 *       vite: {
 *         plugins: [
 *           // 사용자 정의 플러그인들
 *         ]
 *       }
 *     })
 *   ]
 * })
 */

import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import type { TeulConfig } from "../../config.js";

export function extraPlugins(
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">,
): PluginOption {
  const plugins = [...(config.vite?.plugins ?? [])];

  // 사용자가 React 플러그인을 명시하지 않았다면 자동으로 추가
  // (예: swc, oxc, babel react compiler 등을 사용하는 경우는 제외)
  if (
    !plugins
      .flat()
      .some((p) => p && "name" in p && p.name.startsWith("vite:react"))
  ) {
    plugins.push(react());
  }

  return plugins;
}
