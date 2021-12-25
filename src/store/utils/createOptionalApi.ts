import { createSelector, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { EitherErrorOr } from '../../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../../utils/ErrorReport';

export default function createOptionalApi<BaseState, State>({
  id,
  selectState,
}: {
  id: string;
  selectState: (state: BaseState) => State | null;
}) {
  function createConstructor<Args extends unknown[]>(
    create: (...args: Args) => EitherErrorOr<State>,
  ): (
    ...args: Args
  ) => (dispatch: Dispatch<PayloadAction<State>>) => ErrorReport | undefined {
    return (...args) =>
      (dispatch) => {
        const errorOrState = create(...args);
        if (errorOrState.isError) {
          return errorOrState.error;
        }
        dispatch({ type: id, payload: errorOrState.value });
        return undefined;
      };
  }

  function createConstructorAsync<Args extends unknown[]>(
    create: (...args: Args) => Promise<EitherErrorOr<State>>,
  ): (
    ...args: Args
  ) => (
    dispatch: Dispatch<PayloadAction<State>>,
  ) => Promise<ErrorReport | undefined> {
    return (...args) =>
      async (dispatch) => {
        const errorOrState = await create(...args);
        if (errorOrState.isError) {
          return errorOrState.error;
        }
        dispatch({ type: id, payload: errorOrState.value });
        return undefined;
      };
  }

  function createMutation<Args extends unknown[]>(
    mutate: (self: State, ...args: Args) => EitherErrorOr<State>,
  ): (
    ...args: Args
  ) => (
    dispatch: Dispatch<PayloadAction<State>>,
    getState: () => BaseState,
  ) => ErrorReport | undefined {
    return (...args) =>
      (dispatch, getState) => {
        const state = selectState(getState());
        if (!state) {
          const errorMessage = `Trying to mutate "${id}", but it's undefined`;
          return $ErrorReport.make(errorMessage);
        }

        const errorOrMutatedState = mutate(state, ...args);
        if (errorOrMutatedState.isError) {
          return errorOrMutatedState.error;
        }
        dispatch({ type: id, payload: errorOrMutatedState.value });
        return undefined;
      };
  }

  function createMutationAsync<Args extends unknown[]>(
    mutate: (self: State, ...args: Args) => Promise<EitherErrorOr<State>>,
  ): (
    ...args: Args
  ) => (
    dispatch: Dispatch<PayloadAction<State>>,
    getState: () => BaseState,
  ) => Promise<ErrorReport | undefined> {
    return (...args) =>
      async (dispatch, getState) => {
        const state = selectState(getState());
        if (!state) {
          const errorMessage = `Trying to mutate "${id}", but it's undefined`;
          return $ErrorReport.make(errorMessage);
        }

        const errorOrMutatedState = await mutate(state, ...args);
        if (errorOrMutatedState.isError) {
          return errorOrMutatedState.error;
        }
        dispatch({ type: id, payload: errorOrMutatedState.value });
        return undefined;
      };
  }

  function createQuery<Args extends unknown[], Return>(
    query: (self: State, ...args: Args) => Return,
  ): (...args: Args) => (state: BaseState) => Return | undefined {
    // TODO: Memoize selector.
    return (...args) => {
      return (state: BaseState) => {
        const self = selectState(state);
        return self ? query(self, ...args) : undefined;
      };
    };
  }

  const exists = createSelector(selectState, (self) => !!self);

  function reduce(state: State | null, action: PayloadAction<State>) {
    return action.payload;
  }

  return {
    id,
    createConstructor,
    createConstructorAsync,
    createMutation,
    createMutationAsync,
    createQuery,
    exists,
    reduce,
  };
}
