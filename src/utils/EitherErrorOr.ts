import ErrorReport from './ErrorReport';

export interface EitherError {
  readonly isError: true;
  readonly isValue: false;
  readonly error: ErrorReport;
}

export interface EitherValue<T> {
  readonly isError: false;
  readonly isValue: true;
  readonly value: T;
}

export type EitherErrorOr<T> = EitherError | EitherValue<T>;

export const $EitherErrorOr = {
  error: (error: ErrorReport): EitherError => ({
    isError: true,
    isValue: false,
    error,
  }),

  value: <T>(value: T): EitherValue<T> => ({
    isError: false,
    isValue: true,
    value,
  }),
};
