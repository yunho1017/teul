import type { ReactFormState } from "react-dom/client";
import type {
  HandleRequest as HandleRequest,
  HandlerContext,
} from "../../types.js";
import type { TeulConfig } from "../../config.js";
import { decodeRscPath } from "../../utils/path.js";

type HandleRequestInput = Parameters<HandleRequest>[0];

export async function getInput(
  ctx: HandlerContext,
  config: Pick<Required<TeulConfig>, "distDir" | "rsc">,
  decodeReply: (
    body: string | FormData,
    options?: unknown,
  ) => Promise<unknown[]>,
  decodeAction: (body: FormData) => Promise<() => Promise<void>>,
  decodeFormState: (
    actionResult: unknown,
    body: FormData,
  ) => Promise<ReactFormState | undefined>,
) {
  const basePath = "/";
  const url = new URL(ctx.req.url);
  const rscBase = config.rsc.base!.startsWith("/")
    ? config.rsc.base!
    : basePath + config.rsc.base!;
  const rscPathPrefix = rscBase + "/";
  let rscPath: string | undefined;
  let temporaryReferences: unknown | undefined;
  let input: HandleRequestInput;
  if (url.pathname.startsWith(rscPathPrefix)) {
    // Remove RSC extension first, then decode
    let encodedPath = decodeURI(url.pathname.slice(rscPathPrefix.length));
    const rscExtension = config.rsc?.extension ?? ".rsc";
    if (encodedPath.endsWith(rscExtension)) {
      encodedPath = encodedPath.slice(0, -rscExtension.length);
    }
    rscPath = decodeRscPath(encodedPath);

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
    const contentType = ctx.req.headers.get("content-type");
    if (
      typeof contentType === "string" &&
      contentType.startsWith("multipart/form-data")
    ) {
      // server action: no js (progressive enhancement)
      const formData = (await getActionBody(ctx.req)) as FormData;
      const decodedAction = await decodeAction(formData);
      input = {
        type: "action",
        fn: async () => {
          const result = await decodedAction();
          return await decodeFormState(result, formData);
        },
        pathname: decodeURI(url.pathname),
        req: ctx.req,
      };
    } else {
      // POST API request
      input = {
        type: "custom",
        pathname: decodeURI(url.pathname),
        req: ctx.req,
      };
    }
  } else {
    // SSR
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
