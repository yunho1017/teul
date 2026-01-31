import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import serverEntry from "virtual:vite-rsc-teul/server-entry";
import type { EmitFile } from "../../types.js";
import { joinPath } from "../../utils/path.js";

function resolveModuleId(moduleId: string, rootDir: string) {
  if (moduleId.startsWith("file://")) {
    return moduleId;
  }
  if (moduleId.startsWith("/")) {
    // treat as project-root relative (not filesystem root)
    return pathToFileURL(joinPath(rootDir, moduleId.slice(1))).href;
  }
  const require = createRequire(joinPath(rootDir, "DUMMY.js"));
  const resolved = require.resolve(moduleId);
  return pathToFileURL(resolved).href;
}

export async function runBuild({
  rootDir,
  emitFile,
}: {
  rootDir: string;
  emitFile: EmitFile;
}) {
  let build = serverEntry.build;
  for (const enhancer of serverEntry.buildEnhancers || []) {
    const moduleId = resolveModuleId(enhancer, rootDir);
    const mod = await import(moduleId);
    build = await mod.default(build);
  }
  await build({ emitFile }, serverEntry.buildOptions || {});
}
