"use client";

import { use } from "react";
import type { ReactNode } from "react";
import { useElementsPromise } from "./hooks/use-elements-promise.js";
import { ChildrenContextProvider } from "./contexts/children-context.js";

const SlotElementWrapper = (props: { children: ReactNode }) => props.children;

export interface SlotProps {
  id: string;
  children?: ReactNode;
}

export function Slot({ id, children }: SlotProps) {
  const elementsPromise = useElementsPromise();
  const elements = use(elementsPromise);

  if (id in elements && elements[id] === undefined) {
    throw new Error("Element cannot be undefined, use null instead: " + id);
  }

  const element = elements[id];
  const isValidElement = element !== undefined;

  if (!isValidElement) {
    throw new Error("Invalid element: " + id);
  }

  return (
    <ChildrenContextProvider value={children}>
      <SlotElementWrapper>{element as ReactNode}</SlotElementWrapper>
    </ChildrenContextProvider>
  );
}
