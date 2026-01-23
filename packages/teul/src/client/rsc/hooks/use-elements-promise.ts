import { use } from "react";
import { ElementsContext } from "../contexts/elements-context.js";

export const useElementsPromise = () => {
  const elementsPromise = use(ElementsContext);
  if (!elementsPromise) {
    throw new Error("Missing Root component");
  }
  return elementsPromise;
};
