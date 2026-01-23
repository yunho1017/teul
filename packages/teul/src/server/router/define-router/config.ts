import { getPathMapping, path2regexp } from "../../../utils/path.js";
import { ROUTE_SLOT_ID_PREFIX } from "./constants.js";
import type { DefineRouterFunctions, MyRouteConfig } from "./types.js";
import { pathSpec2pathname } from "./utils.js";

/**
 * 파라미터(getConfig)로 받아온 config를
 * 가공해 저장하고 관련 메소드를 담고 있는 클래스
 */
export class RouteConfigManager {
  private cachedMyConfig: MyRouteConfig | undefined;

  constructor(private fns: DefineRouterFunctions) {}

  async getMyRouteConfig(): Promise<MyRouteConfig> {
    if (!this.cachedMyConfig) {
      this.cachedMyConfig = Array.from(await this.fns.getConfig()).map(
        (item) => {
          switch (item.type) {
            case "route": {
              const is404 =
                item.path.length === 1 &&
                item.path[0]!.type === "literal" &&
                item.path[0]!.name === "404";

              if (
                Object.keys(item.elements).some((id) =>
                  id.startsWith(ROUTE_SLOT_ID_PREFIX),
                )
              ) {
                throw new Error(
                  'Element ID cannot start with "route:" or "slice:"',
                );
              }
              return {
                type: "route",
                pathSpec: item.path,
                pathname: pathSpec2pathname(item.path),
                pattern: path2regexp(item.pathPattern || item.path),
                specs: {
                  rootElementIsStatic: !!item.rootElement.isStatic,
                  routeElementIsStatic: !!item.routeElement.isStatic,
                  staticElementIds: Object.entries(item.elements).flatMap(
                    ([id, { isStatic }]) => (isStatic ? [id] : []),
                  ),
                  isStatic: item.isStatic,
                  noSsr: Boolean(item.noSsr),
                  is404,
                },
              };
            }

            default:
              throw new Error("Unknown config type");
          }
        },
      );
    }
    return this.cachedMyConfig;
  }

  /**
   * 주어진 경로와 일치하는 라우트 설정을 찾습니다.
   * 정적 라우트(정확히 일치)와 동적 라우트(슬러그 포함) 모두 지원합니다.
   *
   * @example
   * // 정적 라우트: /about
   * getPathConfigItem('/about') // /about에 대한 설정 반환
   *
   * // 동적 라우트: /blog/[id]
   * getPathConfigItem('/blog/post-1') // /blog/[id]에 대한 설정 반환
   * getPathConfigItem('/blog/post-2') // /blog/[id]에 대한 설정 반환
   */
  async getConfigItemByPath(pathname: string) {
    const myConfig = await this.getMyRouteConfig();
    const found = myConfig.find(
      (item): item is typeof item & { type: "route" } =>
        item.type === "route" && !!getPathMapping(item.pathSpec, pathname),
    );
    return found;
  }

  async has404() {
    const myConfig = await this.getMyRouteConfig();
    return myConfig.some(({ type, specs }) => type === "route" && specs.is404);
  }
}
