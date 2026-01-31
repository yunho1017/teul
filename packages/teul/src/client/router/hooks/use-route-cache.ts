import { useRef, useEffect } from "react";
import { useElementsPromise } from "../../rsc/hooks/use-elements-promise.js";
import { ROUTE_ID, IS_STATIC_ID } from "../../../server/router/utils.js";

export function useRouteCache() {
  const staticPathsRef = useRef(new Set<string>());
  const cachedIdsRef = useRef(new Set<string>());
  const elementsPromise = useElementsPromise();

  useEffect(() => {
    elementsPromise.then(
      (elements) => {
        const {
          [ROUTE_ID]: routeData,
          [IS_STATIC_ID]: isStatic,
          ...rest
        } = elements;

        if (routeData && isStatic) {
          const [path] = routeData as [string, string];
          staticPathsRef.current.add(path);
        }

        cachedIdsRef.current = new Set(Object.keys(rest));
      },
      () => {},
    );
  }, [elementsPromise]);

  return {
    staticPaths: staticPathsRef.current,
    cachedIds: cachedIdsRef.current,
  };
}
