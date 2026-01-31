import type * as vite from "vite";
import { loadConfig, startDevServer } from "./dev.js";
import { logger } from "../../../utils/logger.js";

/**
 * Track if a restart is currently in flight to prevent concurrent restarts
 */
let restartInFlight = false;

async function withRestartLock<T>(
  operation: () => Promise<T>,
): Promise<T | undefined> {
  if (restartInFlight) {
    logger.info("서버 재시작이 이미 진행 중입니다. 건너뜁니다...");
    return undefined;
  }

  restartInFlight = true;
  try {
    return await operation();
  } finally {
    restartInFlight = false;
  }
}

export async function handleServerRestart(
  host: string | undefined,
  port: number,
  server: vite.ViteDevServer,
) {
  await withRestartLock(async () => {
    logger.info("새로운 플러그인 설정으로 서버를 재시작합니다...");

    const previousUrls = server.resolvedUrls;

    await server.close();

    const freshConfig = await loadConfig();

    const newServer = await startDevServer(host, port, freshConfig, true);

    if (previousUrls) {
      server.resolvedUrls = newServer.resolvedUrls;
    }
  });
}
