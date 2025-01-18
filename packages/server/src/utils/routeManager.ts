import path from "path";
import { readdirSync } from "fs";
import getAllKeys from "./getAllKeys";
import get from "./get";

interface RouteHandler {
  page: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
}

interface RouteMatch {
  handler: RouteHandler;
  params: Record<string, string>;
}

interface Route {
  page?: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  [key: string]: any;
}

class RouteManager {
  private static instance: RouteManager;
  private routes: Route = {};

  constructor() {
    if (RouteManager.instance) {
      return RouteManager.instance;
    }
    RouteManager.instance = this;
  }

  static getInstance(): RouteManager {
    if (!RouteManager.instance) {
      RouteManager.instance = new RouteManager();
    }
    return RouteManager.instance;
  }

  getRoutePatterns(): string[] {
    return getAllKeys(this.routes);
  }

  getPathSegments(routePath: string | string[]): string[] {
    const segments = Array.isArray(routePath)
      ? routePath
      : routePath.split("/");
    return segments.filter(Boolean);
  }

  getRoute(routePath: string | string[]): Route | undefined {
    const parts = this.getPathSegments(routePath);
    return get(this.routes, parts);
  }

  getLayout(
    routePath: string | string[]
  ): React.ComponentType<any> | undefined {
    const parts = this.getPathSegments(routePath);
    const route = this.getRoute(parts);

    if (route?.layout) {
      return route.layout;
    }

    parts.pop();
    return this.getLayout(parts);
  }

  matchRoute(rawPath: string): RouteMatch | null {
    const path = rawPath === "/" ? "" : rawPath;
    const patterns = this.getRoutePatterns();
    console.log("!!!", patterns, path);
    for (const pattern of patterns) {
      const regex = new RegExp(
        `^${pattern.replace(/\[([^\]]+)\]/g, (_, key) => `(?<${key}>[^/]+)`)}$`
      );
      const match = path.match(regex);

      if (match) {
        const params = match.groups || {};
        const route = this.getRoute(pattern);
        console.log(route, pattern);
        if (route?.page) {
          return {
            handler: {
              page: route.page,
              layout: route.layout || this.getLayout(path),
            },
            params,
          };
        }
      }
    }
    return null;
  }

  async buildRoutes(
    dir: string,
    currentRoute: Route = this.routes
  ): Promise<void> {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        currentRoute[entry.name] = {};
        await this.buildRoutes(fullPath, currentRoute[entry.name]);
        continue;
      }

      const fileName = entry.name.split(".")[0];

      switch (fileName) {
        case "page":
          currentRoute.page = require(fullPath).default;
          break;
        case "layout":
          currentRoute.layout = require(fullPath).default;
          break;
        default:
          break;
      }
    }
  }

  logRoutes(): void {
    const patterns = this.getRoutePatterns();
    for (const pattern of patterns) {
      console.log(`Registered route: ${pattern}`);
    }
  }
}

export default RouteManager;
