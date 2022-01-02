import { DependencyList, useEffect } from 'react';

export default function useEffectAsync(
  fn: () => Promise<unknown>,
  deps: DependencyList,
): void {
  useEffect(() => {
    fn();
  }, deps);
}
