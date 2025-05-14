import * as Updates from "expo-updates";
import { useCallback, useEffect, useReducer } from "react";

const actionKind = {
  HYDRATE: "HYDRATE",
  ERROR: "ERROR",
} as const;
interface Action {
  type: keyof typeof actionKind;
}
interface State {
  hydrated: boolean;
  isPending: boolean;
  isError: boolean;
  // error?: unknown
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case actionKind.HYDRATE:
      return {
        ...state,
        hydrated: true,
        isPending: false,
        isError: false,
      };
    case actionKind.ERROR:
      return {
        ...state,
        hydrated: true,
        isPending: false,
        isError: true,
      };
    default:
      return state;
  }
}

const isDev = __DEV__ || process.env.NODE_ENV === "development";

const initialState = { hydrated: false, isPending: true, isError: false };
const initialStateDev = { hydrated: true, isPending: false, isError: false };

export const useExpoUpdateStatus = () => {
  const [state, dispatch] = useReducer(
    reducer,
    isDev ? initialStateDev : initialState
  );

  const checkExpoUpdate = useCallback(async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (!update.isAvailable) {
        //
        dispatch({ type: actionKind.HYDRATE });
        return;
      }
      const result = await Updates.fetchUpdateAsync();

      if (!result.isNew) {
        dispatch({ type: actionKind.HYDRATE });
        return;
      }
      await Updates.reloadAsync();
    } catch (error) {
      dispatch({ type: actionKind.ERROR });
    }
  }, []);

  useEffect(() => {
    !isDev && checkExpoUpdate();
  }, [checkExpoUpdate]);

  return state;
};
