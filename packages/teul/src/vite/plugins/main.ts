/**
 * Main 플러그인
 *
 * Teul의 핵심 Vite 설정을 관리하는 메인 플러그인입니다.
 * - Vite 환경(client, ssr, rsc)별 설정 구성
 * - 빌드 entry 및 output 디렉토리 설정
 * - 개발 서버 설정 및 RSC 런타임 연동
 *
 * @example
 * // 각 환경별로 다음과 같이 빌드됩니다:
 * // - client: dist/public (브라우저용 번들)
 * // - ssr: dist/server/ssr (서버 사이드 렌더링)
 * // - rsc: dist/server (React Server Components)
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  mergeConfig,
  type Plugin,
  type RunnableDevEnvironment,
  type UserConfig,
} from "vite";
import type { TeulConfig } from "../../config.js";
import {
  DIST_PUBLIC,
  SRC_CLIENT_ENTRY,
  SRC_SERVER_ENTRY,
} from "../constants.js";

const PKG_NAME = "teul";
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function mainPlugin(
  config: Required<Omit<TeulConfig, "vite">> & Pick<TeulConfig, "vite">,
): Plugin {
  return {
    name: "teul:vite-plugins:main",
    async config(_config) {
      let viteRscConfig: UserConfig = {
        define: {
          "import.meta.env.TEUL_CONFIG_RSC_BASE": JSON.stringify(
            config.rscBase,
          ),
          "import.meta.env.TEUL_CONFIG_RSC_EXTENSION": JSON.stringify(
            config.rscExtension,
          ),
        },
        environments: {
          client: {
            build: {
              rollupOptions: {
                input: {
                  index: path.join(__dirname, "../entries/entry.browser.js"),
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
                  index: path.join(__dirname, "../entries/entry.ssr.js"),
                },
              },
            },
          },
          rsc: {
            build: {
              rollupOptions: {
                input: {
                  index: path.join(__dirname, "../entries/entry.server.js"),
                  build: path.join(__dirname, "../entries/entry.build.js"),
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
      // @vitejs/plugin-rsc를 전이 종속성으로 사용할 수 있도록 설정
      // optimizeDeps.include를 다시 작성합니다.
      // 예: ["@vitejs/plugin-rsc/vendor/xxx"] -> ["teul > @vitejs/plugin-rsc/vendor/xxx"]
      if (environmentConfig.optimizeDeps?.include) {
        environmentConfig.optimizeDeps.include =
          environmentConfig.optimizeDeps.include.map((name) => {
            if (name.startsWith("@vitejs/plugin-rsc")) {
              name = `${PKG_NAME} > ${name}`;
            }
            return name;
          });
      }

      // 환경별 빌드 출력 디렉토리 설정
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
            // Restore Vite's automatically stripped base
            req.url = req.originalUrl;
            const mod: typeof import("../entries/entry.server.js") =
              await environment.runner.import(entryId);
            await getRequestListener((req, ...args) =>
              mod.runFetch(req, ...args),
            )(req, res);
          } catch (e) {
            next(e);
          }
        });
      };
    },
  };
}
