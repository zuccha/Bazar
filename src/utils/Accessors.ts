import ErrorReport from './ErrorReport';

export type Getter<Args extends unknown[], Return> = { deps: string[] } & ((
  ...args: Args
) => Return);

export type Setter<Args extends unknown[], Return> = { triggers: string[] } & ((
  ...args: Args
) => Return);

export interface AsyncResponse<T> {
  error: ErrorReport | undefined;
  isLoading: boolean;
  value: T | undefined;
}

export const getter = <Args extends unknown[], Return>(
  deps: string[],
  fn: (...args: Args) => Return,
): Getter<Args, Return> => {
  const wrapper = (...args: Args): Return => fn(...args);
  wrapper.deps = deps;
  return wrapper;
};

export const setter = <Args extends unknown[], Return>(
  triggers: string[],
  fn: (...args: Args) => Return,
): Setter<Args, Return> => {
  const wrapper = (...args: Args): Return => fn(...args);
  wrapper.triggers = triggers;
  return wrapper;
};
