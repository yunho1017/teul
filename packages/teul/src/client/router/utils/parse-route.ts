import type { RouteProps } from "../../../server/router/utils.js";

const normalizeRoutePath = (path: string) => {
  for (const suffix of ["/", "/index.html"]) {
    if (path.endsWith(suffix)) {
      return path.slice(0, -suffix.length) || "/";
    }
  }
  return path;
};

export const parseRoute = (url: URL): RouteProps => {
  const { pathname, searchParams, hash } = url;
  return {
    path: normalizeRoutePath(pathname),
    query: searchParams.toString(),
    hash,
  };
};

export const parseRouteFromLocation = (): RouteProps => {
  return parseRoute(new URL(window.location.href));
};
