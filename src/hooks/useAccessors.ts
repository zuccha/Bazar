import { useCallback, useLayoutEffect, useState } from 'react';
import { ErrorReport } from '../utils/ErrorReport';
import PairMap from '../utils/PairMap';

type Item = unknown;
type Callback = () => void;

const subscriptions = new PairMap<Item, string, Set<Callback>>();
const globalSubscriptions = new Map<string, Set<Callback>>();

const subscribe = (
  item: Item,
  dependencies: string[],
  callback: () => void,
) => {
  for (const dependency of dependencies) {
    if (dependency.startsWith('*')) {
      if (!globalSubscriptions.has(dependency)) {
        globalSubscriptions.set(dependency, new Set());
      }
      const callbacks = globalSubscriptions.get(dependency);
      callbacks?.add(callback);
    } else {
      if (!subscriptions.has(item, dependency)) {
        subscriptions.add(item, dependency, new Set());
      }
      const callbacks = subscriptions.get(item, dependency);
      callbacks?.add(callback);
    }
  }

  return () => {
    for (const dependency of dependencies) {
      if (dependency.startsWith('*')) {
        const callbacks = globalSubscriptions.get(dependency);
        callbacks?.delete(callback);
        if (callbacks?.size === 0) {
          globalSubscriptions.delete(dependency);
        }
      } else {
        const callbacks = subscriptions.get(item, dependency);
        callbacks?.delete(callback);
        if (callbacks?.size === 0) {
          subscriptions.delete(item, dependency);
        }
      }
    }
  };
};

const notify = (item: Item, triggers: string[]) => {
  for (const trigger of triggers) {
    const subscription = subscriptions.get(item, trigger);
    if (subscription) {
      for (const callback of subscription) {
        callback();
      }
    }

    const globalSubscription = globalSubscriptions.get(`*${trigger}`);
    if (globalSubscription) {
      for (const callback of globalSubscription) {
        callback();
      }
    }
  }
};

export const useGet = <T, R>(
  item: T,
  getter: () => R,
  dependencies: string[],
): R => {
  const [, setRenderCount] = useState(0);

  useLayoutEffect(() => {
    const render = () => setRenderCount((renderCount) => renderCount + 1);
    const unsubscribe = subscribe(item, dependencies, render);
    return unsubscribe;
  }, [item, getter, dependencies]);

  return getter();
};

export const useSet = <T, A extends unknown[]>(
  item: T,
  setter: (...args: A) => ErrorReport | undefined,
  triggers: string[],
): ((...args: Parameters<typeof setter>) => ErrorReport | undefined) => {
  return useCallback(
    (...args: Parameters<typeof setter>): ErrorReport | undefined => {
      const error = setter(...args);
      if (error) return error;
      notify(item, triggers);
    },
    [item, setter, triggers],
  );
};

export const useSetAsync = <T, A extends unknown[]>(
  item: T,
  setter: (...args: A) => Promise<ErrorReport | undefined>,
  triggers: string[],
): ((
  ...args: Parameters<typeof setter>
) => Promise<ErrorReport | undefined>) => {
  return useCallback(
    async function (
      ...args: Parameters<typeof setter>
    ): Promise<ErrorReport | undefined> {
      const error = await setter(...args);
      if (error) return error;
      notify(item, triggers);
    },
    [item, setter, triggers],
  );
};

export const asGlobalDep = (dep: string) => `*${dep}`;

export const asGlobalDeps = (deps: string[]) => deps.map(asGlobalDep);
