import type { FunctionComponent, ReactNode } from "react";
import { defineRouter } from "./define-router/index.js";
import {
  joinPath,
  parsePathWithSlug,
  pathSpecAsString,
  type PathSpec,
} from "../utils/path.js";
import { Children, Slot } from "../minimal/client.js";
import { ErrorBoundary } from "./client.js";

// TODO: dynamic
type RootItem = {
  render: "static";
  component: FunctionComponent<{ children: ReactNode }>;
};

export type CreateRoot = (root: RootItem) => void;

export type CreatePage = <Path extends string>(page: {
  render: "static";
  path: Path;
  component: FunctionComponent<any>;
}) => void;

export type CreateLayout = <Path extends string>(layout: {
  render: "static";
  path: Path;
  component: FunctionComponent<{ children: ReactNode }>;
}) => void;

/**
 * Default root component for all pages
 */
const DefaultRoot = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <html>
      <head />
      <body>{children}</body>
    </html>
  </ErrorBoundary>
);

const createNestedElements = (
  elements: {
    component: FunctionComponent<any>;
    props?: Record<string, unknown>;
  }[],
  children: ReactNode,
) => {
  return elements.reduceRight<ReactNode>(
    (result, element) => (
      <element.component {...element.props}>{result}</element.component>
    ),
    children,
  );
};

export const createPages = <AllPages extends any[]>(
  fn: (fns: {
    createPage: CreatePage;
    createLayout: CreateLayout;
    createRoot: CreateRoot;
  }) => Promise<AllPages>,
) => {
  let configured = false;

  const staticPathMap = new Map<
    string,
    { literalSpec: PathSpec; originalSpec?: PathSpec }
  >();
  const staticComponentMap = new Map<string, FunctionComponent<any>>();
  let rootItem: RootItem | undefined = undefined;

  const pagePathExists = (path: string) => {
    return staticPathMap.has(path);
  };

  const getLayouts = (spec: PathSpec): string[] => {
    const pathSegments = spec.reduce<string[]>(
      (acc, _segment, index) => {
        acc.push(pathSpecAsString(spec.slice(0, index + 1)));
        return acc;
      },
      ["/"],
    );

    return pathSegments.filter(
      (segment) => staticComponentMap.has(joinPath(segment, "layout").slice(1)), // feels like a hack
    );
  };

  const getPageRoutePath: (path: string) => string | undefined = (path) => {
    if (staticComponentMap.has(joinPath(path, "page").slice(1))) {
      return path;
    }
  };

  const registerStaticComponent = (
    id: string,
    component: FunctionComponent<any>,
  ) => {
    if (
      staticComponentMap.has(id) &&
      staticComponentMap.get(id) !== component
    ) {
      throw new Error(`Duplicated component for: ${id}`);
    }
    staticComponentMap.set(id, component);
  };
  const createPage: CreatePage = (page) => {
    if (configured) {
      throw new Error("createPage no longer available");
    }
    if (pagePathExists(page.path)) {
      throw new Error(`Duplicated path: ${page.path}`);
    }

    staticPathMap.set(page.path, {
      literalSpec: parsePathWithSlug(page.path),
    });

    const id = joinPath(page.path, "page").replace(/^\//, "");
    if (page.component) {
      registerStaticComponent(id, page.component);
    }

    return page as Exclude<typeof page, { path: never } | { render: never }>;
  };

  const createLayout: CreateLayout = (layout) => {
    if (configured) {
      throw new Error("createLayout no longer available");
    }
    if (layout.render === "static") {
      const id = joinPath(layout.path, "layout").replace(/^\//, "");
      registerStaticComponent(id, layout.component);
    } else {
      throw new Error("Invalid layout configuration");
    }
  };

  const createRoot: CreateRoot = (root) => {
    if (configured) {
      throw new Error("createRoot no longer available");
    }
    if (rootItem) {
      throw new Error(`Duplicated root component`);
    }
    if (root.render === "static") {
      rootItem = root;
    } else {
      throw new Error("Invalid root configuration");
    }
  };

  let ready: Promise<AllPages | void> | undefined;
  const configure = async () => {
    if (!configured && !ready) {
      ready = fn({
        createPage,
        createLayout,
        createRoot,
      });
      await ready;
      configured = true;
    }
    await ready;
  };

  const definedRouter = defineRouter({
    getConfig: async () => {
      await configure();

      const routeConfigs: {
        type: "route";
        path: PathSpec;
        isStatic: boolean;
        rootElement: { isStatic: boolean };
        routeElement: { isStatic: boolean };
        elements: Record<string, { isStatic: boolean }>;
      }[] = [];

      const rootIsStatic = !rootItem || rootItem.render === "static";

      // Static pages only
      for (const [path, { literalSpec }] of staticPathMap) {
        const layoutPaths = getLayouts(literalSpec);

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

        routeConfigs.push({
          type: "route",
          path: literalSpec,
          isStatic: true, // All static
          rootElement: { isStatic: rootIsStatic },
          routeElement: { isStatic: true },
          elements,
        });
      }

      return routeConfigs;
    },
    handleRoute: async (path, { query }) => {
      await configure();

      // path without slugs
      const routePath = getPageRoutePath(path);
      if (!routePath) {
        throw new Error("Route not found: " + path);
      }

      const PageComponent = staticComponentMap.get(
        joinPath(routePath, "page").slice(1),
      );

      if (!PageComponent) {
        throw new Error("Page not found: " + path);
      }

      // Create page element
      const pageElement = query ? (
        <PageComponent query={query} />
      ) : (
        <PageComponent />
      );

      // Get all layouts for this path
      const pathSpec = parsePathWithSlug(path);
      const layoutPaths = getLayouts(pathSpec);

      // Create layout elements
      const elements: Record<string, unknown> = {
        [`page:${routePath}`]: pageElement,
      };

      for (const segment of layoutPaths) {
        const Layout = staticComponentMap.get(
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

      // Nest layouts: Root > Layout > Layout > Page
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
    },
  });

  return definedRouter;
};
