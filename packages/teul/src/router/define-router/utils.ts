import type { PathSpec } from "../../utils/path.js";

export const parseRscParams = (
  rscParams: unknown,
): {
  query: string;
} => {
  if (rscParams instanceof URLSearchParams) {
    return { query: rscParams.get("query") || "" };
  }
  if (
    typeof (rscParams as { query?: undefined } | undefined)?.query === "string"
  ) {
    return { query: (rscParams as { query: string }).query };
  }
  return { query: "" };
};

export const pathSpec2pathname = (pathSpec: PathSpec) => {
  if (pathSpec.some(({ type }) => type !== "literal")) {
    return undefined;
  }
  return "/" + pathSpec.map(({ name }) => name!).join("/");
};

export const isStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};
