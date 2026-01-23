/**
 * 주어진 비동기 함수를 한 번만 실행하도록 보장합니다.
 * 여러 번 호출되더라도 첫 번째 호출의 결과를 재사용합니다.
 *
 * @param fn - 한 번만 실행할 비동기 함수
 * @returns 첫 호출 시 fn을 실행하고, 이후 호출에서는 캐시된 Promise를 반환하는 함수
 *
 * @example
 * const fetchData = once(async () => {
 *   console.log('Fetching...');
 *   return await fetch('/api/data');
 * });
 *
 * // 첫 호출: "Fetching..." 출력 및 실제 fetch 실행
 * await fetchData();
 *
 * // 두 번째 호출: 캐시된 Promise 반환, "Fetching..." 출력 안 됨
 * await fetchData();
 */
export const once = <T>(fn: () => Promise<T>): (() => Promise<T>) => {
  let promise: Promise<T> | undefined;
  return () => {
    if (!promise) {
      promise = fn();
    }
    return promise;
  };
};
