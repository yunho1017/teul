// 공통 상수 정의
export const DIST_PUBLIC = "public";
export const BASE_PATH = "/";
export const SRC_CLIENT_ENTRY = "client";
export const SRC_SERVER_ENTRY = "server";
export const DEFAULT_PORT = 3000;

import type { ResolvedTeulConfig } from "../config.js";
import type { fsRouter } from "../server/router/fs-router.js";

export const EXTENSIONS = [".js", ".ts", ".tsx", ".jsx", ".mjs", ".cjs"];

export const getManagedServerEntry = (config: ResolvedTeulConfig) => {
  const globBase = `/${config.srcDir}/${config.pagesDir}/`;
  const globPattern = `${globBase}**/*.{${EXTENSIONS.map((ext) =>
    ext.slice(1),
  ).join(",")}}`;
  const fsRouterOptions: Parameters<typeof fsRouter>[1] = {
    ignoredPaths: config.ignoredFilePath,
  };
  return `
import { fsRouter } from 'teul/router/server';
import adapter from 'teul/adapters/default';
const glob = import.meta.glob(${JSON.stringify(
    globPattern,
  )}, { base: ${JSON.stringify(globBase)} });
export default adapter(fsRouter(glob, ${JSON.stringify(fsRouterOptions)}));
`;
};

export const getManagedClientEntry = () => {
  return `
import { StrictMode, createElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Router } from 'teul/router/client';

const rootElement = createElement(StrictMode, null, createElement(Router));

if (globalThis.__TEUL_HYDRATE__) {
  hydrateRoot(document, rootElement);
} else {
  createRoot(document).render(rootElement);
}
`;
};
