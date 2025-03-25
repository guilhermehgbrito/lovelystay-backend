import { FailureError, type Result, isFailure } from './result';

/**
 * Coalesce a list of functions and return the first successful result that returns a truthy value
 * @param funcs - A list of functions to coalesce
 * @returns The first successful result or null if all functions fail
 */
export const coalesce = async <T extends Result<FailureError<string>, unknown>>(
  ...funcs: (() => Promise<T>)[]
) => {
  let result: T | null = null;

  for (const func of funcs) {
    result = await func();
    if (isFailure(result) || result.data) {
      return result;
    }
  }

  return result;
};
