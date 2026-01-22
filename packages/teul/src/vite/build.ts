import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import type { ResolvedConfig as ViteConfig } from "vite";
import { createRenderUtils } from "./utils/render.js";
import { encodeRscPath, joinPath } from "../utils/path.js";
import serverEntry from "virtual:vite-rsc-teul/server-entry";
import type { TeulConfig } from "../config.js";
import { loadSsrEntryModule } from "./utils/vite.js";

export async function processBuild(
  viteConfig: Pick<ViteConfig, "root">,
  config: Pick<Required<TeulConfig>, "distDir" | "rscBase" | "rscExtension">,
  emitStaticFile: (
    rootDir: string,
    config: Pick<Required<TeulConfig>, "distDir">,
    pathname: string,
    bodyPromise: Promise<ReadableStream | string>,
  ) => void,
) {
  const renderUtils = createRenderUtils(
    undefined,
    renderToReadableStream,
    loadSsrEntryModule,
  );

  let fallbackHtml: string | undefined;
  const getFallbackHtml = async (): Promise<ReadableStream | string> => {
    if (!fallbackHtml) {
      const ssrEntryModule = await loadSsrEntryModule();
      fallbackHtml = await ssrEntryModule.renderHtmlFallback();
    }
    return fallbackHtml!;
  };

  await serverEntry.handleBuild({
    renderRsc: renderUtils.renderRsc,
    renderHtml: renderUtils.renderHtml,
    rscPath2pathname: (rscPath) =>
      joinPath(config.rscBase, encodeRscPath(rscPath, config.rscExtension)),
    generateFile: async (
      pathname: string,
      body: Promise<ReadableStream | string>,
    ) => {
      emitStaticFile(
        viteConfig.root,
        { distDir: config.distDir },
        pathname,
        body,
      );
    },
    generateDefaultHtml: async (pathname: string) => {
      emitStaticFile(
        viteConfig.root,
        { distDir: config.distDir },
        pathname,
        getFallbackHtml(),
      );
    },
  });
}
