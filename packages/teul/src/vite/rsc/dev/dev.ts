import { existsSync } from "node:fs";
import path from "node:path";
import * as vite from "vite";
import {
  resolveConfig,
  type ResolvedTeulConfig,
  type TeulConfig,
} from "../../../config.js";
import { handleServerRestart } from "./restart.js";
import loadEnv from "../../../utils/env.js";
import { combinedPlugins } from "../../plugins/vite-plugins.js";
import { logger } from "../../../utils/logger.js";

export async function loadConfig(): Promise<ResolvedTeulConfig> {
  let config: TeulConfig | undefined;
  if (existsSync("teul.config.ts") || existsSync("teul.config.js")) {
    const imported = await vite.runnerImport<{ default: TeulConfig }>(
      "/teul.config",
    );
    config = imported.module.default;
  }
  return resolveConfig(config);
}

export async function startDevServer(
  host: string | undefined,
  port: number,
  config: ResolvedTeulConfig,
  isRestart?: boolean,
) {
  if (isRestart) {
    // Reload env vars when server restarts using the workaround pattern
    loadEnv();
  }

  const server = await vite.createServer({
    configFile: false,
    plugins: [combinedPlugins(config)],
    server: host ? { host, port } : { port },
  });

  // Override Vite's restart to intercept automatic restarts (.env, tsconfig, etc.)
  server.restart = async () => {
    logger.info(
      "Vite 서버 재시작이 감지되었습니다. teul 플러그인을 다시 로드합니다...",
    );
    await handleServerRestart(host, port, server);
  };

  await server.listen();
  const url =
    server.resolvedUrls?.network?.[0] ?? server.resolvedUrls?.local?.[0];
  logger.success(`준비 완료: ${url} 에서 실행 중`);
  const watcher = server.watcher;
  watcher.on("change", handleConfigChange);
  watcher.on("unlink", handleConfigChange);
  watcher.on("add", handleConfigChange);

  async function handleConfigChange(changedFile: string) {
    const dirname = path.dirname(changedFile);
    const filename = path.basename(changedFile);
    if (
      dirname === process.cwd() &&
      (filename === "teul.config.ts" || filename === "teul.config.js")
    ) {
      logger.info(`teul 설정 파일이 변경되었습니다. 서버를 재시작합니다...`);
      await handleServerRestart(host, port, server);
    }
  }

  return server;
}
