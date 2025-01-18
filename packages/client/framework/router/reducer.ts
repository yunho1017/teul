import { fetchServerResponse } from "../utils/fetchServerResponse";
import { RouterState, RouterAction } from "./types";

export const ACTION_NAVIGATE = "navigate";
export const ACTION_RESTORE = "restore";
export const ACTION_REFRESH = "refresh";

export function routerReducer(action: RouterAction, state: RouterState) {
  switch (action.type) {
    case ACTION_NAVIGATE: {
      const { url, navigateType } = action;
      const serverResponse = fetchServerResponse(url);

      return serverResponse.then((response) => {
        const { rscTree } = response;

        const mutable: RouterState = {
          tree: rscTree,
          canonicalUrl: url,
          pushRef: {
            pendingPush: navigateType === "push",
            preserveCustomHistoryState: false,
          },
        };

        return mutable;
      });
    }
    case ACTION_RESTORE: {
      const { url, tree } = action;
      return {
        tree: tree,
        canonicalUrl: url,
        pushRef: {
          pendingPush: false,
          preserveCustomHistoryState: true,
        },
      };
    }
    case ACTION_REFRESH: {
      const { origin } = action;

      const serverResponse = fetchServerResponse(state.canonicalUrl);

      return serverResponse.then((response) => {
        const { rscTree } = response;
        return {
          tree: rscTree,
          canonicalUrl: state.canonicalUrl,
          pushRef: state.pushRef,
        };
      });
    }
  }
}
