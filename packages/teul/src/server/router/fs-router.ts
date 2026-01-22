import { createPages } from "./create-pages.js";

export function fsRouter(
  /**
   * 파일 경로에서 라우트 모듈로의 매핑, 예시:
   *   {
   *     "_layout.tsx": () => ({ default: ... }),
   *     "index.tsx": () => ({ default: ... }),
   *     "foo/index.tsx": () => ...,
   *   }
   * Vite의 import.meta.glob으로 생성 가능:
   *   import.meta.glob("/src/pages/**\/*.tsx", { base: "/src/pages" })
   */
  pages: { [file: string]: () => Promise<any> },
  _options: {
    /**
     * 무시할 패턴 (예: ["_components", "utils"])
     */
    ignorePatterns?: string[];
  } = {},
) {
  return createPages(async ({ createPage, createLayout, createRoot }) => {
    for (let file in pages) {
      const mod = await pages[file]!();
      // "./" 접두사 제거
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

    // HACK: 반환 타입을 만족시키기 위함, 런타임에서는 사용되지 않음
    return null as never;
  });
}
