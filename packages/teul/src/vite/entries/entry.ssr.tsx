/// <reference types="vite/client" />
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream } from "react-dom/server.edge";
import { captureOwnerStack, use, type ReactNode } from "react";
import type { ReactFormState } from "react-dom/client";
import { injectRSCPayload } from "rsc-html-stream/server";
import { loadBootstrapScriptContent } from "../utils/vite.js";
import { Root } from "../../router-server.js";
import fallbackHtml from "virtual:vite-rsc-teul/fallback-html";
import { logger } from "../../utils/logger.js";
type RscElementsPayload = Record<string, unknown>;
type RscHtmlPayload = ReactNode;

// vite-rsc를 위해 export됨. https://github.com/wakujs/waku/pull/1493
export const fakeFetchCode = `
Promise.resolve(new Response(new ReadableStream({
  start(c) {
    const d = (self.__FLIGHT_DATA ||= []);
    const t = new TextEncoder();
    const f = (s) => c.enqueue(typeof s === 'string' ? t.encode(s) : s);
    d.forEach(f);
    d.push = f;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => c.close());
    } else {
      c.close();
    }
  }
})))
`
  .split("\n")
  .map((line) => line.trim())
  .join("");

type RenderHtmlStream = (
  rscStream: ReadableStream<Uint8Array>,
  rscHtmlStream: ReadableStream<Uint8Array>,
  options: {
    rscPath: string | undefined;
    formState: ReactFormState | undefined;
    nonce: string | undefined;
    extraScriptContent: string | undefined;
  },
) => Promise<{ stream: ReadableStream; status: number | undefined }>;

// SSR 전용
export const renderHtmlStream: RenderHtmlStream = async (
  rscStream,
  rscHtmlStream,
  options,
) => {
  const [stream1, stream2] = rscStream.tee();

  let elementsPromise: Promise<RscElementsPayload>;
  let htmlPromise: Promise<RscHtmlPayload>;

  function SsrRoot() {
    elementsPromise ??= createFromReadableStream<RscElementsPayload>(stream1);

    htmlPromise ??= createFromReadableStream<RscHtmlPayload>(rscHtmlStream);

    return (
      <Root elementsPromise={elementsPromise}>
        <HtmlNodeWrapper>{use(htmlPromise)}</HtmlNodeWrapper>
      </Root>
    );
  }

  const bootstrapScriptContent = await loadBootstrapScriptContent();

  const htmlStream = await renderToReadableStream(<SsrRoot />, {
    bootstrapScriptContent:
      getBootstrapPreamble({ rscPath: options?.rscPath || "" }) +
      bootstrapScriptContent,
    onError: (e: unknown) => {
      logger.error("[SSR Error] Full error:", e);
      logger.error(
        "[SSR Error] Stack:",
        e instanceof Error ? e.stack : "No stack",
      );
      logger.error(
        "[SSR Error] Owner stack:",
        captureOwnerStack?.() || "No owner stack",
      );
      if (
        e &&
        typeof e === "object" &&
        "digest" in e &&
        typeof e.digest === "string"
      ) {
        return e.digest;
      }
      logger.error("[SSR Error]", captureOwnerStack?.() || "");
    },
    ...(options?.nonce ? { nonce: options.nonce } : {}),
    ...(options?.formState ? { formState: options.formState } : {}),
  });

  let responseStream: ReadableStream<Uint8Array> = htmlStream;
  responseStream = responseStream.pipeThrough(
    injectRSCPayload(stream2, options?.nonce ? { nonce: options?.nonce } : {}),
  );

  return { stream: responseStream, status: undefined };
};

// SSR 사용안함
export async function renderHtmlFallback() {
  const bootstrapScriptContent = await loadBootstrapScriptContent();
  const html = fallbackHtml.replace(
    "</body>",
    () => `<script>${bootstrapScriptContent}</script></body>`,
  );
  return html;
}

function HtmlNodeWrapper(props: { children: ReactNode }) {
  return props.children;
}

function getBootstrapPreamble(options: { rscPath: string }) {
  return `
    globalThis.__TEUL_HYDRATE__ = true;
    globalThis.__TEUL_PREFETCHED__ = {
      ${JSON.stringify(options.rscPath)}: ${fakeFetchCode}
    };
  `;
}
