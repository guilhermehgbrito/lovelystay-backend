export type FailureError<TCode extends string, TCause = unknown> = {
  code: TCode;
  message?: string;
  cause: TCause;
};

export type Success<TData> = { error: null; data: TData };
export type Failure<TError extends FailureError<string>> = {
  error: TError;
  data: null;
};

export type Result<TError extends FailureError<string>, TData> =
  | Success<TData>
  | Failure<TError>;

export const isSuccess = <TError extends FailureError<string>, TData>(
  result: Result<TError, TData>,
): result is Success<TData> => {
  return result.error === null;
};

export const isFailure = <TError extends FailureError<string>, TData>(
  result: Result<TError, TData>,
): result is Failure<TError> => {
  return result.error !== null;
};

export const success = <TData>(data: TData): Success<TData> => {
  return { error: null, data };
};

export const failure = <TError extends FailureError<string>>(
  error: TError,
): Failure<TError> => {
  return { error, data: null };
};
