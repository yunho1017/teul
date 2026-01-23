import { createPages } from "./create-pages/create-pages.js";

/**
 * 파일 시스템 기반 라우터를 생성합니다.
 *
 * 파일 경로를 라우트로 자동 변환하여 라우터를 구성합니다.
 * - `_layout.tsx`: 레이아웃 컴포넌트
 * - `_root.tsx`: 루트 컴포넌트
 * - `index.tsx`: 인덱스 페이지
 * - 나머지: 일반 페이지
 *
 * @param pages - 파일 경로에서 라우트 모듈로의 매핑 (Vite의 import.meta.glob으로 생성)
 * @param _options - 옵션 객체 (현재 미사용)
 * @returns createPages 결과
 *
 * @example
 * ```ts
 * fsRouter(import.meta.glob("/src/pages/**\/*.tsx", { base: "/src/pages" }))
 * ```
 *
 * @todo apiDir/slicesDir options에 추가
 */
export function fsRouter(
  pages: { [file: string]: () => Promise<any> },
  _options: {} = {},
) {
  return createPages(async ({ createPage, createLayout, createRoot }) => {
    for (let file in pages) {
      const mod = await pages[file]!();

      file = file.replace(/^\.\//, "");
      const config = await mod.getConfig?.();

      const pathItems = file
        .replace(/\.\w+$/, "")
        .split("/")
        .filter(Boolean);

      const path =
        "/" +
        (["_layout", "index", "_root"].includes(pathItems.at(-1)!)
          ? pathItems.slice(0, -1)
          : pathItems
        ).join("/");

      if (pathItems.at(-1) === "_layout") {
        createLayout({
          path,
          component: mod.default,
          render: "static",
          ...config,
        });
      } else if (pathItems.at(-1) === "_root") {
        createRoot({
          component: mod.default,
          render: "static",
          ...config,
        });
      } else {
        createPage({
          path,
          component: mod.default,
          render: "static",
          ...config,
        });
      }
    }

    /**
     * 반환 타입을 만족시키기 위한 더미 반환값
     * 런타임에서는 사용되지 않습니다.
     */
    return null as never;
  });
}
