import { parseJSONSafe } from "../../../utils/json.js";
import {
  decodeRoutePath,
  HAS404_ID,
  IS_STATIC_ID,
  ROUTE_ID,
  SKIP_HEADER,
} from "../common.js";
import type { ConfigManager } from "./config.js";
import { ROUTE_SLOT_ID_PREFIX } from "./constants.js";
import type { DefineRouterFunctions } from "./types.js";
import { isStringArray, parseRscParams } from "./utils.js";

export class EntriesManager {
  constructor(
    private fns: DefineRouterFunctions,
    private configManager: ConfigManager,
  ) {}

  async getEntries(
    rscPath: string,
    rscParams: unknown,
    headers: Readonly<Record<string, string>>,
  ) {
    const pathname = decodeRoutePath(rscPath);
    const pathConfigItem = await this.configManager.getPathConfigItem(pathname);

    if (!pathConfigItem) {
      return null;
    }

    let skipParam = parseJSONSafe(headers[SKIP_HEADER.toLowerCase()] || "", "");
    const skipIdSet = new Set(isStringArray(skipParam) ? skipParam : []);

    // Query 파라미터 파싱
    const { query } = parseRscParams(rscParams);

    // 라우트 핸들러 실행
    const { rootElement, routeElement, elements } = await this.fns.handleRoute(
      pathname,
      pathConfigItem.specs.isStatic ? {} : { query },
    );

    // Element ID 검증
    if (
      Object.keys(elements).some((id) => id.startsWith(ROUTE_SLOT_ID_PREFIX))
    ) {
      throw new Error('Element ID cannot start with "route:"');
    }

    const entries = { ...elements };
    const decodedPathname = decodeURI(pathname);
    const routeId = ROUTE_SLOT_ID_PREFIX + decodedPathname;

    if (pathConfigItem.type === "route") {
      // static element ID들 중 클라이언트가 이미 가진 것들은 제외
      for (const id of pathConfigItem.specs.staticElementIds || []) {
        if (skipIdSet.has(id)) {
          delete entries[id];
        }
      }

      // rootElement: static이고 클라이언트가 이미 가지고 있으면 제외
      if (!pathConfigItem.specs.rootElementIsStatic || !skipIdSet.has("root")) {
        entries.root = rootElement;
      }

      // routeElement: static이고 클라이언트가 이미 가지고 있으면 제외
      if (
        !pathConfigItem.specs.routeElementIsStatic ||
        !skipIdSet.has(routeId)
      ) {
        entries[routeId] = routeElement;
      }
    }

    // 메타데이터 추가
    entries[ROUTE_ID] = [decodedPathname, query];
    entries[IS_STATIC_ID] = !!pathConfigItem.specs.isStatic;

    // 404 페이지 존재 여부
    if (await this.configManager.has404()) {
      entries[HAS404_ID] = true;
    }

    return entries;
  }
}
