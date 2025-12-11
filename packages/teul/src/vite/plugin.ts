import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  mergeConfig,
  type Plugin,
  type PluginOption,
  type RunnableDevEnvironment,
  type UserConfig,
  type ViteDevServer,
} from "vite";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  DIST_PUBLIC,
  getManagedClientEntry,
  getManagedServerEntry,
  SRC_CLIENT_ENTRY,
  SRC_SERVER_ENTRY,
} from "./constants.js";
import type { TeulConfig } from "../config.js";
import { emitStaticFile, waitForTasks } from "../utils/builder/build.js";
import { allowServerPlugin } from "../vite-plugins/allow-server.js";

const PKG_NAME = "teul";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export type Flags = {};

export type RscPluginOptions = {
  flags?: Flags;
  config?: TeulConfig | undefined;
};

export function rscPlugin(rscPluginOptions?: RscPluginOptions): PluginOption {
  const config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite"> =
    {
      srcDir: "src",
      distDir: "dist",
      pagesDir: "pages",
      port: 3000,
      rsc: {
        base: "/RSC",
        extension: ".rsc",
      },
      vite: undefined,
      ...rscPluginOptions?.config,
    };
  const flags = rscPluginOptions?.flags ?? {};
  const extraPlugins = [...(config.vite?.plugins ?? [])];
  // add react plugin automatically if users didn't include it on their own (e.g. swc, oxc, babel react compiler)
  if (
    !extraPlugins
      .flat()
      .some((p) => p && "name" in p && p.name.startsWith("vite:react"))
  ) {
    extraPlugins.push(react());
  }
  return [
    ...extraPlugins,
    allowServerPlugin(),
    rsc({
      serverHandler: false,
      keepUseCientProxy: true,
      ignoredPackageWarnings: [/.*/],
      useBuildAppHook: true,
      clientChunks: (meta) => meta.serverChunk,
    }),
    {
      name: "rsc:teul",
      async config(_config) {
        let viteRscConfig: UserConfig = {
          environments: {
            client: {
              build: {
                rollupOptions: {
                  input: {
                    index: path.join(__dirname, "./entries/entry.browser.js"),
                  },
                },
              },
              optimizeDeps: {
                entries: [
                  `${config.srcDir}/${SRC_CLIENT_ENTRY}.*`,
                  `${config.srcDir}/${SRC_SERVER_ENTRY}.*`,
                  `${config.srcDir}/${config.pagesDir}/**/*.*`,
                ],
              },
            },
            ssr: {
              build: {
                rollupOptions: {
                  input: {
                    index: path.join(__dirname, "./entries/entry.ssr.js"),
                  },
                },
              },
            },
            rsc: {
              build: {
                rollupOptions: {
                  input: {
                    index: path.join(__dirname, "./entries/entry.server.js"),
                  },
                },
              },
            },
          },
        };

        if (config.vite) {
          viteRscConfig = mergeConfig(viteRscConfig, {
            ...config.vite,
            plugins: undefined,
          });
        }

        return viteRscConfig;
      },
      configEnvironment(name, environmentConfig, env) {
        // make @vitejs/plugin-rsc usable as a transitive dependency
        // by rewriting `optimizeDeps.include`. e.g.
        // include: ["@vitejs/plugin-rsc/vendor/xxx", "@vitejs/plugin-rsc > yyy"]
        // ⇓
        // include: ["waku > @vitejs/plugin-rsc/vendor/xxx", "waku > @vitejs/plugin-rsc > yyy"]
        if (environmentConfig.optimizeDeps?.include) {
          environmentConfig.optimizeDeps.include =
            environmentConfig.optimizeDeps.include.map((name) => {
              if (name.startsWith("@vitejs/plugin-rsc")) {
                name = `${PKG_NAME} > ${name}`;
              }
              return name;
            });
        }

        environmentConfig.build ??= {};
        environmentConfig.build.outDir = `${config.distDir}/${name}`;
        if (name === "rsc") {
          environmentConfig.build.outDir = `${config.distDir}/server`;
        }
        if (name === "ssr") {
          environmentConfig.build.outDir = `${config.distDir}/server/ssr`;
        }
        if (name === "client") {
          environmentConfig.build.outDir = `${config.distDir}/${DIST_PUBLIC}`;
        }

        return {
          resolve: {
            noExternal: env.command === "build" ? true : [PKG_NAME],
          },
          optimizeDeps: {
            exclude: [
              PKG_NAME,
              "teul/client",
              "teul/router/client",
              "teul/minimal/client",
            ],
          },
        };
      },
      async configureServer(server) {
        const { getRequestListener } = await import("@hono/node-server");
        const environment = server.environments.rsc! as RunnableDevEnvironment;
        const entryId = (environment.config.build.rollupOptions.input as any)
          .index;
        return () => {
          server.middlewares.use(async (req, res, next) => {
            try {
              const mod = await environment.runner.import(entryId);
              await getRequestListener(mod.default)(req, res);
            } catch (e) {
              next(e);
            }
          });
        };
      },
    },
    // user entry 값을 동적으로 맵핑,
    {
      name: "rsc:teul:user-entries",
      // resolve user entries and fallbacks to "managed mode" if not found.
      async resolveId(source, _importer, options) {
        if (source === "virtual:vite-rsc-teul/server-entry") {
          return `\0` + source;
        }
        if (source === "virtual:vite-rsc-teul/server-entry-inner") {
          const resolved = await this.resolve(
            `/${config.srcDir}/${SRC_SERVER_ENTRY}`,
            undefined,
            options,
          );
          return resolved ? resolved : "\0" + source;
        }
        if (source === "virtual:vite-rsc-teul/client-entry") {
          const resolved = await this.resolve(
            `/${config.srcDir}/${SRC_CLIENT_ENTRY}`,
            undefined,
            options,
          );
          return resolved ? resolved : "\0" + source;
        }
      },
      load(id) {
        if (id === "\0virtual:vite-rsc-teul/server-entry") {
          return `\
export { default } from 'virtual:vite-rsc-teul/server-entry-inner';
if (import.meta.hot) {
  import.meta.hot.accept()
}
`;
        }
        if (id === "\0virtual:vite-rsc-teul/server-entry-inner") {
          return getManagedServerEntry(config);
        }
        if (id === "\0virtual:vite-rsc-teul/client-entry") {
          return getManagedClientEntry();
        }
      },
    },
    // config 값을 동적 값(virtual)으로 맵핑
    createVirtualPlugin("vite-rsc-teul/config", async function () {
      return `
        export const config = ${JSON.stringify({ ...config, vite: undefined })};
        export const flags = ${JSON.stringify(flags)};
        export const isBuild = ${JSON.stringify(
          this.environment.mode === "build",
        )};
      `;
    }),
    // RSC 설정을 virtual 모듈로 노출
    createVirtualPlugin("vite-rsc-teul/rsc-config", async function () {
      return `
        export const RSC_BASE = ${JSON.stringify(config.rsc?.base ?? "/RSC")};
        export const RSC_EXTENSION = ${JSON.stringify(config.rsc?.extension ?? ".rsc")};
      `;
    }),
    {
      // server-dom-webpack/client 을 vite 플러그인으로 대체
      name: "rsc:teul:patch-webpack",
      enforce: "pre",
      resolveId(source, _importer, _options) {
        if (source === "react-server-dom-webpack/client") {
          return "\0" + source;
        }
      },
      load(id) {
        if (id === "\0react-server-dom-webpack/client") {
          if (this.environment.name === "client") {
            return `
              export * from ${JSON.stringify(
                import.meta.resolve("@vitejs/plugin-rsc/browser"),
              )};
              import * as ReactClient from ${JSON.stringify(
                import.meta.resolve("@vitejs/plugin-rsc/browser"),
              )};
              export default ReactClient;
            `;
          }
          return `export default {}`;
        }
      },
    },
    {
      name: "rsc:teul:handle-build",
      buildApp: {
        async handler(builder) {
          // import server entry
          const viteConfig = builder.config;
          const entryPath = path.join(
            viteConfig.environments.rsc!.build.outDir,
            "index.js",
          );
          console.log("[teul] Starting processBuild...");
          const entry: typeof import("./entries/entry.server.js") =
            await import(pathToFileURL(entryPath).href);
          await entry.processBuild(viteConfig, config, emitStaticFile);
          await waitForTasks();

          console.log("[teul] Build complete!");
        },
      },
    },
    // TBD
    // {
    //   name: "rsc:waku:handle-build",
    //   resolveId(source) {
    //     if (source === "virtual:vite-rsc-waku/set-platform-data") {
    //       assert.equal(this.environment.name, "rsc");
    //       if (this.environment.mode === "build") {
    //         return { id: source, external: true, moduleSideEffects: true };
    //       }
    //       return "\0" + source;
    //     }
    //   },
    //   async load(id) {
    //     if (id === "\0virtual:vite-rsc-waku/set-platform-data") {
    //       // no-op during dev
    //       assert.equal(this.environment.mode, "dev");
    //       return `export {}`;
    //     }
    //   },
    //   renderChunk(code, chunk) {
    //     if (code.includes(`virtual:vite-rsc-waku/set-platform-data`)) {
    //       const replacement = normalizeRelativePath(
    //         path.relative(
    //           path.join(chunk.fileName, ".."),
    //           "__waku_set_platform_data.js"
    //         )
    //       );
    //       return code.replaceAll(
    //         "virtual:vite-rsc-waku/set-platform-data",
    //         () => replacement
    //       );
    //     }
    //   },
    //   // cf. packages/waku/src/lib/builder/build.ts
    //   buildApp: {
    //     async handler(builder) {
    //       // import server entry
    //       const viteConfig = builder.config;
    //       const entryPath = path.join(
    //         viteConfig.environments.rsc!.build.outDir,
    //         "index.js"
    //       );
    //       const entry: typeof import("../vite-entries/entry.server.js") =
    //         await import(pathToFileURL(entryPath).href);

    //       // run `handleBuild`
    //       INTERNAL_setAllEnv(process.env as any);
    //       unstable_getBuildOptions().unstable_phase = "emitStaticFiles";
    //       await entry.processBuild(viteConfig, config, emitStaticFile);
    //       await waitForTasks();

    //       // save platform data
    //       const platformDataCode = `globalThis.__WAKU_SERVER_PLATFORM_DATA__ = ${JSON.stringify(
    //         (globalThis as any).__WAKU_SERVER_PLATFORM_DATA__ ?? {},
    //         null,
    //         2
    //       )}\n`;
    //       const platformDataFile = path.join(
    //         builder.config.environments.rsc!.build.outDir,
    //         "__waku_set_platform_data.js"
    //       );
    //       fs.writeFileSync(platformDataFile, platformDataCode);
    //     },
    //   },
    // },
    rscIndexPlugin(),
  ];
}

// 동적 값을 맵
function createVirtualPlugin(name: string, load: Plugin["load"]) {
  name = "virtual:" + name;
  return {
    name: `teul:virtual-${name}`,
    resolveId(source, _importer, _options) {
      return source === name ? "\0" + name : undefined;
    },
    load(id, options) {
      if (id === "\0" + name) {
        return (load as any).apply(this, [id, options]);
      }
    },
  } satisfies Plugin;
}

function rscIndexPlugin(): Plugin {
  let server: ViteDevServer | undefined;

  return {
    name: "teul:fallback-html",
    config() {
      return {
        environments: {
          client: {
            build: {
              rollupOptions: {
                input: {
                  indexHtml: "index.html",
                },
              },
            },
          },
        },
      };
    },
    configureServer(server_) {
      server = server_;
    },
    async resolveId(source, _importer, _options) {
      if (source === "index.html") {
        // this resolve is called as fallback only when Vite didn't find an actual file `index.html`
        // we need to keep exact same name to have `index.html` as an output file.
        assert(this.environment.name === "client");
        assert(this.environment.mode === "build");
        return source;
      }
      if (source === "virtual:vite-rsc-teul/fallback-html") {
        assert(this.environment.name === "ssr");
        return { id: "\0" + source, moduleSideEffects: true };
      }
    },
    async load(id) {
      if (id === "index.html") {
        return `<html><body></body></html>`;
      }
      if (id === "\0virtual:vite-rsc-teul/fallback-html") {
        let html = `<html><body></body></html>`;
        if (this.environment.mode === "dev") {
          if (fs.existsSync("index.html")) {
            // TODO: inline script not invalidated propery?
            this.addWatchFile(path.resolve("index.html"));
            html = fs.readFileSync("index.html", "utf-8");
            html = await server!.transformIndexHtml("/", html);
          }
        } else {
          // skip during scan build
          if (this.environment.config.build.write) {
            const config = this.environment.getTopLevelConfig();
            const file = path.join(
              config.environments.client!.build.outDir,
              "index.html",
            );
            html = fs.readFileSync(file, "utf-8");
            // remove index.html from the build to avoid default preview server serving it
            fs.rmSync(file);
          }
        }
        return `export default ${JSON.stringify(html)};`;
      }
    },
  };
}
