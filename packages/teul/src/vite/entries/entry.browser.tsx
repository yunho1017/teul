/// <reference types="vite/client" />

if (import.meta.hot) {
  import.meta.hot.on("rsc:update", () => {
    globalThis.__TEUL_RSC_RELOAD_LISTENERS__?.forEach((l) => l());
  });
}

import "virtual:vite-rsc-teul/client-entry";
