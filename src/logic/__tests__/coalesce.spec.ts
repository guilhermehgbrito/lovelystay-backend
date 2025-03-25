import { coalesce } from '../coalesce';
import {
  failure,
  isFailure,
  isSuccess,
  success,
  type FailureError,
  type Result,
} from '../result';

type TestError = FailureError<string>;

describe('coalesce', () => {
  it('should return the first successful truthy value', async () => {
    const func1 = async () => success('');
    const func2 = async () => success('');
    const func3 = async () => success('c');

    const res = await coalesce<Result<TestError, string>>(func1, func2, func3);

    expect(res).not.toBeNull();
    expect(isSuccess(res!)).toBeTruthy();
    expect(res!.data).toBe('c');
  });

  it('should return a failure if a function returns a failure', async () => {
    const func2 = async () => success('');
    const func1 = async () =>
      failure({
        code: 'TEST_ERROR',
        message: 'Test error',
        cause: new Error('Test error'),
      });
    const func3 = async () => success('c');

    const res = await coalesce<Result<TestError, string>>(func1, func2, func3);

    expect(res).not.toBeNull();
    expect(isFailure(res!)).toBeTruthy();
    expect(res!.error!.code).toBe('TEST_ERROR');
  });
});
