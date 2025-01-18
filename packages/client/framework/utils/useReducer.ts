import { use, useCallback, useState } from "react";
import { isThenable } from "./isThenable";

export function useUnwrapState(state: any) {
  if (isThenable(state)) {
    const result = use(state);
    return result;
  }

  return state;
}

export function useReducer(reducer: any, initialState: any) {
  const [state, setState] = useState(initialState);

  const dispatch = useCallback(
    (action: any) => {
      setState(reducer(action, state));
    },
    [reducer, state]
  );

  return [state, dispatch];
}
