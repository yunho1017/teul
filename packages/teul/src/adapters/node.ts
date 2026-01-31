import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { constants, createServerEntryAdapter } from "teul/internals";
import type { BuildOptions } from "./node-build-enhancer.js";
import { rscMiddleware } from "../utils/hono.js";

const { DIST_PUBLIC, BASE_PATH } = constants;

export default createServerEntryAdapter(
  ({ processRequest, processBuild, config, isBuild, notFoundHtml }) => {
    const app = new Hono();

    app.notFound((c) => {
      return c.text(notFoundHtml, 404);
    });

    if (isBuild) {
      app.use(
        `${BASE_PATH}*`,
        serveStatic({
          root: path.join(config.distDir, DIST_PUBLIC),
          rewriteRequestPath: (path) => path.slice(BASE_PATH.length - 1),
        }),
      );
    }

    app.use(
      "/assets/*",
      serveStatic({ root: path.join(config.distDir, DIST_PUBLIC) }),
    );

    app.use(rscMiddleware({ processRequest }));

    const buildOptions: BuildOptions = {
      distDir: config.distDir,
    };
    return {
      fetch: app.fetch,
      build: processBuild,
      buildOptions,
      buildEnhancers: ["teul/adapters/node-build-enhancer"],
      serve,
    };
  },
);
