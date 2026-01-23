/**
 * User Entries 플러그인
 *
 * 사용자 정의 entry 파일들을 가상 모듈(virtual module)로 매핑하는 플러그인입니다.
 * - server-entry: 서버 측 진입점 (기본값: src/server-entry.tsx)
 * - client-entry: 클라이언트 측 진입점 (기본값: src/client-entry.tsx)
 *
 * 사용자가 해당 파일을 제공하지 않으면 "managed mode"의 기본 진입점으로 대체됩니다.
 *
 * @example
 * // src/server-entry.tsx
 * export default function ServerEntry() {
 *   return <App />
 * }
 */

import type { Plugin } from "vite";
import type { TeulConfig } from "../../config.js";
import {
  getManagedClientEntry,
  getManagedServerEntry,
  SRC_CLIENT_ENTRY,
  SRC_SERVER_ENTRY,
} from "../constants.js";

export function userEntriesPlugin(
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">,
): Plugin {
  return {
    name: "rsc:teul:user-entries",
    // 사용자 entry 파일 해석 및 없을 경우 "managed mode" fallback 제공
    async resolveId(source, _importer, options) {
      if (source === "virtual:vite-rsc-teul/server-entry") {
        return `\0` + source;
      }
      if (source === "virtual:vite-rsc-teul/server-entry-inner") {
        const resolved = await this.resolve(
          `/${config.srcDir}/${SRC_SERVER_ENTRY}`,
          undefined,
          options,
        );
        return resolved ? resolved : "\0" + source;
      }
      if (source === "virtual:vite-rsc-teul/client-entry") {
        const resolved = await this.resolve(
          `/${config.srcDir}/${SRC_CLIENT_ENTRY}`,
          undefined,
          options,
        );
        return resolved ? resolved : "\0" + source;
      }
    },
    load(id) {
      if (id === "\0virtual:vite-rsc-teul/server-entry") {
        return `\
export { default } from 'virtual:vite-rsc-teul/server-entry-inner';
if (import.meta.hot) {
  import.meta.hot.accept()
}
`;
      }
      if (id === "\0virtual:vite-rsc-teul/server-entry-inner") {
        return getManagedServerEntry(config);
      }
      if (id === "\0virtual:vite-rsc-teul/client-entry") {
        return getManagedClientEntry();
      }
    },
  };
}
