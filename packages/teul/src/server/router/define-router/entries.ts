import { parseJSONSafe } from "../../../utils/json.js";
import {
  decodeRoutePath,
  HAS404_ID,
  IS_STATIC_ID,
  ROUTE_ID,
  SKIP_HEADER,
} from "../common.js";
import type { RouteConfigManager } from "./config.js";
import { ROUTE_SLOT_ID_PREFIX } from "./constants.js";
import type { DefineRouterFunctions } from "./types.js";
import { isStringArray, parseRscParams } from "./utils.js";

/**
 * 라우트 엔트리를 관리하는 클래스
 *
 * 라우트 요청에 맞는 엔트리를 가져와서 렌더링에 필요한 요소들을 반환합니다.
 */
export class EntriesManager {
  constructor(
    private fns: DefineRouterFunctions,
    private routeConfigManager: RouteConfigManager,
  ) {}

  /**
   * 라우트 요청에 맞는 엔트리를 가져옵니다.
   *
   * 이를 통해 renderRsc, renderHtml 함수에서 스트림 형태로 변환되어 사용됩니다.
   *
   * @param rscPath - RSC 경로
   * @param rscParams - RSC 파라미터
   * @param headers - 요청 헤더 (SKIP_HEADER 포함)
   * @returns 렌더링할 엔트리 객체 또는 null (경로를 찾을 수 없는 경우)
   * @see packages/teul/src/vite/utils/render.ts - renderRsc, renderHtml 함수 참조
   */
  async getEntries(
    rscPath: string,
    rscParams: unknown,
    headers: Readonly<Record<string, string>>,
  ) {
    const pathname = decodeRoutePath(rscPath);
    const pathConfigItem =
      await this.routeConfigManager.getConfigItemByPath(pathname);

    if (!pathConfigItem) {
      return null;
    }

    /**
     * SKIP_HEADER를 통해 클라이언트가 이미 가지고 있는 element ID를 파싱합니다.
     * 이미 있는 엘리먼트는 렌더링할 엔트리에서 제외됩니다.
     *
     * @see packages/teul/src/client/router/hooks/use-fetch-enhancer.ts
     */
    let skipParam = parseJSONSafe(headers[SKIP_HEADER.toLowerCase()] || "", "");
    const skipIdSet = new Set(isStringArray(skipParam) ? skipParam : []);
    const { query } = parseRscParams(rscParams);

    /**
     * pathname과 query를 전달하여 렌더링해야 하는 엘리먼트를 가져옵니다.
     *
     * @see create-pages handleRoute 구현체 참조
     */
    const { rootElement, routeElement, elements } = await this.fns.handleRoute(
      pathname,
      pathConfigItem.specs.isStatic ? {} : { query },
    );

    /**
     * Element ID 검증
     * ROUTE_SLOT_ID_PREFIX로 시작하는 엘리먼트가 이미 있는지 확인합니다.
     */
    if (
      Object.keys(elements).some((id) => id.startsWith(ROUTE_SLOT_ID_PREFIX))
    ) {
      throw new Error('Element ID cannot start with "route:"');
    }

    const entries = { ...elements };
    const decodedPathname = decodeURI(pathname);
    const routeId = ROUTE_SLOT_ID_PREFIX + decodedPathname;

    /**
     * 현재는 타입이 route 하나만 지원됩니다.
     *
     * @todo API/Slice 타입이 추가될 예정입니다.
     * @see packages/teul/src/server/router/define-router/config.ts
     */
    if (pathConfigItem.type === "route") {
      /**
       * 클라이언트가 이미 가지고 있는 정적 엘리먼트는 엔트리에서 제거합니다.
       */
      for (const id of pathConfigItem.specs.staticElementIds || []) {
        if (skipIdSet.has(id)) {
          delete entries[id];
        }
      }

      /**
       * rootElement 처리
       * 정적이고 클라이언트가 이미 가지고 있으면 건너뜁니다.
       */
      if (!pathConfigItem.specs.rootElementIsStatic || !skipIdSet.has("root")) {
        entries.root = rootElement;
      }

      /**
       * routeElement 처리
       * 정적이고 클라이언트가 이미 가지고 있으면 건너뜁니다.
       */
      if (
        !pathConfigItem.specs.routeElementIsStatic ||
        !skipIdSet.has(routeId)
      ) {
        entries[routeId] = routeElement;
      }
    }

    /**
     * 메타데이터를 엔트리에 추가합니다.
     */
    entries[ROUTE_ID] = [decodedPathname, query];
    entries[IS_STATIC_ID] = !!pathConfigItem.specs.isStatic;
    if (await this.routeConfigManager.has404()) {
      entries[HAS404_ID] = true;
    }

    return entries;
  }
}
