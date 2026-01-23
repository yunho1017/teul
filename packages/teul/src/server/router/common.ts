import type { ServerEntry } from "../../types.js";

export type RouteProps<Path extends string = string> = {
  path: Path;
  query: string;
  hash: string;
};

/**
 * RSC 경로 인코딩에 사용되는 프리픽스
 * RSC 요청과 일반 경로를 구분하기 위해 사용
 */
const ROUTE_PREFIX = "R";

/**
 * RSC 경로를 실제 URL 경로로 디코딩합니다.
 *
 * @example
 * decodeRoutePath('R/blog') // → '/blog'
 * decodeRoutePath('R/_root') // → '/'
 * decodeRoutePath('R/__about') // → '/_about'
 */
export function decodeRoutePath(rscPath: string): string {
  if (!rscPath.startsWith(ROUTE_PREFIX)) {
    throw new Error("rscPath should start with: " + ROUTE_PREFIX);
  }
  // 루트 경로 특별 처리
  if (rscPath === ROUTE_PREFIX + "/_root") {
    return "/";
  }
  // 언더스코어로 시작하는 경로 처리 (/_about → R/__about)
  if (rscPath.startsWith(ROUTE_PREFIX + "/__")) {
    return "/_" + rscPath.slice(ROUTE_PREFIX.length + 3);
  }
  // 일반 경로 (프리픽스 제거)
  return rscPath.slice(ROUTE_PREFIX.length);
}

/**
 * 실제 URL 경로를 RSC 경로로 인코딩합니다.
 * decodeRoutePath의 반대 동작입니다.
 *
 * @example
 * encodeRoutePath('/blog') // → 'R/blog'
 * encodeRoutePath('/') // → 'R/_root'
 * encodeRoutePath('/_about') // → 'R/__about'
 */
export function encodeRoutePath(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error("Path must start with `/`: " + path);
  }
  if (path.length > 1 && path.endsWith("/")) {
    throw new Error("Path must not end with `/`: " + path);
  }
  // 루트 경로 특별 처리
  if (path === "/") {
    return ROUTE_PREFIX + "/_root";
  }
  // 언더스코어로 시작하는 경로 처리 (/_about → R/__about)
  if (path.startsWith("/_")) {
    return ROUTE_PREFIX + "/__" + path.slice(2);
  }
  // 일반 경로 (프리픽스 추가)
  return ROUTE_PREFIX + path;
}

/**
 * RSC entries 객체에서 현재 라우트 정보를 저장하는 키
 * 값: [pathname, query]
 * @example entries[ROUTE_ID] = ['/blog', 'page=1']
 */
export const ROUTE_ID = "ROUTE";

/**
 * RSC entries 객체에서 static 렌더링 여부를 저장하는 키
 * 값: boolean
 * @example entries[IS_STATIC_ID] = true
 */
export const IS_STATIC_ID = "IS_STATIC";

/**
 * RSC entries 객체에서 404 페이지 존재 여부를 저장하는 키
 * 값: boolean
 * @example entries[HAS404_ID] = true
 */
export const HAS404_ID = "HAS404";

/**
 * RSC 요청 헤더: 클라이언트가 이미 가지고 있는 element ID들을 전달
 * 서버는 이 ID들을 응답에서 제외하여 네트워크 전송량을 줄임
 */
export const SKIP_HEADER = "X-Teul-Skip";

export function defineServer(fns: ServerEntry["default"]) {
  return fns;
}
