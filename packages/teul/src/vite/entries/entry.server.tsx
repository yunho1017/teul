import serverEntry from "virtual:vite-rsc-teul/server-entry";

export { serverEntry };

export async function runFetch(req: Request, ...args: any[]) {
  return serverEntry.fetch(req, ...args);
}
