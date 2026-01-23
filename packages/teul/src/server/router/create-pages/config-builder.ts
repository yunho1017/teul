import type { PathSpec } from "../../../utils/path.js";
import type { PageRegistry } from "./page-registry.js";
import type { RouteResolver } from "./route-resolver.js";

/**
 * defineRouter에 전달할 RouterConfig를 생성합니다.
 *
 * Registry에 등록된 페이지/레이아웃 정보를 기반으로
 * 라우트 설정 배열을 빌드합니다.
 */
export const buildRouteConfig = (
  registry: PageRegistry,
  resolver: RouteResolver,
): {
  type: "route";
  path: PathSpec;
  isStatic: boolean;
  pathPattern?: PathSpec;
  rootElement: { isStatic: boolean };
  routeElement: { isStatic: boolean };
  elements: Record<string, { isStatic: boolean }>;
}[] => {
  const routeConfigs: {
    type: "route";
    path: PathSpec;
    isStatic: boolean;
    pathPattern?: PathSpec;
    rootElement: { isStatic: boolean };
    routeElement: { isStatic: boolean };
    elements: Record<string, { isStatic: boolean }>;
  }[] = [];

  const rootItem = registry.getRootItem();
  const rootIsStatic = !rootItem || rootItem.render === "static";

  // Static pages
  for (const [path, { literalSpec, pathPattern }] of registry.getStaticPathMap()) {
    const layoutPaths = resolver.getLayouts(literalSpec);

    const elements = {
      ...layoutPaths.reduce<Record<string, { isStatic: boolean }>>(
        (acc, lPath) => {
          acc[`layout:${lPath}`] = { isStatic: true };
          return acc;
        },
        {},
      ),
      [`page:${path}`]: { isStatic: true },
    };

    const config: {
      type: "route";
      path: PathSpec;
      isStatic: boolean;
      pathPattern?: PathSpec;
      rootElement: { isStatic: boolean };
      routeElement: { isStatic: boolean };
      elements: Record<string, { isStatic: boolean }>;
    } = {
      type: "route",
      path: literalSpec,
      isStatic: true,
      rootElement: { isStatic: rootIsStatic },
      routeElement: { isStatic: true },
      elements,
    };

    if (pathPattern) {
      config.pathPattern = pathPattern;
    }

    routeConfigs.push(config);
  }

  // Dynamic pages
  for (const [path, [pathSpec]] of registry.getDynamicPagePathMap()) {
    const layoutPaths = resolver.getLayouts(pathSpec);

    const elements = {
      ...layoutPaths.reduce<Record<string, { isStatic: boolean }>>(
        (acc, lPath) => {
          acc[`layout:${lPath}`] = { isStatic: true };
          return acc;
        },
        {},
      ),
      [`page:${path}`]: { isStatic: false },
    };

    routeConfigs.push({
      type: "route",
      path: pathSpec,
      isStatic: false,
      pathPattern: pathSpec, // For dynamic routes, pathPattern is the same as path
      rootElement: { isStatic: rootIsStatic },
      routeElement: { isStatic: false },
      elements,
    });
  }

  return routeConfigs;
};
