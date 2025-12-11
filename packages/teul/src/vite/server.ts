// Vite 개발 서버 시작
import * as vite from "vite";
import type { TeulConfig } from "../config.js";
import { rscPlugin } from "./plugin.js";
import { logger } from "../utils/logger.js";

export async function startDevServer(
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">
) {
  const viteConfig: vite.InlineConfig = {
    configFile: false,
    plugins: [rscPlugin({ config })],
    server: {
      port: config.port,
    },
  };

  const server = await vite.createServer(viteConfig);

  await server.listen();

  const urls = server.resolvedUrls!.local;
  const port = Number(urls[0]?.match(/:(\d+)/)?.[1]) || config.port;

  logger.success(`Listening on http://localhost:${port}/`);

  // 설정 파일 변경 감지
  const watcher = server.watcher;
  watcher.on("change", handleConfigChange);
  watcher.on("unlink", handleConfigChange);
  watcher.on("add", handleConfigChange);

  async function handleConfigChange(changedFile: string) {
    if (changedFile.includes("teul.config")) {
      logger.info("Config file changed, restarting server...");
      await server.close();
      await startDevServer(config);
    }
  }

  return server;
}
