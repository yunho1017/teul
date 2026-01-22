"use client";

import { createContext, memo } from "react";
import type { ReactNode } from "react";

export const ChildrenContext = createContext<ReactNode>(undefined);
export const ChildrenContextProvider = memo(ChildrenContext);
