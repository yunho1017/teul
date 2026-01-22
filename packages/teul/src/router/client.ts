"use client";

import type {
  AnchorHTMLAttributes,
  ComponentProps,
  FunctionComponent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
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
} from "react";

import {
  Root,
  Slot,
  useEnhanceFetchRscInternal_UNSTABLE as useEnhanceFetchRscInternal,
  useElementsPromise_UNSTABLE as useElementsPromise,
  useRefetch,
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

/**
 * Router Context (내부용)
 */
const RouterContext = createContext<{
  route: RouteProps;
  changeRoute: ChangeRoute;
} | null>(null);

/**
 * useRouter Hook - 라우팅 제어
 */
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

export type LinkProps = {
  to: string;
  children: ReactNode;
  scroll?: boolean;
  ref?: Ref<HTMLAnchorElement> | undefined;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/**
 * Link 컴포넌트 - 클라이언트 사이드 네비게이션
 * TODO: prefetched 기능
 */
export function Link({
  to,
  children,
  scroll,
  ref: refProp,
  ...props
}: LinkProps): ReactElement {
  const router = useContext(RouterContext);
  const changeRoute = router
    ? router.changeRoute
    : () => {
        throw new Error("Missing Router");
      };

  const startTransitionFn = (fn: TransitionFunction) => fn();

  const internalOnClick = () => {
    const url = new URL(to, window.location.href);
    if (url.href !== window.location.href) {
      const route = parseRoute(url);
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

  const ele = createElement("a", { ...props, href: to, onClick }, children);

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
      return ((rscPath: string, rscParams: unknown, fetchFn = fetch) => {
        const enhancedFetch = enhanceFetch(fetchFn);
        return fetchRscInternal(rscPath, rscParams, enhancedFetch);
      }) as typeof fetchRscInternal;
    });
  }, [enhanceFetchRscInternal]);

  const refetch = useRefetch();
  const [route, setRoute] = useState(() => ({
    ...initialRoute,
    hash: "", // SSR hydration 에러 방지
  }));

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

  const [err, setErr] = useState<unknown>(null);

  const changeRoute: ChangeRoute = useCallback(
    async (route, options) => {
      const startTransitionFn = (fn: TransitionFunction) => fn();
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
      });
    },
    [refetch],
  );

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
        },
      },
      rootElement,
    ),
  );
}
