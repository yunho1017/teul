"use client";

import {
  createContext,
  createElement,
  memo,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
// @ts-expect-error - react-server-dom-webpack doesn't have types
import RSDWClient from "react-server-dom-webpack/client";
import { encodeRscPath } from "../utils/path.js";

const { createFromFetch, encodeReply, createTemporaryReferenceSet } =
  RSDWClient;

const DEFAULT_HTML_HEAD = [
  createElement("meta", { charSet: "utf-8" }),
  createElement("meta", {
    name: "viewport",
    content: "width=device-width, initial-scale=1",
  }),
];

const BASE_RSC_PATH = `${import.meta.env?.VITE_CONFIG_BASE_PATH || ""}/RSC/`;

/**
 * RSC 응답 상태 체크
 */
const checkStatus = async (
  responsePromise: Promise<Response>,
): Promise<Response> => {
  const response = await responsePromise;
  if (!response.ok) {
    throw new Error(
      (await response.text()) ||
        `HTTP ${response.status}: ${response.statusText}`,
    );
  }
  return response;
};

type Elements = Record<string, unknown>;

/**
 * Elements Promise 병합 유틸
 */
const getCached = <T>(c: () => T, m: WeakMap<object, T>, k: object): T =>
  (m.has(k) ? m : m.set(k, c())).get(k) as T;

const cache1 = new WeakMap();
const mergeElementsPromise = (
  a: Promise<Elements>,
  b: Promise<Elements> | Elements,
): Promise<Elements> => {
  const getResult = () =>
    Promise.all([a, b]).then(([a, b]) => {
      const nextElements = { ...a, ...b };
      delete nextElements._value;
      return nextElements;
    });
  const cache2 = getCached(() => new WeakMap(), cache1, a);
  return getCached(getResult, cache2, b);
};

type SetElements = (
  updater: (prev: Promise<Elements>) => Promise<Elements>,
) => void;

const ENTRY = "e";
const SET_ELEMENTS = "s";
const FETCH_RSC_INTERNAL = "f";

type FetchRscInternal = (
  rscPath: string,
  rscParams: unknown,
  fetchFn?: typeof fetch,
) => Promise<Elements>;

type FetchCache = {
  [ENTRY]?: [
    rscPath: string,
    rscParams: unknown,
    elementsPromise: Promise<Elements>,
  ];
  [SET_ELEMENTS]?: SetElements;
  [FETCH_RSC_INTERNAL]?: FetchRscInternal;
};

const defaultFetchCache: FetchCache = {};

/**
 * RSC 페칭 함수 생성
 */
const createFetchRscInternal =
  (fetchCache: FetchCache): FetchRscInternal =>
  (rscPath: string, rscParams: unknown, fetchFn = fetch) => {
    const temporaryReferences = createTemporaryReferenceSet();
    const url = BASE_RSC_PATH + encodeRscPath(rscPath);
    const responsePromise =
      rscParams === undefined
        ? fetchFn(url)
        : rscParams instanceof URLSearchParams
          ? fetchFn(url + "?" + rscParams)
          : encodeReply(rscParams, { temporaryReferences }).then(
              (body: string) => fetchFn(url, { method: "POST", body }),
            );

    return createFromFetch<Elements>(checkStatus(responsePromise), {
      callServer: (funcId: string, args: unknown[]) =>
        unstable_callServerRsc(funcId, args, fetchCache),
      temporaryReferences,
    });
  };

/**
 * Server Function 호출
 */
export const unstable_callServerRsc = async (
  funcId: string,
  args: unknown[],
  fetchCache = defaultFetchCache,
) => {
  const setElements = fetchCache[SET_ELEMENTS]!;
  const fetchRscInternal = fetchCache[FETCH_RSC_INTERNAL]!;
  const rscPath = funcId;
  const rscParams =
    args.length === 1 && args[0] instanceof URLSearchParams ? args[0] : args;
  const { _value: value, ...data } = await fetchRscInternal(rscPath, rscParams);
  if (Object.keys(data).length) {
    startTransition(() => {
      setElements((prev) => mergeElementsPromise(prev, data));
    });
  }
  return value;
};

/**
 * RSC 페칭
 */
export const fetchRsc = (
  rscPath: string,
  rscParams?: unknown,
  fetchCache = defaultFetchCache,
): Promise<Elements> => {
  const fetchRscInternal = fetchCache[FETCH_RSC_INTERNAL]!;
  const entry = fetchCache[ENTRY];
  if (entry && entry[0] === rscPath && entry[1] === rscParams) {
    return entry[2];
  }
  const data = fetchRscInternal(rscPath, rscParams);
  fetchCache[ENTRY] = [rscPath, rscParams, data];
  return data;
};


const RefetchContext = createContext<
  (rscPath: string, rscParams?: unknown) => Promise<void>
>(() => {
  throw new Error("Missing Root component");
});
const ElementsContext = createContext<Promise<Elements> | null>(null);

type EnhanceFetchRscInternal = (
  fn: (fetchRscInternal: FetchRscInternal) => FetchRscInternal,
) => () => void;

const EnhanceFetchRscInternalContext = createContext<EnhanceFetchRscInternal>(
  () => {
    throw new Error("Missing Root component");
  },
);

export const useEnhanceFetchRscInternal_UNSTABLE = () =>
  use(EnhanceFetchRscInternalContext);

/**
 * RSC Root 컴포넌트
 */
export const Root = ({
  initialRscPath,
  initialRscParams,
  fetchCache = defaultFetchCache,
  children,
}: {
  initialRscPath?: string;
  initialRscParams?: unknown;
  fetchCache?: FetchCache;
  children: ReactNode;
}) => {
  fetchCache[FETCH_RSC_INTERNAL] ||= createFetchRscInternal(fetchCache);
  const enhanceFetchRscInternal: EnhanceFetchRscInternal = useMemo(() => {
    const enhancers = new Set<Parameters<EnhanceFetchRscInternal>[0]>();
    const enhance = () => {
      let fetchRscInternal = createFetchRscInternal(fetchCache);
      for (const fn of enhancers) {
        fetchRscInternal = fn(fetchRscInternal);
      }
      fetchCache[FETCH_RSC_INTERNAL] = fetchRscInternal;
    };
    return (fn) => {
      enhancers.add(fn);
      enhance();
      return () => {
        enhancers.delete(fn);
        enhance();
      };
    };
  }, [fetchCache]);

  const [elements, setElements] = useState(() =>
    fetchRsc(initialRscPath || "", initialRscParams, fetchCache),
  );

  useEffect(() => {
    fetchCache[SET_ELEMENTS] = setElements;
  }, [fetchCache]);

  const refetch = useCallback(
    async (rscPath: string, rscParams?: unknown) => {
      // clear cache entry before fetching
      delete fetchCache[ENTRY];
      const data = fetchRsc(rscPath, rscParams, fetchCache);
      const dataWithoutErrors = Promise.resolve(data).catch(() => ({}));
      setElements((prev) => mergeElementsPromise(prev, dataWithoutErrors));
      await data;
    },
    [fetchCache],
  );

  return createElement(
    EnhanceFetchRscInternalContext,
    { value: enhanceFetchRscInternal },
    createElement(
      RefetchContext,
      { value: refetch },
      createElement(
        ElementsContext,
        { value: elements },
        ...DEFAULT_HTML_HEAD,
        children,
      ),
    ),
  );
};

export const useRefetch = () => use(RefetchContext);

const ChildrenContext = createContext<ReactNode>(undefined);
const ChildrenContextProvider = memo(ChildrenContext);

export const Children = () => use(ChildrenContext);

export const useElementsPromise_UNSTABLE = () => {
  const elementsPromise = use(ElementsContext);
  if (!elementsPromise) {
    throw new Error("Missing Root component");
  }
  return elementsPromise;
};

/**
 * Slot 컴포넌트
 * Root 컴포넌트 아래에서 사용됩니다.
 * Slot id는 서버에서 반환된 elements의 키입니다.
 *
 * @example
 * 서버에서 { 'foo': <div>foo</div>, 'bar': <div>bar</div> }를 반환하면
 * <Root><Slot id="foo" /><Slot id="bar" /></Root> 처럼 사용할 수 있습니다
 */
export const Slot = ({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) => {
  const elementsPromise = useElementsPromise_UNSTABLE();
  const elements = use(elementsPromise);
  if (id in elements && elements[id] === undefined) {
    throw new Error("Element cannot be undefined, use null instead: " + id);
  }

  const element = elements[id];
  const isValidElement = element !== undefined;
  if (!isValidElement) {
    throw new Error("Invalid element: " + id);
  }
  return createElement(
    ChildrenContextProvider,
    { value: children },
    createElement(SlotElementWrapper, null, element as ReactNode),
  );
};

const SlotElementWrapper = (props: { children: ReactNode }) => props.children;

/**
 * SSR용 ServerRoot
 * Internal API
 */
export const INTERNAL_ServerRoot = ({
  elementsPromise,
  children,
}: {
  elementsPromise: Promise<Elements>;
  children: ReactNode;
}) =>
  createElement(
    ElementsContext,
    { value: elementsPromise },
    ...DEFAULT_HTML_HEAD,
    children,
  );
