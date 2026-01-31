import type { HandleRequest } from "../../types.js";

type RenderUtils = Parameters<HandleRequest>[1];

export function createRenderUtils(
  temporaryReferences: unknown,
  renderToReadableStream: (data: unknown, options?: object) => ReadableStream,
  loadSsrEntryModule: () => Promise<typeof import("../entries/entry.ssr.js")>,
): RenderUtils {
  const onError = (e: unknown) => {
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof e.digest === "string"
    ) {
      return e.digest;
    }
  };

  return {
    async renderRsc(elements) {
      return renderToReadableStream(elements, {
        temporaryReferences,
        onError,
      });
    },
    async renderHtml(elementsStream, html, options) {
      const { renderHtmlStream } = await loadSsrEntryModule();

      const rscHtmlStream = renderToReadableStream(html, {
        onError,
      });
      const htmlResult = await renderHtmlStream(elementsStream, rscHtmlStream, {
        rscPath: options?.rscPath,
        formState: undefined,
        extraScriptContent: undefined,
        nonce: undefined,
      });
      return new Response(htmlResult.stream, {
        status: htmlResult.status || options.status || 200,
        headers: { "content-type": "text/html" },
      });
    },
  };
}
