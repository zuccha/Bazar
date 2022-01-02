export const $Function = {
  debounce: <Args extends unknown[], Return>(
    fn: (...args: Args) => Promise<Return>,
    wait?: number,
  ): ((...args: Args) => Promise<Return>) => {
    let timeout: ReturnType<typeof setTimeout>;
    return wait
      ? (...args: Args) => {
          return new Promise((resolve) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => resolve(fn(...args)), wait);
          });
        }
      : fn;
  },
};
