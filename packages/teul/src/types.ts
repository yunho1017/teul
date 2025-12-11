import type { ReactNode } from "react";

type Elements = Record<string, unknown>;

type RenderRsc = (elements: Record<string, unknown>) => Promise<ReadableStream>;

type RenderHtml = (
  elements: Elements,
  html: ReactNode,
  options: { rscPath: string; actionResult?: unknown; status?: number },
) => Promise<Response>;

export type HandleRequest = (
  input: (
    | { type: "component"; rscPath: string; rscParams: unknown }
    | {
        type: "function";
        fn: (...args: unknown[]) => Promise<unknown>;
        args: unknown[];
      }
    | {
        type: "action";
        fn: () => Promise<unknown>;
        pathname: string;
      }
    | { type: "custom"; pathname: string }
  ) & {
    req: Request;
  },
  utils: {
    renderRsc: RenderRsc;
    renderHtml: RenderHtml;
  },
) => Promise<ReadableStream | Response | "fallback" | null | undefined>;

export type HandleBuild = (utils: {
  renderRsc: RenderRsc;
  renderHtml: RenderHtml;
  rscPath2pathname: (rscPath: string) => string;
  generateFile: (
    pathname: string,
    body: Promise<ReadableStream | string>,
  ) => Promise<void>;
  generateDefaultHtml: (pathname: string) => Promise<void>;
}) => Promise<void>;

export type ServerEntry = {
  default: {
    handleRequest: HandleRequest;
    handleBuild: HandleBuild;
  };
};

/** @deprecated This will be removed soon. */
export type HandlerContext = {
  req: Request;
  res?: Response;
};
