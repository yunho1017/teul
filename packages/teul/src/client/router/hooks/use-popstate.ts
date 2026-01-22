import { useEffect } from "react";
import type { ChangeRoute } from "../contexts/router-context.js";
import { parseRoute } from "../utils/parse-route.js";

export function usePopstate(changeRoute: ChangeRoute) {
  useEffect(() => {
    const callback = () => {
      const route = parseRoute(new URL(window.location.href));
      changeRoute(route, { shouldScroll: true }).catch((err) => {
        console.log("Error while navigating back:", err);
      });
    };
    window.addEventListener("popstate", callback);
    return () => {
      window.removeEventListener("popstate", callback);
    };
  }, [changeRoute]);
}
