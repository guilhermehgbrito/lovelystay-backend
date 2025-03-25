import { success } from '@/logic/result';
import { Result } from '@/logic/result';
import { GitHubRepository } from '@/lib/github/types';
import { ProgrammingLanguage } from '@/app/models/code-repository.model';
import { generateMockGitHubRepositoryLanguages } from '@/mocks/generators/github';

export const fetchAndSaveCodeRepositories = jest.fn(
  async (params: {
    githubUsername: string;
  }): Promise<Result<never, { totalSaved: number; totalFailed: number }>> => {
    return success({ totalSaved: 1, totalFailed: 0 });
  },
);

export const fetchLanguagesForRepositories = jest.fn(
  async (params: {
    githubUsername: string;
    repositories: GitHubRepository[];
  }): Promise<Result<never, ProgrammingLanguage[][]>> => {
    return success(
      Array.from(
        { length: params.repositories.length },
        () =>
          Object.keys(
            generateMockGitHubRepositoryLanguages(),
          ) as ProgrammingLanguage[],
      ),
    );
  },
);
