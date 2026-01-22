import type { ReactNode } from "react";
import { ElementsContext } from "../client/rsc/contexts/elements-context.js";

const DEFAULT_HTML_HEAD = [
  <meta key="charset" charSet="utf-8" />,
  <meta
    key="viewport"
    name="viewport"
    content="width=device-width, initial-scale=1"
  />,
];

type Elements = Record<string, unknown>;

export interface RootProps {
  elementsPromise: Promise<Elements>;
  children: ReactNode;
}

export function Root({ elementsPromise, children }: RootProps) {
  return (
    <ElementsContext.Provider value={elementsPromise}>
      {DEFAULT_HTML_HEAD}
      {children}
    </ElementsContext.Provider>
  );
}
