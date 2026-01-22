/// <reference types="vite/client" />
// Server Entry (Teul - Hono 래퍼)
import { serveStatic } from "@hono/node-server/serve-static";
import { decodeReply, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import { Hono } from "hono";
import { config } from "virtual:vite-rsc-teul/config";
import serverEntry from "virtual:vite-rsc-teul/server-entry";
import type { HandleRequest } from "../../types.js";
import { createRenderUtils } from "../utils/render.js";
import { getInput } from "../utils/request.js";
import { stringToStream } from "../utils/stream.js";
import { loadSsrEntryModule } from "../utils/vite.js";

type HandleRequestOutput = Awaited<ReturnType<HandleRequest>>;

function createApp(app: Hono) {
  // Static file serving (for production)
  if (import.meta.env.PROD) {
    app.use("/assets/*", serveStatic({ root: "./dist/public" }));
  }

  // All routes go to serverEntry (RSC Request Handler)
  app.use("*", async (ctx) => {
    console.log(
      "[entry.server] Incoming request:",
      ctx.req.method,
      ctx.req.url,
    );

    const { input, temporaryReferences } = await getInput(
      { req: ctx.req.raw },
      config,
      decodeReply,
    );

    console.log("[entry.server] input.type:", input.type);
    if (input.type === "component") {
      console.log("[entry.server] input.rscPath:", input.rscPath);
    }

    const renderUtils = createRenderUtils(
      temporaryReferences,
      renderToReadableStream,
      loadSsrEntryModule,
    );

    let res: HandleRequestOutput;
    try {
      res = await serverEntry.handleRequest(input, renderUtils);
    } catch (e) {
      console.error("[entry.server] Error handling request:", e);
      console.error(
        "[entry.server] Stack:",
        e instanceof Error ? e.stack : "No stack",
      );
      const status = 500;
      const body = stringToStream(
        (e as { message?: string } | undefined)?.message || String(e),
      );
      const headers: { location?: string } = {};

      ctx.res = new Response(body, { status, headers });
    }

    if (res instanceof ReadableStream) {
      ctx.res = new Response(res);
    } else if (res && res !== "fallback") {
      ctx.res = res;
    }

    const url = new URL(ctx.req.url);
    if (res === "fallback" || (!ctx.res && url.pathname === "/")) {
      const { renderHtmlFallback } = await loadSsrEntryModule();
      const htmlFallbackStream = await renderHtmlFallback();
      const headers = { "content-type": "text/html; charset=utf-8" };
      ctx.res = new Response(htmlFallbackStream, { headers });
    }
  });

  app.notFound((c) => {
    return c.text("404 Not Found", 404);
  });

  return app;
}

const app = createApp(new Hono());

export default app.fetch;

// Build-time exports
export { processBuild } from "../build.js";
