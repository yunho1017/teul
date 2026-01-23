import { useEffect } from "react";
import { useEnhanceFetchInternal } from "../../rsc/hooks/use-enhance-fetch-internal.js";
import { SKIP_HEADER } from "../../../server/router/common.js";

export function useFetchEnhancer(cachedIds: Set<string>) {
  const enhance = useEnhanceFetchInternal();

  useEffect(() => {
    const enhanceFetch =
      (fetchFn: typeof fetch) =>
      (input: RequestInfo | URL, init: RequestInit = {}) => {
        const skipStr = JSON.stringify(Array.from(cachedIds));
        const headers = (init.headers ||= {});
        if (Array.isArray(headers)) {
          headers.push([SKIP_HEADER, skipStr]);
        } else {
          (headers as Record<string, string>)[SKIP_HEADER] = skipStr;
        }
        return fetchFn(input, init);
      };

    return enhance((fetchInternal) => {
      return ((rscPath: string, rscParams: unknown, fetchFn = fetch) => {
        const enhancedFetch = enhanceFetch(fetchFn);
        return fetchInternal(rscPath, rscParams, enhancedFetch);
      }) as typeof fetchInternal;
    });
  }, [enhance, cachedIds]);
}
