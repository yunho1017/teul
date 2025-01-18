export function createHrefFromUrl(url: URL, includeHash = true) {
  return url.pathname + url.search + (includeHash ? url.hash : "");
}
