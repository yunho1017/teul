import type { ReactNode } from "react";
import type { TeulConfig } from "./config.js";

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
    body: ReadableStream | string,
  ) => Promise<void>;
  generateDefaultHtml: (pathname: string) => Promise<void>;
}) => Promise<void>;

export type ServerEntry = {
  fetch: (req: Request, ...args: any[]) => Response | Promise<Response>;
  build: (
    utils: {
      emitFile: EmitFile;
    },
    ...args: any[]
  ) => Promise<void>;
  buildOptions?: Record<string, unknown>;
  buildEnhancers?: string[];
  [someOtherProperty: string]: unknown;
};

export type EmitFile = (
  filePath: string,
  body: ReadableStream | string,
) => Promise<void>;

export type Handlers = {
  handleRequest: HandleRequest;
  handleBuild: HandleBuild;
  [someOtherProperty: string]: unknown;
};

export type ProcessRequest = (req: Request) => Promise<Response | null>;

export type ProcessBuild = (utils: { emitFile: EmitFile }) => Promise<void>;

export type CreateServerEntryAdapter = <Options>(
  fn: (
    args: {
      handlers: Handlers;
      processRequest: ProcessRequest;
      processBuild: ProcessBuild;
      config: Omit<Required<TeulConfig>, "vite">;
      isBuild: boolean;
      notFoundHtml: string;
    },
    options?: Options,
  ) => ServerEntry,
) => (handlers: Handlers, options?: Options) => ServerEntry;
