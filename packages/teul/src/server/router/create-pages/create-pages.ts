import { defineRouter } from "../define-router/define-router.js";
import { once } from "../../../utils/async.js";
import { buildRouteConfig } from "./config-builder.js";
import { PageRegistry } from "./page-registry.js";
import { createRouteHandler } from "./route-handler.js";
import { RouteResolver } from "./route-resolver.js";
import type { CreateLayout, CreatePage, CreateRoot } from "./types.js";

/**
 * 사용자가 페이지, 레이아웃, 루트 컴포넌트를 정의할 수 있는 API를 콜백 파라미터 형태로 제공하고,
 * 내부적으로 defineRouter로 변환하여 라우터를 생성합니다.
 *
 * @example
 * export default createPages(async ({ createPage, createLayout, createRoot }) => {
 *   createRoot({
 *     render: 'static',
 *     component: RootLayout,
 *   });
 *
 *   createLayout({
 *     render: 'static',
 *     path: '/',
 *     component: MainLayout,
 *   });
 *
 *   createPage({
 *     render: 'static',
 *     path: '/',
 *     component: HomePage,
 *   });
 * });
 */
export const createPages = <AllPages extends any[]>(
  fn: (fns: {
    createPage: CreatePage;
    createLayout: CreateLayout;
    createRoot: CreateRoot;
  }) => Promise<AllPages>,
) => {
  const registry = new PageRegistry();
  const resolver = new RouteResolver(registry);

  const createPage: CreatePage = (page) => {
    registry.registerPage(page as any);
    return page as any;
  };

  const createLayout: CreateLayout = (layout) => {
    registry.registerLayout(layout);
  };

  const createRoot: CreateRoot = (root) => {
    registry.registerRoot(root);
  };

  const configure = once(async () => {
    const result = await fn({
      createPage,
      createLayout,
      createRoot,
    });
    registry.markConfigured();
    return result;
  });

  const definedRouter = defineRouter({
    getConfig: async () => {
      await configure();
      return buildRouteConfig(registry, resolver);
    },
    handleRoute: async (path, options) => {
      await configure();
      return createRouteHandler(registry, resolver)(path, options);
    },
  });

  return definedRouter;
};

export type {
  CreatePage,
  CreateLayout,
  CreateRoot,
  PropsForPages,
} from "./types.js";
