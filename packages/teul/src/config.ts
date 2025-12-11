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
   * RSC 경로 설정
   * @default { base: "", extension: ".rsc" }
   */
  rsc?: {
    /**
     * RSC 베이스 경로 (prefix)
     * 예: "" → "/.rsc", "/about.rsc"
     * 예: "/RSC" → "/RSC/.rsc", "/RSC/about.rsc"
     * @default ""
     */
    base?: string;
    /**
     * RSC 파일 확장자
     * @default ".rsc"
     */
    extension?: string;
  };

  /**
   * Vite 설정 (고급)
   */
  vite?: ViteConfig | undefined;
};

// 기본 설정
export const defaultConfig: Required<Omit<TeulConfig, "vite">> = {
  srcDir: "src",
  pagesDir: "pages",
  distDir: "dist",
  port: 3000,
  rsc: {
    base: "/RSC",
    extension: ".rsc",
  },
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
