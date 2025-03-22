import { failure, Result } from '@/logic/result';
import { GitHubError, GitHubErrorCodes } from './types';

const errorCodesByStatus: Record<number, GitHubErrorCodes> = {
  404: 'NOT_FOUND',
  403: 'FORBIDDEN',
  401: 'UNAUTHORIZED',
};

export const handleGitHubError = async (
  response: Response,
): Promise<Result<GitHubError, never>> => {
  const errorCode = errorCodesByStatus[response.status];

  const cause = {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    body: await response.json(),
  };

  if (!errorCode) {
    return failure<GitHubError>({
      code: 'UNKNOWN',
      cause,
    });
  }

  return failure<GitHubError>({
    code: errorCode,
    cause,
  });
};
