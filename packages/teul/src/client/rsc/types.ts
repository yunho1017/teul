export type Elements = Record<string, unknown>;

export type SetElements = (
  updater: (prev: Promise<Elements>) => Promise<Elements>,
) => void;

export type FetchRscInternal = (
  rscPath: string,
  rscParams: unknown,
  fetchFn?: typeof fetch,
) => Promise<Elements>;

export interface FetchCache {
  entry?: CacheEntry;
  setElements?: SetElements;
  fetchInternal?: FetchRscInternal;
}

export interface CacheEntry {
  rscPath: string;
  rscParams: unknown;
  elementsPromise: Promise<Elements>;
}
