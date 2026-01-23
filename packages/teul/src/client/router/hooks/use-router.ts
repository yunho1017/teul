import { useContext, useCallback } from "react";
import { RouterContext } from "../contexts/router-context.js";
import { parseRoute } from "../utils/parse-route.js";

export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("Missing Router");
  }

  const { route, changeRoute } = router;

  const push = useCallback(
    async (to: string, options?: { scroll?: boolean }) => {
      const url = new URL(to, window.location.href);
      const currentPath = window.location.pathname;
      const newPath = url.pathname !== currentPath;
      await changeRoute(parseRoute(url), {
        shouldScroll: options?.scroll ?? newPath,
      });
      if (window.location.pathname === currentPath) {
        window.history.pushState(null, "", url);
      }
    },
    [changeRoute],
  );

  const replace = useCallback(
    async (to: string, options?: { scroll?: boolean }) => {
      const url = new URL(to, window.location.href);
      const currentPath = window.location.pathname;
      const newPath = url.pathname !== currentPath;
      await changeRoute(parseRoute(url), {
        shouldScroll: options?.scroll ?? newPath,
      });
      if (window.location.pathname === currentPath) {
        window.history.replaceState(null, "", url);
      }
    },
    [changeRoute],
  );

  const reload = useCallback(async () => {
    const url = new URL(window.location.href);
    await changeRoute(parseRoute(url), { shouldScroll: true });
  }, [changeRoute]);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  return {
    ...route,
    push,
    replace,
    reload,
    back,
    forward,
  };
}
