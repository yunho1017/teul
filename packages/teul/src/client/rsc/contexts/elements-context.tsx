"use client";

import { createContext } from "react";

type Elements = Record<string, unknown>;

export const ElementsContext = createContext<Promise<Elements> | null>(null);
