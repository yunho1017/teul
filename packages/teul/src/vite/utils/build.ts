// File emission utilities (no virtual: imports)
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream, existsSync } from "node:fs";
import type { TeulConfig } from "../../config.js";
import { DIST_PUBLIC } from "../constants.js";

const WRITE_FILE_BATCH_SIZE = 2500;

/**
 * Create a task runner with concurrency control
 */
function createTaskRunner(limit: number) {
  let running = 0;
  const waiting: Array<() => void> = [];
  const tasks = new Set<Promise<void>>();

  const scheduleTask = async (task: () => Promise<void>) => {
    // Wait for a slot if at limit
    while (running >= limit) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }

    running++;
    const promise = task()
      .catch((error) => {
        console.error("Task failed:", error);
      })
      .finally(() => {
        running--;
        tasks.delete(promise);
        // Trigger next waiting task
        const next = waiting.shift();
        if (next) next();
      });

    tasks.add(promise);
    return promise;
  };

  const waitForTasks = async () => {
    await Promise.all(Array.from(tasks));
  };

  return { scheduleTask, waitForTasks };
}

const { scheduleTask, waitForTasks } = createTaskRunner(WRITE_FILE_BATCH_SIZE);

export { waitForTasks };

/**
 * Emit a static file to disk
 */
export function emitStaticFile(
  rootDir: string,
  config: Pick<Required<TeulConfig>, "distDir">,
  pathname: string,
  bodyPromise: Promise<string | ReadableStream>,
) {
  // Calculate output path
  const destFile = path.join(
    rootDir,
    config.distDir,
    DIST_PUBLIC,
    path.extname(pathname)
      ? pathname
      : pathname === "/404"
        ? "404.html"
        : pathname + "/index.html",
  );

  // Skip if file exists (partial build mode)
  if (existsSync(destFile)) {
    return;
  }

  // Schedule async file write with concurrency control
  scheduleTask(async () => {
    await mkdir(path.dirname(destFile), { recursive: true });
    const body = await bodyPromise;

    if (typeof body === "string") {
      await writeFile(destFile, body);
    } else {
      // Stream handling for large files
      await pipeline(
        Readable.fromWeb(body as any),
        createWriteStream(destFile),
      );
    }
  });
}
