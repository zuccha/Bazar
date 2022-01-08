import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AsyncResponse, Getter, Setter } from '../utils/Accessors';
import { EitherErrorOr } from '../utils/EitherErrorOr';
import ErrorReport from '../utils/ErrorReport';
import PairMap from '../utils/PairMap';
import useListUpdatesCount from './useListUpdatesCount';

type Item = unknown;
type Callback = () => void;

const propertySubscriptions = new PairMap<Item, string, Set<Callback>>();
const objectSubscriptions = new Map<Item, Set<Callback>>();

const subscribeToProperty = (
  item: Item,
  dependencies: string[],
  callback: () => void,
) => {
  for (const dependency of dependencies) {
    if (!propertySubscriptions.has(item, dependency)) {
      propertySubscriptions.set(item, dependency, new Set());
    }
    const callbacks = propertySubscriptions.get(item, dependency);
    callbacks?.add(callback);
  }

  return () => {
    for (const dependency of dependencies) {
      const callbacks = propertySubscriptions.get(item, dependency);
      callbacks?.delete(callback);
      if (callbacks?.size === 0) {
        propertySubscriptions.delete(item, dependency);
      }
    }
  };
};

const subscribeToObject = (item: Item, callback: () => void) => {
  if (!objectSubscriptions.has(item)) {
    objectSubscriptions.set(item, new Set());
  }
  const callbacks = objectSubscriptions.get(item);
  callbacks?.add(callback);

  return () => {
    const callbacks = objectSubscriptions.get(item);
    callbacks?.delete(callback);
    if (callbacks?.size === 0) {
      objectSubscriptions.delete(item);
    }
  };
};

const notify = (item: Item, triggers: string[]) => {
  for (const trigger of triggers) {
    const propertySubscription = propertySubscriptions.get(item, trigger);
    if (propertySubscription) {
      for (const callback of propertySubscription) {
        callback();
      }
    }
  }

  const objectSubscription = objectSubscriptions.get(item);
  if (objectSubscription) {
    for (const callback of objectSubscription) {
      callback();
    }
  }
};

export const useObject = <T extends Item>(item: T): T => {
  const [, setRenderCount] = useState(0);

  useLayoutEffect(() => {
    const render = () => setRenderCount((renderCount) => renderCount + 1);
    const unsubscribe = subscribeToObject(item, render);
    return unsubscribe;
  }, [item]);

  return item;
};

export const useList = <T extends Item>(list: T[]): T[] => {
  const [, setRenderCount] = useState(0);
  const listUpdatesCount = useListUpdatesCount(list);

  useLayoutEffect(() => {
    const render = () => setRenderCount((renderCount) => renderCount + 1);
    const unsubscribes = list.map((item) => {
      return subscribeToObject(item, render);
    });
    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, [listUpdatesCount]);

  return list;
};

export const useGet = <T extends Item, Return>(
  item: T,
  getter: Getter<[], Return>,
): Return => {
  const [, setRenderCount] = useState(0);

  useLayoutEffect(() => {
    const render = () => setRenderCount((renderCount) => renderCount + 1);
    const unsubscribe = subscribeToProperty(item, getter.deps, render);
    return unsubscribe;
  }, [item, getter]);

  return getter();
};

export const useGetAsync = <T extends Item, Return>(
  item: T,
  getter: Getter<[], Promise<EitherErrorOr<Return>>>,
): AsyncResponse<Return> => {
  const [, setRenderCount] = useState(0);
  const [response, setResponse] = useState<AsyncResponse<Return>>({
    error: undefined,
    isLoading: false,
    value: undefined,
  });

  useLayoutEffect(() => {
    const render = () => setRenderCount((renderCount) => renderCount + 1);
    const unsubscribe = subscribeToProperty(item, getter.deps, render);
    return unsubscribe;
  }, [item, getter]);

  useLayoutEffect(() => {
    setResponse((prevResponse) => ({ ...prevResponse, isLoading: true }));
    getter().then((errorOrValue) => {
      setResponse({
        error: errorOrValue.isError ? errorOrValue.error : undefined,
        value: errorOrValue.isValue ? errorOrValue.value : undefined,
        isLoading: false,
      });
    });
  }, [item, getter]);

  return response;
};

export const useSet = <T extends Item, Args extends unknown[]>(
  item: T,
  setter: Setter<Args, ErrorReport | undefined>,
): ((...args: Args) => ErrorReport | undefined) => {
  return useCallback(
    (...args: Parameters<typeof setter>): ErrorReport | undefined => {
      const error = setter(...args);
      if (error) return error;
      notify(item, setter.triggers);
    },
    [item, setter],
  );
};

export const useSetAsync = <T extends Item, Args extends unknown[]>(
  item: T,
  setter: Setter<Args, Promise<ErrorReport | undefined>>,
): ((...args: Args) => Promise<ErrorReport | undefined>) => {
  return useCallback(
    async function (
      ...args: Parameters<typeof setter>
    ): Promise<ErrorReport | undefined> {
      const error = await setter(...args);
      if (error) return error;
      notify(item, setter.triggers);
    },
    [item, setter],
  );
};
