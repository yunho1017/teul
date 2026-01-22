import { getPathMapping, path2regexp } from "../../../utils/path.js";
import { ROUTE_SLOT_ID_PREFIX } from "./constants.js";
import type { DefineRouterFunctions, MyConfig } from "./types.js";
import { pathSpec2pathname } from "./utils.js";

export class ConfigManager {
  private cachedMyConfig: MyConfig | undefined;

  constructor(private fns: DefineRouterFunctions) {}

  async getMyConfig(): Promise<MyConfig> {
    if (!this.cachedMyConfig) {
      this.cachedMyConfig = Array.from(await this.fns.getConfig()).map((item) => {
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
                noSsr: !!item.noSsr,
                is404,
              },
            };
          }

          default:
            throw new Error("Unknown config type");
        }
      });
    }
    return this.cachedMyConfig;
  }

  async getPathConfigItem(pathname: string) {
    const myConfig = await this.getMyConfig();
    const found = myConfig.find(
      (item): item is typeof item & { type: "route" } =>
        item.type === "route" && !!getPathMapping(item.pathSpec, pathname),
    );
    return found;
  }

  async has404() {
    const myConfig = await this.getMyConfig();
    return myConfig.some(({ type, specs }) => type === "route" && specs.is404);
  }
}
