"use client";

import { createContext } from "react";

type Elements = Record<string, unknown>;

type FetchRscInternal = (
  rscPath: string,
  rscParams: unknown,
  fetchFn?: typeof fetch,
) => Promise<Elements>;

export type EnhanceFetchRscInternal = (
  fn: (fetchRscInternal: FetchRscInternal) => FetchRscInternal,
) => () => void;

export const EnhanceContext = createContext<EnhanceFetchRscInternal>(() => {
  throw new Error("Missing Root component");
});
