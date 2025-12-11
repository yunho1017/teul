import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import * as dotenv from 'dotenv';
import type { TeulConfig } from '../config.js';
import { devCommand, buildCommand, startCommand } from './commands.js';
import { logger } from '../utils/logger.js';

// .env 파일 로드
dotenv.config({ path: ['.env.local', '.env'] });

// 명령줄 인자 파싱
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    port: {
      type: 'string',
      short: 'p',
    },
    version: {
      type: 'boolean',
      short: 'v',
    },
  },
});

const command = positionals[0];

// 설정 파일 로드
async function loadConfig(): Promise<TeulConfig> {
  const configPath = process.cwd() + '/teul.config.ts';

  if (!existsSync(configPath)) {
    return {};
  }

  try {
    // vite의 runnerImport를 사용하여 TS 설정 파일 로드
    const vite = await import('vite');
    const result = await vite.runnerImport<{ default: TeulConfig }>(
      '/teul.config'
    );
    return result.module.default || {};
  } catch (error) {
    logger.error('Failed to load config', error);
    return {};
  }
}

// CLI 실행
export async function run() {
  if (values.version) {
    const pkg = await import('../../package.json');
    console.log(pkg.default.version);
    return;
  }

  const userConfig = await loadConfig();

  // 포트 옵션 병합
  if (values.port) {
    userConfig.port = parseInt(values.port, 10);
  }

  switch (command) {
    case 'dev':
      await devCommand(userConfig);
      break;

    case 'build':
      await buildCommand(userConfig);
      break;

    case 'start':
      await startCommand(userConfig);
      break;

    default:
      if (command) {
        console.error(`Unknown command: ${command}`);
      }
      console.log(`
Usage: teul <command> [options]

Commands:
  dev       Start development server
  build     Build for production
  start     Start production server

Options:
  -p, --port <port>    Port number (default: 3000)
  -v, --version        Show version
      `);
  }
}
