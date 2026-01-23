import type { PathSpec } from "../../../utils/path.js";

/**
 * RSC(React Server Components) 파라미터를 파싱하여 query 문자열을 추출합니다.
 *
 * @param rscParams - URLSearchParams 또는 query 속성을 가진 객체
 * @returns query 문자열을 포함한 객체
 *
 * @example
 * // URLSearchParams를 사용하는 경우
 * const params = new URLSearchParams('query=hello');
 * parseRscParams(params); // { query: 'hello' }
 *
 * @example
 * // 객체를 사용하는 경우
 * parseRscParams({ query: 'world' }); // { query: 'world' }
 *
 * @example
 * // 유효하지 않은 입력의 경우
 * parseRscParams(null); // { query: '' }
 */
export const parseRscParams = (
  rscParams: unknown,
): {
  query: string;
} => {
  if (rscParams instanceof URLSearchParams) {
    return { query: rscParams.get("query") || "" };
  }
  if (
    typeof (rscParams as { query?: undefined } | undefined)?.query === "string"
  ) {
    return { query: (rscParams as { query: string }).query };
  }
  return { query: "" };
};

/**
 * PathSpec을 pathname 문자열로 변환합니다.
 * 모든 PathSpec 항목이 'literal' 타입일 때만 pathname을 반환하며,
 * 동적 경로나 와일드카드가 포함된 경우 undefined를 반환합니다.
 *
 * @param pathSpec - 경로 스펙 배열
 * @returns pathname 문자열 또는 undefined (동적 경로가 포함된 경우)
 *
 * @example
 * // 모든 세그먼트가 literal인 경우
 * pathSpec2pathname([
 *   { type: 'literal', name: 'posts' },
 *   { type: 'literal', name: 'comments' }
 * ]); // '/posts/comments'
 *
 * @example
 * // 동적 세그먼트가 포함된 경우
 * pathSpec2pathname([
 *   { type: 'literal', name: 'posts' },
 *   { type: 'dynamic', name: 'id' }
 * ]); // undefined
 *
 * @example
 * // 빈 pathSpec의 경우
 * pathSpec2pathname([]); // '/'
 */
export const pathSpec2pathname = (pathSpec: PathSpec) => {
  if (pathSpec.some(({ type }) => type !== "literal")) {
    return undefined;
  }
  return "/" + pathSpec.map(({ name }) => name!).join("/");
};

/**
 * 주어진 값이 문자열 배열인지 확인하는 타입 가드 함수입니다.
 *
 * @param value - 검사할 값
 * @returns 값이 문자열 배열이면 true, 그렇지 않으면 false
 *
 * @example
 * // 문자열 배열인 경우
 * isStringArray(['a', 'b', 'c']); // true
 *
 * @example
 * // 혼합 타입 배열인 경우
 * isStringArray(['a', 1, 'c']); // false
 *
 * @example
 * // 배열이 아닌 경우
 * isStringArray('not an array'); // false
 *
 * @example
 * // 빈 배열인 경우
 * isStringArray([]); // true
 *
 * @example
 * // 타입 가드로 사용
 * const data: unknown = ['hello', 'world'];
 * if (isStringArray(data)) {
 *   // 이 블록 안에서 data는 string[] 타입으로 좁혀집니다
 *   data.forEach(str => console.log(str.toUpperCase()));
 * }
 */
export const isStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};
