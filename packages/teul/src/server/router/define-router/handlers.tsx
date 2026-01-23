import { Router } from "../../router.js";
import { defineServer, encodeRoutePath } from "../common.js";
import type { RouteConfigManager } from "./config.js";
import type { EntriesManager } from "./entries.js";

type HandleRequest = Parameters<typeof defineServer>[0]["handleRequest"];
type HandleBuild = Parameters<typeof defineServer>[0]["handleBuild"];

/**
 * 서버 환경에서 요청을 처리하는 핸들러를 생성합니다.
 *
 * entriesManager와 configManager를 사용하여 파라미터로 받아온 renderRsc, renderHtml을
 * 호출하는 함수를 반환하고, ReadableStream과 같은 형태로 변환합니다.
 *
 * @param entriesManager - 라우트 엔트리 관리자
 * @param configManager - 라우트 설정 관리자
 * @returns 요청 핸들러 함수
 * @see packages/teul/src/vite/entries/entry.server.tsx
 */
export const createHandleRequest = (
  entriesManager: EntriesManager,
  configManager: RouteConfigManager,
): HandleRequest => {
  /**
   * 요청을 처리하는 핸들러 함수
   *
   * @param input - 현재 요청에 대한 정보
   * @param renderRsc - RSC 렌더링 유틸
   * @param renderHtml - HTML 렌더링 유틸
   * @returns ReadableStream, Response, "fallback", null 또는 undefined
   * @see packages/teul/src/vite/utils/request.ts - input 타입 참조
   * @see packages/teul/src/vite/utils/render.ts - 렌더링 유틸 참조
   */
  return async (
    input,
    { renderRsc, renderHtml },
  ): Promise<ReadableStream | Response | "fallback" | null | undefined> => {
    const headers = Object.fromEntries(input.req.headers.entries());
    const url = new URL(input.req.url);

    /**
     * Component 요청 (RSC 요청) 처리
     * Link로 인한 navigation change 시 발생하며, renderRsc만 사용하여
     * 컴포넌트 업데이트에 필요한 정보만 반환합니다.
     */
    if (input.type === "component") {
      const entries = await entriesManager.getEntries(
        input.rscPath,
        input.rscParams,
        headers,
      );

      if (!entries) {
        return null;
      }
      return renderRsc(entries);
    }

    /**
     * Page 요청 (custom) 처리
     * 첫 진입 시 발생하며, renderHtml을 사용하여 HTML을 반환합니다.
     */
    if (input.type === "custom") {
      const pathConfigItem = await configManager.getConfigItemByPath(
        input.pathname,
      );

      /**
       * 렌더링을 진행하는 내부 헬퍼 함수
       */
      const renderIt = async (
        pathname: string,
        query: string,
        httpstatus = 200,
      ) => {
        const rscPath = encodeRoutePath(pathname);
        const rscParams = new URLSearchParams({ query });
        const entries = await entriesManager.getEntries(
          rscPath,
          rscParams,
          headers,
        );
        if (!entries) {
          return null;
        }
        const html = (
          <Router
            route={{ path: pathname, query, hash: "" }}
            httpstatus={httpstatus}
          />
        );

        return renderHtml(entries, html, {
          rscPath,
          status: httpstatus,
        });
      };

      const query = url.searchParams.toString();

      /**
       * SSR 옵션이 꺼져있는 경우 "fallback"을 반환합니다.
       * fallback인 경우 CSR로 전환하기 위해 빈 HTML을 제공합니다.
       *
       * @see packages/teul/src/vite/entries/entry.server.tsx L72
       */
      if (pathConfigItem?.type === "route" && pathConfigItem.specs.noSsr) {
        return "fallback";
      }

      try {
        if (pathConfigItem) {
          return await renderIt(input.pathname, query);
        }
      } catch (e) {
        throw e;
      }

      /**
       * 일치하는 라우트가 없으면 404 페이지를 반환합니다.
       */
      if (await configManager.has404()) {
        return renderIt("/404", "", 404);
      } else {
        return null;
      }
    }
  };
};

/**
 * 빌드 환경에서 정적 파일을 생성하는 핸들러를 생성합니다.
 *
 * 빌드 시점에 정적 라우트의 RSC 파일과 HTML 파일을 미리 생성하여
 * 프로덕션 환경에서 빠른 응답을 제공합니다.
 *
 * **빌드 프로세스:**
 * 1. 정적 라우트의 엔트리를 생성하고 RSC 파일로 저장
 * 2. 각 라우트에 대한 HTML 파일 생성
 *    - noSsr 라우트: 기본 HTML만 생성 (클라이언트에서 렌더링)
 *    - 일반 라우트: 전체 HTML 생성 (SSR)
 *
 * **동적 라우트 처리:**
 * 동적 라우트(슬러그 포함)는 빌드 시 생성되지 않으며,
 * 런타임에 요청이 들어올 때 처리됩니다.
 *
 * @param entriesManager - 라우트 엔트리 관리자
 * @param configManager - 라우트 설정 관리자
 * @returns 빌드 핸들러 함수
 * @see packages/teul/src/vite/build.ts
 */
export const createHandleBuild = (
  entriesManager: EntriesManager,
  configManager: RouteConfigManager,
): HandleBuild => {
  return async ({
    renderRsc,
    renderHtml,
    rscPath2pathname,
    generateFile,
    generateDefaultHtml,
  }) => {
    const myConfig = await configManager.getMyRouteConfig();

    /**
     * 1단계: 정적 라우트의 엔트리 생성 및 RSC 파일 생성
     * 각 정적 라우트에 대해 엔트리를 가져와 캐시에 저장하고,
     * RSC 파일로 생성합니다.
     */
    const entriesCache = new Map<string, Record<string, unknown>>();
    await Promise.all(
      myConfig.map(async (item) => {
        if (item.type !== "route") {
          return;
        }

        /**
         * 동적 라우트는 빌드 시 건너뜁니다.
         * 런타임에 처리됩니다.
         */
        if (!item.specs.isStatic) {
          return;
        }

        const pathname = item.pathname;
        if (!pathname) {
          return;
        }

        const rscPath = encodeRoutePath(pathname);
        const entries = await entriesManager.getEntries(rscPath, undefined, {});

        if (entries) {
          entriesCache.set(pathname, entries);
          /**
           * 정적 라우트에 대한 RSC 파일 생성
           */
          await generateFile(rscPath2pathname(rscPath), renderRsc(entries));
        }
      }),
    );

    /**
     * 2단계: HTML 파일 생성
     * 각 정적 라우트에 대해 HTML 파일을 생성합니다.
     */
    for (const item of myConfig) {
      if (item.type !== "route") {
        continue;
      }

      const { pathname, specs } = item;

      /**
       * 동적 라우트는 빌드 시 건너뜁니다.
       */
      if (!item.specs.isStatic) {
        continue;
      }

      if (!pathname) {
        continue;
      }

      /**
       * noSsr 라우트는 기본 HTML만 생성합니다.
       * 클라이언트 측에서 렌더링됩니다.
       */
      if (specs.noSsr) {
        await generateDefaultHtml(pathname);
        continue;
      }

      /**
       * 정적 라우트는 전체 HTML을 생성합니다.
       * 1단계에서 캐시한 엔트리를 사용하여 HTML을 렌더링합니다.
       */
      const entries = entriesCache.get(pathname);
      if (entries) {
        const rscPath = encodeRoutePath(pathname);
        const html = (
          <Router
            route={{ path: pathname, query: "", hash: "" }}
            httpstatus={specs.is404 ? 404 : 200}
          />
        );

        await generateFile(
          pathname,
          renderHtml(entries, html, {
            rscPath,
          }).then((res) => res.body || ""),
        );
      }
    }
  };
};
