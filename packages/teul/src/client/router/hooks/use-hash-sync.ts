import { useEffect } from "react";
import type { RouteProps } from "../../../server/router/utils.js";

export function useHashSync(
  initialRoute: RouteProps,
  setRoute: (updater: (prev: RouteProps) => RouteProps) => void,
) {
  useEffect(() => {
    setRoute((prev) => {
      if (
        prev.path === initialRoute.path &&
        prev.query === initialRoute.query &&
        prev.hash === initialRoute.hash
      ) {
        return prev;
      }
      return initialRoute;
    });
  }, [initialRoute, setRoute]);
}
