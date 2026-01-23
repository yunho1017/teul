// @ts-expect-error - react-server-dom-webpack doesn't have types
import RSDWClient from "react-server-dom-webpack/client";
import { encodeRscPath } from "../../../utils/path.js";
import type { FetchCache, FetchRscInternal, Elements } from "../types.js";
import { unstableCallServerRsc } from "./call-server-rsc.js";

const { createFromFetch, encodeReply, createTemporaryReferenceSet } =
  RSDWClient;

const RSC_EXTENSION = import.meta.env?.TEUL_CONFIG_RSC_EXTENSION;
const BASE_RSC_PATH = `${import.meta.env?.TEUL_CONFIG_RSC_BASE}/`;

const checkStatus = async (
  responsePromise: Promise<Response>,
): Promise<Response> => {
  const response = await responsePromise;
  if (!response.ok) {
    throw new Error(
      (await response.text()) ||
        `HTTP ${response.status}: ${response.statusText}`,
    );
  }
  return response;
};

export const createFetchRscInternal =
  (fetchCache: FetchCache): FetchRscInternal =>
  (rscPath: string, rscParams: unknown, fetchFn = fetch) => {
    const temporaryReferences = createTemporaryReferenceSet();
    const url = BASE_RSC_PATH + encodeRscPath(rscPath, RSC_EXTENSION);
    const responsePromise =
      rscParams === undefined
        ? fetchFn(url)
        : rscParams instanceof URLSearchParams
          ? fetchFn(url + "?" + rscParams)
          : encodeReply(rscParams, { temporaryReferences }).then(
              (body: string) => fetchFn(url, { method: "POST", body }),
            );

    return createFromFetch<Elements>(checkStatus(responsePromise), {
      callServer: (funcId: string, args: unknown[]) =>
        unstableCallServerRsc(funcId, args, fetchCache),
      temporaryReferences,
    });
  };
