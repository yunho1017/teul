"use client";

import { createContext } from "react";

export const RefetchContext = createContext<
  (rscPath: string, rscParams?: unknown) => Promise<void>
>(() => {
  throw new Error("Missing Root component");
});
