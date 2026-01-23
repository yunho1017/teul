import type { FunctionComponent, ReactNode } from "react";
import {
  getPathMapping,
  joinPath,
  parsePathWithSlug,
} from "../../../utils/path.js";
import { Children } from "../../../client/rsc/children.js";
import { Slot } from "../../../client/rsc/slot.js";
import type { PageRegistry } from "./page-registry.js";
import type { RouteResolver } from "./route-resolver.js";
import { createNestedElements, DefaultRoot } from "./utils.js";

/**
 * handleRoute 함수를 생성합니다.
 *
 * @param registry - 프로젝트 내 전체 페이지 정보를 담고 있는 클래스
 * @param resolver - 경로 기반으로 해당하는 레이아웃 라우트를 리턴하는 메서드가 있는 클래스
 * @returns 주어진 경로에 대한 페이지 및 레이아웃을 렌더링하여 rootElement, routeElement, elements를 반환하는 함수
 */
export const createRouteHandler = (
  registry: PageRegistry,
  resolver: RouteResolver,
) => {
  return async (
    path: string,
    { query }: { query?: string },
  ): Promise<{
    rootElement: ReactNode;
    routeElement: ReactNode;
    elements: Record<string, unknown>;
  }> => {
    /** 현재 path에 대한 라우트 정보 */
    const routeInfo = resolver.getPageRoutePath(path);
    if (!routeInfo) {
      throw new Error("Route not found: " + path);
    }

    let PageComponent: FunctionComponent<any>;
    let pageProps: Record<string, unknown> = {};
    let routePath: string;
    let pathSpec: ReturnType<typeof parsePathWithSlug>;

    if (routeInfo.type === "static") {
      routePath = routeInfo.path;
      PageComponent = registry.getStaticComponent(
        joinPath(routePath, "page").slice(1),
      )!;

      if (!PageComponent) {
        throw new Error("Page not found: " + path);
      }

      pathSpec = parsePathWithSlug(path);
    } else {
      routePath = routeInfo.path;
      PageComponent = routeInfo.component;
      pathSpec = routeInfo.pathSpec;

      /** PathSpec과 실제 경로를 매칭하여 동적 파라미터 값을 가져옵니다 */
      const mapping = getPathMapping(pathSpec, path);
      if (mapping) {
        pageProps = { ...mapping };
      }
    }

    /** pageProps에 query를 추가하여 컴포넌트에서 받을 수 있게 합니다 */
    if (query) {
      pageProps.query = query;
    }

    /**
     * 렌더링할 엘리먼트들을 생성합니다.
     * 먼저 pageElement를 넣고, 그 다음 layouts를 넣습니다.
     */
    const elements: Record<string, unknown> = {
      [`page:${routePath}`]: <PageComponent {...pageProps} />,
    };

    const layoutPaths = resolver.getLayouts(pathSpec);
    for (const segment of layoutPaths) {
      const Layout = registry.getStaticComponent(
        joinPath(segment, "layout").slice(1),
      );

      if (Layout) {
        elements[`layout:${segment}`] = (
          <Layout>
            <Children />
          </Layout>
        );
      }
    }

    const layouts = layoutPaths.map((lPath) => ({
      component: Slot,
      props: { id: `layout:${lPath}` },
    }));

    const finalPageChildren = Array.isArray(PageComponent) ? (
      <>
        {PageComponent.map((_comp, order) => (
          <Slot
            id={`page:${routePath}:${order}`}
            key={`page:${routePath}:${order}`}
          />
        ))}
      </>
    ) : (
      <Slot id={`page:${routePath}`} />
    );

    const rootItem = registry.getRootItem();
    const RootComponent = rootItem ? rootItem.component : DefaultRoot;

    return {
      elements,
      rootElement: (
        <RootComponent>
          <Children />
        </RootComponent>
      ),
      routeElement: createNestedElements(layouts, finalPageChildren),
    };
  };
};
