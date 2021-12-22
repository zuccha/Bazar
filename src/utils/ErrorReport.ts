export interface ErrorReport {
  readonly main: string;
  readonly others: string[];
  all: () => string[];
  extend: (message: string) => ErrorReport;
}

export const $ErrorReport = {
  make: (main: string, others: string[] = []): ErrorReport => {
    return {
      main,
      others,
      all: () => [main, ...others],
      extend: (message: string) =>
        $ErrorReport.make(message, [main, ...others]),
    };
  },
};
