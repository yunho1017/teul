// 공통 상수 정의
export const DIST_PUBLIC = "public";
export const SRC_CLIENT_ENTRY = "client";
export const SRC_SERVER_ENTRY = "server";
export const DEFAULT_PORT = 3000;

import type { TeulConfig } from "../config.js";
import type { fsRouter } from "../server/router/fs-router.js";

const EXTENSIONS = [".js", ".ts", ".tsx", ".jsx", ".mjs", ".cjs"];

export const getManagedServerEntry = (
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">,
) => {
  const globBase = `/${config.srcDir}/${config.pagesDir}/`;
  const globPattern = `${globBase}**/*.{${EXTENSIONS.map((ext) =>
    ext.slice(1),
  ).join(",")}}`;
  const fsRouterOptions: Parameters<typeof fsRouter>[1] = {};
  return `
import { fsRouter } from 'teul/router/server';
const glob = import.meta.glob(${JSON.stringify(
    globPattern,
  )}, { base: ${JSON.stringify(globBase)} });
export default fsRouter(glob, ${JSON.stringify(fsRouterOptions)});
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
