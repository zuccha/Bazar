import { ErrorReport } from './ErrorReport';

export interface EitherError {
  readonly isError: true;
  readonly isValue: false;
  readonly error: ErrorReport;
  readonly map: <R>(
    callbackError: (error: ErrorReport) => R,
    callbackValue: unknown,
  ) => R;
}

export interface EitherValue<T> {
  readonly isError: false;
  readonly isValue: true;
  readonly value: T;
  readonly map: <R>(
    callbackError: unknown,
    callbackRight: (value: T) => R,
  ) => R;
}

export type EitherErrorOr<T> = EitherError | EitherValue<T>;

export const $EitherErrorOr = {
  error: (error: ErrorReport): EitherError => ({
    isError: true,
    isValue: false,
    error,
    map: (callback) => callback(error),
  }),

  value: <T>(value: T): EitherValue<T> => ({
    isError: false,
    isValue: true,
    value,
    map: (_, callback) => callback(value),
  }),
};
