import { DependencyList, useCallback } from 'react';
import ErrorReport from '../utils/ErrorReport';
import useSafeState from './usSafeState';

export interface AsyncCallback<Args extends unknown[]> {
  call: (...args: Args) => Promise<ErrorReport | undefined>;
  error: ErrorReport | undefined;
  isLoading: boolean;
}

export default function useAsyncCallback<Args extends unknown[]>(
  callback: (...args: Args) => Promise<ErrorReport | undefined>,
  deps: DependencyList,
): AsyncCallback<Args> {
  const [error, setError] = useSafeState<ErrorReport | undefined>(undefined);
  const [isLoading, setIsLoading] = useSafeState(false);

  const call = useCallback(async (...args: Args) => {
    setIsLoading(true);
    const error = await callback(...args);
    setError(error);
    setIsLoading(false);
    return error;
  }, deps);

  return { call, error, isLoading };
}
