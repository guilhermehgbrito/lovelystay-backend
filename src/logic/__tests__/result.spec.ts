import { failure, isFailure, isSuccess, success } from '../result';

describe('Result', () => {
  it('should be a success', () => {
    const result = success('test');
    expect(isSuccess(result)).toBe(true);
    expect(result.data).toBe('test');
    expect(result.error).toBeNull();
    expect(isFailure(result)).toBe(false);
  });

  it('should be a failure', () => {
    const result = failure({
      code: 'TEST_ERROR',
      message: 'Test error',
      cause: new Error('Test error'),
    });
    expect(isFailure(result)).toBe(true);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(isSuccess(result)).toBe(false);
  });
});
