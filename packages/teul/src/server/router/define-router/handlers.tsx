import { Router } from "../../router.js";
import { defineServer, encodeRoutePath } from "../common.js";
import type { ConfigManager } from "./config.js";
import type { EntriesManager } from "./entries.js";

type HandleRequest = Parameters<typeof defineServer>[0]["handleRequest"];
type HandleBuild = Parameters<typeof defineServer>[0]["handleBuild"];

export const createHandleRequest = (
  entriesManager: EntriesManager,
  configManager: ConfigManager,
): HandleRequest => {
  return async (
    input,
    { renderRsc, renderHtml },
  ): Promise<ReadableStream | Response | "fallback" | null | undefined> => {
    const headers = Object.fromEntries(input.req.headers.entries());
    const url = new URL(input.req.url);

    // Component 요청 (RSC 스트림)
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

    // Page 요청 (custom)
    if (input.type === "custom") {
      const pathConfigItem = await configManager.getPathConfigItem(
        input.pathname,
      );

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

      // noSsr 체크
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

      // 404 처리
      if (await configManager.has404()) {
        return renderIt("/404", "", 404);
      } else {
        return null;
      }
    }
  };
};

export const createHandleBuild = (
  entriesManager: EntriesManager,
  configManager: ConfigManager,
): HandleBuild => {
  return async ({
    renderRsc,
    renderHtml,
    rscPath2pathname,
    generateFile,
    generateDefaultHtml,
  }) => {
    const myConfig = await configManager.getMyConfig();

    // 1단계: 모든 라우트의 entries 생성 및 RSC 파일 생성
    const entriesCache = new Map<string, Record<string, unknown>>();
    await Promise.all(
      myConfig.map(async (item) => {
        if (item.type !== "route") {
          return;
        }
        if (!item.pathname) {
          return;
        }

        const rscPath = encodeRoutePath(item.pathname);
        const entries = await entriesManager.getEntries(rscPath, undefined, {});

        if (entries) {
          entriesCache.set(item.pathname, entries);
          // Static route면 RSC 파일 생성
          if (item.specs.isStatic) {
            await generateFile(rscPath2pathname(rscPath), renderRsc(entries));
          }
        }
      }),
    );

    // 2단계: HTML 파일 생성
    for (const item of myConfig) {
      if (item.type !== "route") {
        continue;
      }

      const { pathname, specs } = item;

      if (!pathname) {
        continue;
      }

      // noSsr 라우트: 기본 HTML만 생성
      if (specs.noSsr) {
        await generateDefaultHtml(pathname);
        continue;
      }

      // Static 라우트: 전체 HTML 생성
      const entries = entriesCache.get(pathname);
      if (specs.isStatic && entries) {
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
