import type { UserConfig as ViteConfig } from "vite";

// Teul 설정 타입
export type TeulConfig = {
  /**
   * 소스 디렉토리
   * @default "src"
   */
  srcDir?: string;

  /**
   * 페이지 디렉토리 (srcDir 기준)
   * @default "pages"
   */
  pagesDir?: string;

  /**
   * 빌드 출력 디렉토리
   * @default "dist"
   */
  distDir?: string;

  /**
   * 개발 서버 포트
   * @default 3000
   */
  port?: number;

  /**
   * RSC 베이스 경로 (prefix)
   * 예: "" → "/.rsc", "/about.rsc"
   * 예: "/RSC" → "/RSC/.rsc", "/RSC/about.rsc"
   * @default ""
   */
  rscBase?: string;
  /**
   * RSC 파일 확장자
   * @default ".rsc"
   */
  rscExtension?: string;

  /**
   * fs-router에서 무시할 파일 확장자
   * @default "['_components', '_hooks']"
   */
  ignoredFilePath?: string[];

  /**
   * 어댑터 설정
   * @default teul/adapters/node
   */
  adapter?: string;
  /**
   * Vite 설정 (고급)
   */
  vite?: ViteConfig | undefined;
};

// 설정 병합 헬퍼
export function mergeConfig(
  userConfig: TeulConfig = {},
): Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite"> {
  return {
    ...defaultConfig,
    ...userConfig,
  };
}

// 타입 안전한 설정 정의 헬퍼
export function defineConfig(config: TeulConfig): TeulConfig {
  return config;
}

const getDefaultAdapter = () =>
  process.env.CLOUDFLARE || process.env.WORKERS_CI
    ? "teul/adapters/cloudflare"
    : "teul/adapters/node";

// 기본 설정
const defaultConfig: Required<Omit<TeulConfig, "vite">> = {
  srcDir: "src",
  pagesDir: "pages",
  distDir: "dist",
  port: 3000,
  rscBase: "/RSC",
  rscExtension: ".rsc",
  ignoredFilePath: ["_components", "_hooks"],
  adapter: "teul/adapters/node",
};

export function resolveConfig(
  config: TeulConfig | undefined,
): Required<TeulConfig> {
  const resolvedConfig: Required<TeulConfig> = {
    ...defaultConfig,
    adapter: getDefaultAdapter(),
    vite: undefined,
    ...config,
  };

  return resolvedConfig;
}
