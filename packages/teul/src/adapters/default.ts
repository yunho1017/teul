/**
 * 실제로 사용되지 않고 빌드 과정에서 갈아끼워짐
 * @see packages/teul/src/vite/plugins/default-adapter.ts
 */
import type { ImportGlobFunction } from "vite/types/importGlob.d.ts";
import cloudflareAdapter from "./cloudflare.js";
import nodeAdapter from "./node.js";

declare global {
  interface ImportMeta {
    glob: ImportGlobFunction;
  }
}

export default process.env.CLOUDFLARE || process.env.WORKERS_CI
  ? cloudflareAdapter
  : nodeAdapter;
