import type { TeulConfig } from "../../config.js";
import type { HandleRequest, HandlerContext } from "../../types.js";
import { decodeRscPath } from "../../utils/path.js";

type HandleRequestInput = Parameters<HandleRequest>[0];

export async function getInput(
  ctx: HandlerContext,
  config: Pick<Required<TeulConfig>, "distDir" | "rscBase" | "rscExtension">,
  decodeReply: (
    body: string | FormData,
    options?: unknown,
  ) => Promise<unknown[]>,
) {
  const basePath = "/";
  const url = new URL(ctx.req.url);
  const rscBase = config.rscBase.startsWith("/")
    ? config.rscBase
    : basePath + config.rscBase;
  const rscPathPrefix = rscBase + "/";
  let rscPath: string | undefined;
  let temporaryReferences: unknown | undefined;
  let input: HandleRequestInput;

  if (url.pathname.startsWith(rscPathPrefix)) {
    // 아래는 RSC 요청처리 과정입니다
    const rscExtension = config.rscExtension;
    rscPath = decodeRscPath(
      decodeURI(url.pathname.slice(rscPathPrefix.length)),
      rscExtension,
    );

    // client RSC request
    let rscParams: unknown = url.searchParams;
    if (ctx.req.body) {
      const body = await getActionBody(ctx.req);
      rscParams = await decodeReply(body, {
        temporaryReferences,
      });
    }
    input = {
      type: "component",
      rscPath,
      rscParams,
      req: ctx.req,
    };
  } else if (ctx.req.method === "POST") {
    // TODO server Action 구현
    throw new Error("Post API (서버 액션)은 아직 구현 전 입니다");
  } else {
    // 아래는 SSR 처리 과정입니다
    input = {
      type: "custom",
      pathname: decodeURI(url.pathname),
      req: ctx.req,
    };
  }
  return { input, temporaryReferences };
}

async function getActionBody(req: Request) {
  if (!req.body) {
    throw new Error("missing request body for server function");
  }
  const contentType = req.headers.get("content-type");
  if (contentType?.startsWith("multipart/form-data")) {
    return req.formData();
  } else {
    return req.text();
  }
}
