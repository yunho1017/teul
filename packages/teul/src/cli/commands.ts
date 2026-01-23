import type { TeulConfig } from "../config.js";
import { mergeConfig } from "../config.js";
import { logger } from "../utils/logger.js";

/**
 * dev 명령어 - 개발 서버 시작
 */
export async function devCommand(config: TeulConfig) {
  const fullConfig = mergeConfig(config);
  logger.info("Starting development server...");

  // Vite 서버 동적 import
  const { startDevServer } = await import("../vite/server.js");
  await startDevServer(fullConfig);
}

/**
 * build 명령어 - 프로덕션 빌드
 */
export async function buildCommand(config: TeulConfig) {
  const fullConfig = mergeConfig(config);
  logger.info("Building for production...");

  // Set NODE_ENV to production
  process.env.NODE_ENV = "production";

  // Dynamic import vite
  const vite = await import("vite");
  const { combinedPlugins: rscPlugin } =
    await import("../vite/plugins/vite-plugins.js");

  // Create builder with RSC plugin
  const builder = await vite.createBuilder({
    configFile: false,
    plugins: [rscPlugin({ config: fullConfig })],
  });

  // Build all environments (client, ssr, rsc)
  await builder.buildApp();

  logger.success("Build completed!");
}

/**
 * start 명령어 - 프로덕션 서버 시작
 */
export async function startCommand(config: TeulConfig) {
  const fullConfig = mergeConfig(config);
  logger.info("Starting production server...");

  // Set NODE_ENV to production
  process.env.NODE_ENV = "production";

  // Import the built server entry
  const path = await import("node:path");
  const { pathToFileURL } = await import("node:url");

  const serverEntryPath = path.join(
    process.cwd(),
    fullConfig.distDir,
    "server",
    "index.js",
  );

  logger.info(`Loading server from: ${serverEntryPath}`);

  const entry = await import(pathToFileURL(serverEntryPath).href);

  // Start the server with @hono/node-server
  const { serve } = await import("@hono/node-server");

  serve(
    {
      fetch: entry.default,
      port: fullConfig.port,
    },
    (info) => {
      logger.success(`Server running at http://localhost:${info.port}`);
    },
  );
}
