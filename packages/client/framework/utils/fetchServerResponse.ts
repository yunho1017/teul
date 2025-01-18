const { createFromReadableStream } = require("react-server-dom-webpack/client");
let abortController = new AbortController();

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    abortController.abort();
  });

  window.addEventListener("pageshow", () => {
    abortController = new AbortController();
  });
}

export async function fetchServerResponse(url: string) {
  const response = await fetch(`/rsc?pathname=${url}`, {
    signal: abortController.signal,
  });
  const rscTree = createFromReadableStream(response.body);

  return { rscTree };
}
