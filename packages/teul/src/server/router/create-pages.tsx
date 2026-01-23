import { createElement, type FunctionComponent, type ReactNode } from "react";
import { defineRouter } from "./define-router/define-router.js";
import {
  joinPath,
  parsePathWithSlug,
  pathSpecAsString,
  path2regexp,
  getPathMapping,
  type PathSpec,
} from "../../utils/path.js";
import { Children } from "../../client/rsc/children.js";
import { Slot } from "../../client/rsc/slot.js";
import { ErrorBoundary } from "../../client/router/error-boundary.js";
import type { Prettify, ReplaceAll, Split } from "../../utils/util-types.js";
import type { RouteProps } from "./common.js";

type RootItem = {
  render: "static" | "dynamic";
  component: FunctionComponent<{ children: ReactNode }>;
};

export type CreateRoot = (root: RootItem) => void;
// createPages API (a wrapper around unstable_defineRouter)

/** Assumes that the path is a part of a slug path. */
type IsValidPathItem<T> = T extends `/${string}` | "[]" | "" ? false : true;

/**
 * This is a helper type to check if a path is valid in a slug path.
 */
export type IsValidPathInSlugPath<T> = T extends `/${infer L}/${infer R}`
  ? IsValidPathItem<L> extends true
    ? IsValidPathInSlugPath<`/${R}`>
    : false
  : T extends `/${infer U}`
    ? IsValidPathItem<U>
    : false;

type PathWithStaticSlugs<T extends string> = T extends `/`
  ? T
  : IsValidPathInSlugPath<T> extends true
    ? T
    : never;

export type StaticSlugRoutePathsTuple<
  T extends string,
  Slugs extends unknown[] = GetSlugs<T>,
  Result extends readonly string[] = [],
> = Slugs extends []
  ? Result
  : Slugs extends [infer _, ...infer Rest]
    ? StaticSlugRoutePathsTuple<T, Rest, readonly [...Result, string]>
    : never;

type StaticSlugRoutePaths<T extends string> =
  StaticSlugRoutePathsTuple<T> extends readonly [string]
    ? readonly string[]
    : StaticSlugRoutePathsTuple<T>[];
export type PathWithoutSlug<T> = T extends "/"
  ? T
  : IsValidPathInSlugPath<T> extends true
    ? HasSlugInPath<T, string> extends true
      ? never
      : T
    : never;

export type HasSlugInPath<T, K extends string> = T extends `/[${K}]/${infer _}`
  ? true
  : T extends `/${infer _}/${infer U}`
    ? HasSlugInPath<`/${U}`, K>
    : T extends `/[${K}]`
      ? true
      : false;

type _GetSlugs<
  Route extends string,
  SplitRoute extends string[] = Split<Route, "/">,
  Result extends string[] = [],
> = SplitRoute extends []
  ? Result
  : SplitRoute extends [`${infer MaybeSlug}`, ...infer Rest extends string[]]
    ? MaybeSlug extends `[${infer Slug}]`
      ? _GetSlugs<Route, Rest, [...Result, Slug]>
      : _GetSlugs<Route, Rest, Result>
    : Result;

type IndividualSlugType<Slug extends string> = Slug extends `...${string}`
  ? string[]
  : string;

export type GetSlugs<Route extends string> = _GetSlugs<Route>;
type SlugTypes<Path extends string> =
  GetSlugs<Path> extends string[]
    ? {
        [Slug in GetSlugs<Path>[number] as Slug]: IndividualSlugType<Slug>;
      }
    : never;
export type PropsForPages<Path extends string> = Prettify<
  Omit<RouteProps<ReplaceAll<Path, `[${string}]`, string>>, "hash"> &
    SlugTypes<Path>
>;
export type CreatePage = <
  Path extends string,
  Render extends "static" | "dynamic",
  StaticPaths extends StaticSlugRoutePaths<Path>,
  ExactPath extends boolean | undefined = undefined,
>(
  page:
    | {
        render: Extract<Render, "static">;
        path: PathWithoutSlug<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      }
    | ({
        render: Extract<Render, "static">;
        path: PathWithStaticSlugs<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      } & (ExactPath extends true ? {} : { staticPaths: StaticPaths }))
    | {
        render: Extract<Render, "dynamic">;
        path: PathWithoutSlug<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      },
) => void;

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

const getSlugs = (pathSpec: PathSpec) => {
  let numSlugs = 0;
  for (const slug of pathSpec) {
    if (slug.type !== "literal") {
      numSlugs++;
    }
  }
  return { numSlugs };
};

function expandStaticPathSpec(pathSpec: PathSpec, staticPath: string[]) {
  const mapping: Record<string, string | string[]> = {};
  let slugIndex = 0;
  const pathItems: string[] = [];
  pathSpec.forEach(({ type, name }) => {
    switch (type) {
      case "literal":
        pathItems.push(name!);
        break;

      case "group":
        pathItems.push(staticPath[slugIndex++]!);
        mapping[name!] = pathItems[pathItems.length - 1]!;
        break;
    }
  });
  const definedPath = "/" + pathItems.join("/");
  return {
    definedPath,
    pathItems,
    mapping,
  };
}

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
    { literalSpec: PathSpec; pathPattern?: PathSpec }
  >();
  const dynamicPagePathMap = new Map<
    string,
    [PathSpec, FunctionComponent<any>]
  >();
  const staticComponentMap = new Map<string, FunctionComponent<any>>();
  let rootItem: RootItem | undefined = undefined;

  const pagePathExists = (path: string) => {
    return staticPathMap.has(path) || dynamicPagePathMap.has(path);
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

  const getPageRoutePath: (path: string) =>
    | { type: "static"; path: string }
    | {
        type: "dynamic";
        path: string;
        pathSpec: PathSpec;
        component: FunctionComponent<any>;
      }
    | undefined = (path) => {
    // Check static pages first
    if (staticComponentMap.has(joinPath(path, "page").slice(1))) {
      return { type: "static", path };
    }

    // Check dynamic pages
    for (const [dynamicPath, [pathSpec, component]] of dynamicPagePathMap) {
      const regexp = new RegExp(path2regexp(pathSpec));
      if (regexp.test(path)) {
        return { type: "dynamic", path: dynamicPath, pathSpec, component };
      }
    }

    return undefined;
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
    const pathSpec = parsePathWithSlug(page.path);
    const { numSlugs } = getSlugs(pathSpec);

    if (page.render === "static" && numSlugs === 0) {
      // Static page without slugs
      staticPathMap.set(page.path, {
        literalSpec: pathSpec,
      });
      const id = joinPath(page.path, "page").replace(/^\//, "");
      if (page.component) {
        registerStaticComponent(id, page.component);
      }
    } else if (
      page.render === "static" &&
      numSlugs > 0 &&
      "staticPaths" in page
    ) {
      // Static page with slugs
      const staticPaths = page.staticPaths.map((item) =>
        (Array.isArray(item) ? item : [item]).map((slug) => String(slug)),
      );
      for (const staticPath of staticPaths) {
        if (staticPath.length !== numSlugs) {
          throw new Error("staticPaths does not match with slug pattern");
        }
        const { definedPath, pathItems, mapping } = expandStaticPathSpec(
          pathSpec,
          staticPath,
        );
        staticPathMap.set(definedPath, {
          literalSpec: pathItems.map((name) => ({ type: "literal", name })),
          pathPattern: pathSpec,
        });
        const id = joinPath(definedPath, "page").replace(/^\//, "");
        const WrappedComponent = (props: Record<string, unknown>) =>
          createElement(page.component as any, { ...props, ...mapping });
        registerStaticComponent(id, WrappedComponent);
      }
    } else if (page.render === "dynamic") {
      // Dynamic page
      dynamicPagePathMap.set(page.path, [pathSpec, page.component]);
    } else {
      throw new Error("Invalid page configuration " + JSON.stringify(page));
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
        pathPattern?: PathSpec;
        rootElement: { isStatic: boolean };
        routeElement: { isStatic: boolean };
        elements: Record<string, { isStatic: boolean }>;
      }[] = [];

      const rootIsStatic = !rootItem || rootItem.render === "static";

      for (const [path, { literalSpec, pathPattern }] of staticPathMap) {
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
      for (const [path, [pathSpec]] of dynamicPagePathMap) {
        const layoutPaths = getLayouts(pathSpec);

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
    },
    handleRoute: async (path, { query }) => {
      await configure();

      const routeInfo = getPageRoutePath(path);
      if (!routeInfo) {
        throw new Error("Route not found: " + path);
      }

      let PageComponent: FunctionComponent<any>;
      let pageProps: Record<string, unknown> = {};
      let routePath: string;
      let pathSpec: PathSpec;

      if (routeInfo.type === "static") {
        // Static page
        routePath = routeInfo.path;
        PageComponent = staticComponentMap.get(
          joinPath(routePath, "page").slice(1),
        )!;

        if (!PageComponent) {
          throw new Error("Page not found: " + path);
        }

        pathSpec = parsePathWithSlug(path);
      } else {
        // Dynamic page
        routePath = routeInfo.path;
        PageComponent = routeInfo.component;
        pathSpec = routeInfo.pathSpec;

        // Extract slug values from path
        const mapping = getPathMapping(pathSpec, path);
        if (mapping) {
          pageProps = { ...mapping };
        }
      }

      // Add query to props if exists
      if (query) {
        pageProps.query = query;
      }

      // Create page element
      const pageElement = <PageComponent {...pageProps} />;

      // Get all layouts for this path
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
