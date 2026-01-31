import { createRequire } from "node:module";
import process from "node:process";
import { parseArgs } from "node:util";
import loadEnv from "./utils/env.js";
import { logger } from "./utils/logger.js";

loadEnv();

const require = createRequire(new URL(".", import.meta.url));

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    host: {
      type: "string",
      short: "h",
    },
    port: {
      type: "string",
      short: "p",
    },
    version: {
      type: "boolean",
      short: "v",
    },
    help: {
      type: "boolean",
    },
  },
});

const cmd = positionals[0];

async function run() {
  if (values.version) {
    const { version } = require("../package.json");
    logger.info(version);
  } else if (values.help) {
    displayUsage();
  } else if (cmd === "dev" || cmd === "build" || cmd === "start") {
    const { runCommand } = await import("./vite/rsc/command.js");
    await runCommand(cmd, values);
  } else {
    if (cmd) {
      logger.error("올바른 명령어를 입력하세요: ", cmd);
    }
    displayUsage();
  }
}

function displayUsage() {
  logger.info(`
사용법: tuel [옵션] <명령어>

명령어:
  dev         개발 서버를 시작합니다
  build       프로덕션용 애플리케이션을 빌드합니다
  start       프로덕션 서버를 시작합니다

옵션:
  -h, --host            바인딩할 호스트명 (예: 0.0.0.0)
  -p, --port            서버 포트 번호
  -v, --version         버전 번호를 표시합니다
      --help            이 도움말 메시지를 표시합니다
`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
