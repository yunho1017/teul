import { defineServer } from "../common.js";
import { RouteConfigManager } from "./config.js";
import { EntriesManager } from "./entries.js";
import { createHandleBuild, createHandleRequest } from "./handlers.js";
import type { DefineRouterFunctions } from "./types.js";

/**
 *
 * @param fns
 * getConfig: 현재 프로젝트의 라우트 관련 정보를 담고 있는 Config를 가져오는 함수
 * handleRoute: 파라미터로 전달받은 path에 해당하는 엘리먼트들을 만들어서 리턴하는 함수
 * create-pages 참조
 * @returns
 * packages/teul/src/vite/entries/entry.server.tsx => 런타임
 * packages/teul/src/vite/build.ts => 빌드
 * 시 사용되는 유틸 함수 (handleBuild, handleRequest) 리턴
 */
export function defineRouter(fns: DefineRouterFunctions) {
  const configManager = new RouteConfigManager(fns);
  const entriesManager = new EntriesManager(fns, configManager);

  const handleRequest = createHandleRequest(entriesManager, configManager);
  const handleBuild = createHandleBuild(entriesManager, configManager);

  return defineServer({ handleBuild, handleRequest });
}

export type { DefineRouterFunctions, SlotId } from "./types.js";
