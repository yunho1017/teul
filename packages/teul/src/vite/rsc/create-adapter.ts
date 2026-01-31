import {
  createTemporaryReferenceSet,
  decodeReply,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { config, isBuild } from "virtual:vite-rsc-teul/config";
import type {
  CreateServerEntryAdapter,
  HandleBuild,
  HandleRequest,
  ProcessBuild,
  ProcessRequest,
} from "../../types.js";
import { encodeRscPath, joinPath } from "../../utils/path.js";

import { createRenderUtils } from "../utils/render.js";
import { getInput } from "../utils/request.js";
import { stringToStream } from "../utils/stream.js";
import { loadSsrEntryModule } from "../utils/vite.js";
import { DIST_PUBLIC } from "../constants.js";
import { logger } from "../../utils/logger.js";

const toProcessRequest =
  (handleRequest: HandleRequest): ProcessRequest =>
  async (req) => {
    const temporaryReferences = createTemporaryReferenceSet();
    const { input } = await getInput(
      req,
      config,
      temporaryReferences,
      decodeReply,
    );

    const renderUtils = createRenderUtils(
      temporaryReferences,
      renderToReadableStream,
      loadSsrEntryModule,
    );

    let res: Awaited<ReturnType<typeof handleRequest>>;
    try {
      res = await handleRequest(input, renderUtils);
    } catch (e) {
      logger.error("[entry.server] Error handling request:", e);
      logger.error(
        "[entry.server] Stack:",
        e instanceof Error ? e.stack : "No stack",
      );
      const status = 500;
      const body = stringToStream(
        (e as { message?: string } | undefined)?.message || String(e),
      );
      const headers: { location?: string } = {};

      return new Response(body, { status, headers });
    }

    if (res instanceof ReadableStream) {
      return new Response(res);
    } else if (res && res !== "fallback") {
      return res;
    }

    const url = new URL(req.url);
    if (res === "fallback" || (!res && url.pathname === "/")) {
      const { renderHtmlFallback } = await loadSsrEntryModule();
      const htmlFallbackStream = await renderHtmlFallback();
      const headers = { "content-type": "text/html; charset=utf-8" };
      return new Response(htmlFallbackStream, { headers });
    }

    return null;
  };

const toProcessBuild =
  (handleBuild: HandleBuild): ProcessBuild =>
  async ({ emitFile }) => {
    const temporaryReferences = createTemporaryReferenceSet();

    const renderUtils = createRenderUtils(
      temporaryReferences,
      renderToReadableStream,
      loadSsrEntryModule,
    );

    let fallbackHtml: string | undefined;
    const getFallbackHtml = async () => {
      if (!fallbackHtml) {
        const ssrEntryModule = await loadSsrEntryModule();
        fallbackHtml = await ssrEntryModule.renderHtmlFallback();
      }
      return fallbackHtml;
    };

    await handleBuild({
      renderRsc: renderUtils.renderRsc,
      renderHtml: renderUtils.renderHtml,
      rscPath2pathname: (rscPath) =>
        joinPath(config.rscBase, encodeRscPath(rscPath, config.rscExtension)),
      generateFile: async (pathname: string, body: ReadableStream | string) => {
        await emitFile(joinPath(DIST_PUBLIC, pathname), body);
      },
      generateDefaultHtml: async (fileName) => {
        await emitFile(
          joinPath(DIST_PUBLIC, fileName),
          await getFallbackHtml(),
        );
      },
    });
  };

export const createServerEntryAdapter: CreateServerEntryAdapter =
  (fn) => (handlers, options) => {
    const processRequest = toProcessRequest(handlers.handleRequest);
    const processBuild = toProcessBuild(handlers.handleBuild);
    return fn(
      {
        handlers,
        processRequest,
        processBuild,
        config,
        isBuild,
        notFoundHtml: "404 Not Found",
      },
      options,
    );
  };
