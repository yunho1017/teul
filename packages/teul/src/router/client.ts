"use client";

import type {
  AnchorHTMLAttributes,
  ComponentProps,
  FunctionComponent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
  TransitionFunction,
} from "react";
import {
  Component,
  createContext,
  createElement,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  prefetchRsc,
  Root,
  Slot,
  useRefetch,
  useEnhanceFetchRscInternal_UNSTABLE as useEnhanceFetchRscInternal,
  useElementsPromise_UNSTABLE as useElementsPromise,
} from "../minimal/client.js";
import type { RouteProps } from "./common.js";
import {
  encodeRoutePath,
  IS_STATIC_ID,
  ROUTE_ID,
  SKIP_HEADER,
} from "./common.js";

/**
 * 경로 정규화: /index.html, trailing slash 제거
 */
const normalizeRoutePath = (path: string) => {
  for (const suffix of ["/", "/index.html"]) {
    if (path.endsWith(suffix)) {
      return path.slice(0, -suffix.length) || "/";
    }
  }
  return path;
};

/**
 * URL을 RouteProps로 파싱
 */
const parseRoute = (url: URL): RouteProps => {
  const { pathname, searchParams, hash } = url;
  return {
    path: normalizeRoutePath(pathname),
    query: searchParams.toString(),
    hash,
  };
};

/**
 * 현재 브라우저 location을 RouteProps로 파싱
 */
const parseRouteFromLocation = (): RouteProps => {
  return parseRoute(new URL(window.location.href));
};

/**
 * Alt/Cmd/Ctrl 클릭 감지 (새 탭 열기 등)
 */
const isAltClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button !== 0 ||
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

/**
 * Query를 RSC params로 변환 (캐싱)
 */
let savedRscParams: [query: string, rscParams: URLSearchParams] | undefined;

const createRscParams = (query: string): URLSearchParams => {
  if (savedRscParams && savedRscParams[0] === query) {
    return savedRscParams[1];
  }
  const rscParams = new URLSearchParams({ query });
  savedRscParams = [query, rscParams];
  return rscParams;
};

type ChangeRoute = (
  route: RouteProps,
  options: {
    shouldScroll: boolean;
    skipRefetch?: boolean;
    unstable_startTransition?: ((fn: TransitionFunction) => void) | undefined;
  },
) => Promise<void>;

type PrefetchRoute = (route: RouteProps) => void;

type ChangeRouteEvent = "start" | "complete";
type ChangeRouteCallback = (route: RouteProps) => void;

/**
 * Router Context (내부용)
 */
const RouterContext = createContext<{
  route: RouteProps;
  changeRoute: ChangeRoute;
  prefetchRoute: PrefetchRoute;
  routeChangeEvents: Record<
    "on" | "off",
    (event: ChangeRouteEvent, handler: ChangeRouteCallback) => void
  >;
} | null>(null);

/**
 * useRouter Hook - 라우팅 제어
 */
export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("Missing Router");
  }

  const { route, changeRoute, prefetchRoute } = router;

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

  const prefetch = useCallback(
    (to: string) => {
      const url = new URL(to, window.location.href);
      prefetchRoute(parseRoute(url));
    },
    [prefetchRoute],
  );

  return {
    ...route,
    push,
    replace,
    reload,
    back,
    forward,
    prefetch,
    unstable_events: router.routeChangeEvents,
  };
}

/**
 * Ref 공유 헬퍼 (Link ref 처리용)
 */
function useSharedRef<T>(
  ref: Ref<T | null> | undefined,
): [RefObject<T | null>, (node: T | null) => void] {
  const managedRef = useRef<T>(null);

  const handleRef = useCallback(
    (node: T | null): void => {
      managedRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  return [managedRef, handleRef];
}

export type LinkProps = {
  to: string;
  children: ReactNode;
  scroll?: boolean;
  unstable_pending?: ReactNode;
  unstable_prefetchOnEnter?: boolean;
  unstable_prefetchOnView?: boolean;
  unstable_startTransition?: ((fn: TransitionFunction) => void) | undefined;
  ref?: Ref<HTMLAnchorElement> | undefined;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/**
 * Link 컴포넌트 - 클라이언트 사이드 네비게이션
 */
export function Link({
  to,
  children,
  scroll,
  unstable_pending,
  unstable_prefetchOnEnter,
  unstable_prefetchOnView,
  unstable_startTransition,
  ref: refProp,
  ...props
}: LinkProps): ReactElement {
  const router = useContext(RouterContext);
  const changeRoute = router
    ? router.changeRoute
    : () => {
        throw new Error("Missing Router");
      };
  const prefetchRoute = router
    ? router.prefetchRoute
    : () => {
        throw new Error("Missing Router");
      };

  const [isPending, startTransition] = useTransition();
  const startTransitionFn =
    unstable_startTransition ||
    (unstable_pending && startTransition) ||
    ((fn: TransitionFunction) => fn());
  const [ref, setRef] = useSharedRef<HTMLAnchorElement>(refProp);

  useEffect(() => {
    if (unstable_prefetchOnView && ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const url = new URL(to, window.location.href);
              if (router && url.href !== window.location.href) {
                const route = parseRoute(url);
                router.prefetchRoute(route);
              }
            }
          });
        },
        { threshold: 0.1 },
      );

      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [unstable_prefetchOnView, router, to, ref]);

  const internalOnClick = () => {
    const url = new URL(to, window.location.href);
    if (url.href !== window.location.href) {
      const route = parseRoute(url);
      prefetchRoute(route);
      startTransitionFn(async () => {
        const currentPath = window.location.pathname;
        const newPath = url.pathname !== currentPath;
        try {
          await changeRoute(route, {
            shouldScroll: scroll ?? newPath,
          });
        } finally {
          if (window.location.pathname === currentPath) {
            window.history.pushState(null, "", url);
          }
        }
      });
    }
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (props.onClick) {
      props.onClick(event);
    }
    if (!event.defaultPrevented && !isAltClick(event)) {
      event.preventDefault();
      internalOnClick();
    }
  };

  const onMouseEnter = unstable_prefetchOnEnter
    ? (event: MouseEvent<HTMLAnchorElement>) => {
        const url = new URL(to, window.location.href);
        if (url.href !== window.location.href) {
          const route = parseRoute(url);
          prefetchRoute(route);
        }
        props.onMouseEnter?.(event);
      }
    : props.onMouseEnter;

  const ele = createElement(
    "a",
    { ...props, href: to, onClick, onMouseEnter, ref: setRef },
    children,
  );

  if (isPending && unstable_pending !== undefined) {
    return createElement(Fragment, null, ele, unstable_pending);
  }

  return ele;
}

/**
 * 에러 렌더링 헬퍼
 */
function renderError(message: string) {
  return createElement(
    "html",
    null,
    createElement("body", null, createElement("h1", null, message)),
  );
}

/**
 * 기본 Error Boundary
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error?: unknown }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {};
  }
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  render() {
    if ("error" in this.state) {
      if (this.state.error instanceof Error) {
        return renderError(this.state.error.message);
      }
      return renderError(String(this.state.error));
    }
    return this.props.children;
  }
}

/**
 * 스크롤 처리
 */
const handleScroll = () => {
  const { hash } = window.location;
  const element = hash && document.getElementById(hash.slice(1));
  window.scrollTo({
    left: 0,
    top: element ? element.getBoundingClientRect().top + window.scrollY : 0,
    behavior: "instant",
  });
};

const getRouteSlotId = (path: string) => "route:" + decodeURI(path);

/**
 * 내부 Router 컴포넌트
 */
const InnerRouter = ({ initialRoute }: { initialRoute: RouteProps }) => {
  const requestedRouteRef = useRef<RouteProps>(initialRoute);
  const staticPathSetRef = useRef(new Set<string>());
  const cachedIdSetRef = useRef(new Set<string>());

  const elementsPromise = useElementsPromise();
  const enhanceFetchRscInternal = useEnhanceFetchRscInternal();

  // Elements에서 캐시된 ID들을 추적
  useEffect(() => {
    elementsPromise.then(
      (elements) => {
        const {
          [ROUTE_ID]: routeData,
          [IS_STATIC_ID]: isStatic,
          ...rest
        } = elements;
        if (routeData) {
          const [path] = routeData as [string, string];
          if (isStatic) {
            staticPathSetRef.current.add(path);
          }
        }
        cachedIdSetRef.current = new Set(Object.keys(rest));
      },
      () => {},
    );
  }, [elementsPromise]);

  // Fetch에 SKIP_HEADER 추가
  useEffect(() => {
    const enhanceFetch =
      (fetchFn: typeof fetch) =>
      (input: RequestInfo | URL, init: RequestInit = {}) => {
        const skipStr = JSON.stringify(Array.from(cachedIdSetRef.current));
        const headers = (init.headers ||= {});
        if (Array.isArray(headers)) {
          headers.push([SKIP_HEADER, skipStr]);
        } else {
          (headers as Record<string, string>)[SKIP_HEADER] = skipStr;
        }
        return fetchFn(input, init);
      };
    return enhanceFetchRscInternal((fetchRscInternal) => {
      return ((
        rscPath: string,
        rscParams: unknown,
        prefetchOnly?: any,
        fetchFn = fetch,
      ) => {
        const enhancedFetch = enhanceFetch(fetchFn);
        return fetchRscInternal(
          rscPath,
          rscParams,
          prefetchOnly as undefined,
          enhancedFetch,
        );
      }) as typeof fetchRscInternal;
    });
  }, [enhanceFetchRscInternal]);

  const refetch = useRefetch();
  const [route, setRoute] = useState(() => ({
    ...initialRoute,
    hash: "", // SSR hydration 에러 방지
  }));

  // Route change events 설정
  const routeChangeListenersRef =
    useRef<
      [
        Record<
          "on" | "off",
          (event: ChangeRouteEvent, handler: ChangeRouteCallback) => void
        >,
        (
          eventType: ChangeRouteEvent,
          eventRoute: Parameters<ChangeRouteCallback>[0],
        ) => void,
      ]
    >(null);

  if (routeChangeListenersRef.current === null) {
    const listeners: Record<ChangeRouteEvent, Set<ChangeRouteCallback>> = {
      start: new Set(),
      complete: new Set(),
    };

    const executeListeners = (
      eventType: ChangeRouteEvent,
      eventRoute: Parameters<ChangeRouteCallback>[0],
    ) => {
      const eventListenersSet = listeners[eventType];
      if (!eventListenersSet.size) {
        return;
      }
      for (const listener of eventListenersSet) {
        listener(eventRoute);
      }
    };

    const events = (() => {
      const on = (event: ChangeRouteEvent, handler: ChangeRouteCallback) => {
        listeners[event].add(handler);
      };
      const off = (event: ChangeRouteEvent, handler: ChangeRouteCallback) => {
        listeners[event].delete(handler);
      };
      return { on, off };
    })();

    routeChangeListenersRef.current = [events, executeListeners];
  }

  // Hash 포함한 실제 route로 업데이트
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
  }, [initialRoute]);

  const [routeChangeEvents, executeListeners] = routeChangeListenersRef.current;
  const [err, setErr] = useState<unknown>(null);

  const changeRoute: ChangeRoute = useCallback(
    async (route, options) => {
      requestedRouteRef.current = route;
      executeListeners("start", route);
      const startTransitionFn =
        options.unstable_startTransition || ((fn: TransitionFunction) => fn());
      setErr(null);

      const { skipRefetch } = options || {};
      if (!staticPathSetRef.current.has(route.path) && !skipRefetch) {
        const rscPath = encodeRoutePath(route.path);
        const rscParams = createRscParams(route.query);
        try {
          await refetch(rscPath, rscParams);
        } catch (e) {
          setErr(e);
          throw e;
        }
      }

      startTransitionFn(() => {
        if (options.shouldScroll) {
          handleScroll();
        }
        setRoute(route);
        executeListeners("complete", route);
      });
    },
    [executeListeners, refetch],
  );

  const prefetchRoute: PrefetchRoute = useCallback((route) => {
    if (staticPathSetRef.current.has(route.path)) {
      return;
    }
    const rscPath = encodeRoutePath(route.path);
    const rscParams = createRscParams(route.query);
    prefetchRsc(rscPath, rscParams);
  }, []);

  // Popstate (뒤로가기/앞으로가기)
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

  const routeElement =
    err !== null
      ? createElement("h1", null, "Error: " + String(err))
      : createElement(Slot, { id: getRouteSlotId(route.path) });

  const rootElement = createElement(Slot, { id: "root" }, routeElement);

  return createElement(
    RouterContext,
    {
      value: {
        route,
        changeRoute,
        prefetchRoute,
        routeChangeEvents,
      },
    },
    rootElement,
  );
};

/**
 * 메인 Router 컴포넌트
 */
export function Router({
  initialRoute = parseRouteFromLocation(),
}: {
  initialRoute?: RouteProps;
}) {
  const initialRscPath = encodeRoutePath(initialRoute.path);
  const initialRscParams = createRscParams(initialRoute.query);

  return createElement(
    Root as FunctionComponent<Omit<ComponentProps<typeof Root>, "children">>,
    {
      initialRscPath,
      initialRscParams,
    },
    createElement(InnerRouter, { initialRoute }),
  );
}

const notAvailableInServer = (name: string) => () => {
  throw new Error(`${name} is not in the server`);
};

const MOCK_ROUTE_CHANGE_LISTENER: Record<
  "on" | "off",
  (event: ChangeRouteEvent, handler: ChangeRouteCallback) => void
> = {
  on: () => notAvailableInServer("routeChange:on"),
  off: () => notAvailableInServer("routeChange:off"),
};

/**
 * ServerRouter (SSR용, 내부 API)
 */
export function INTERNAL_ServerRouter({
  route,
  httpstatus,
}: {
  route: RouteProps;
  httpstatus: number;
}) {
  const routeElement = createElement(Slot, { id: getRouteSlotId(route.path) });
  const rootElement = createElement(
    Slot,
    { id: "root" },
    createElement("meta", { name: "httpstatus", content: `${httpstatus}` }),
    routeElement,
  );

  return createElement(
    Fragment,
    null,
    createElement(
      RouterContext,
      {
        value: {
          route,
          changeRoute: notAvailableInServer("changeRoute"),
          prefetchRoute: notAvailableInServer("prefetchRoute"),
          routeChangeEvents: MOCK_ROUTE_CHANGE_LISTENER,
        },
      },
      rootElement,
    ),
  );
}
