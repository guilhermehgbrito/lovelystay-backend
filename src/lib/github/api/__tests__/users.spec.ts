import {
  generateMockGitHubRepositories,
  generateMockGitHubRepositoryLanguages,
  generateMockGitHubUser,
} from '@/mocks/generators/github';
import {
  getGitHubRepositoryLanguages,
  getGitHubUser,
  getGitHubUserRepositories,
  getGitHubUserRepositoriesStream,
} from '../users';
import { success, failure } from '@/logic/result';
import { gitHubConfig } from '@/lib/github/config';
import { STATUS_CODES } from 'node:http';
describe('GitHub API Users', () => {
  let mockFetch: jest.MockedFunction<typeof globalThis.fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = globalThis.fetch as jest.MockedFunction<
      typeof globalThis.fetch
    >;
  });

  describe('getGitHubUser', () => {
    it('should return a user', async () => {
      const mockUser = generateMockGitHubUser();

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockUser), {
          status: 200,
          statusText: 'OK',
        }),
      );

      const result = await getGitHubUser({ username: mockUser.login });

      const request = mockFetch.mock.calls[0][0] as Request;

      expect(result).toEqual(success(mockUser));
      expect(request).toBeInstanceOf(Request);
      expect(request.url).toEqual(
        `${gitHubConfig.apiBaseUrl}/users/${mockUser.login}`,
      );
      expect(request.method).toEqual('GET');
      if (gitHubConfig.apiKey) {
        expect(request.headers.get('Authorization')).toEqual(
          `Bearer ${gitHubConfig.apiKey}`,
        );
      }
    });

    it('should return an error if the user is not found', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          statusText: STATUS_CODES[404],
        }),
      );

      const result = await getGitHubUser({ username: 'nonexistent' });

      expect(result).toEqual(
        failure({
          code: 'NOT_FOUND',
          cause: expect.any(Object),
        }),
      );
    });

    it('should return an error if the request fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'));

      const result = await getGitHubUser({ username: 'testuser' });

      expect(result).toEqual(
        failure({
          code: 'UNKNOWN',
          cause: expect.any(Error),
        }),
      );
    });

    it('should return an error if the response is not JSON', async () => {
      mockFetch.mockResolvedValue(new Response('Not JSON'));

      const result = await getGitHubUser({ username: 'testuser' });

      expect(result).toEqual(
        failure({
          code: 'UNKNOWN',
          cause: new SyntaxError(),
        }),
      );
    });
  });

  describe('getGitHubUserRepositories', () => {
    it('should return a list of repositories', async () => {
      const mockRepositories = generateMockGitHubRepositories(10);

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockRepositories), {
          status: 200,
          statusText: 'OK',
        }),
      );

      const result = await getGitHubUserRepositories({ username: 'testuser' });

      expect(result).toEqual(
        success({
          repositories: mockRepositories,
          totalPages: 1,
          nextPage: null,
        }),
      );
    });

    it('should handle pagination', async () => {
      const mockRepositories = generateMockGitHubRepositories(10);

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockRepositories), {
          status: 200,
          statusText: 'OK',
          headers: {
            link: '<https://api.github.com/user/123/repos?page=3>; rel="next", <https://api.github.com/user/123/repos?page=5>; rel="last"',
          },
        }),
      );

      const result = await getGitHubUserRepositories({
        username: 'testuser',
        page: 2,
      });

      expect(result).toEqual(
        success({
          repositories: mockRepositories,
          totalPages: 5,
          nextPage: 3,
        }),
      );
    });

    it('should return an error if the page is less than 1', async () => {
      const result = await getGitHubUserRepositories({
        username: 'testuser',
        page: 0,
      });

      expect(result).toEqual(
        failure({
          code: 'INVALID_PAGE',
          message: 'Page must be greater than 0',
          cause: expect.any(Object),
        }),
      );
    });

    it('should return an error if response is not ok', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          statusText: STATUS_CODES[404],
        }),
      );

      const result = await getGitHubUserRepositories({ username: 'testuser' });

      expect(result).toEqual(
        failure({
          code: 'NOT_FOUND',
          cause: expect.any(Object),
        }),
      );
    });

    it('should return an error if the response is not JSON', async () => {
      mockFetch.mockResolvedValue(new Response('Not JSON'));

      const result = await getGitHubUserRepositories({ username: 'testuser' });

      expect(result).toEqual(
        failure({ code: 'UNKNOWN', cause: new SyntaxError() }),
      );
    });

    it('should return an error if the request fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'));

      const result = await getGitHubUserRepositories({ username: 'testuser' });

      expect(result).toEqual(
        failure({ code: 'UNKNOWN', cause: expect.any(Error) }),
      );
    });
  });

  describe('getGitHubRepositoryLanguages', () => {
    it('should return a list of languages', async () => {
      const mockLanguages = generateMockGitHubRepositoryLanguages();

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockLanguages), {
          status: 200,
          statusText: 'OK',
        }),
      );

      const result = await getGitHubRepositoryLanguages({
        username: 'testuser',
        repository: 'testrepo',
      });

      expect(result).toEqual(success(mockLanguages));
    });

    it('should return an error if response is not ok', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          statusText: STATUS_CODES[404],
        }),
      );

      const result = await getGitHubRepositoryLanguages({
        username: 'testuser',
        repository: 'testrepo',
      });

      expect(result).toEqual(
        failure({ code: 'NOT_FOUND', cause: expect.any(Object) }),
      );
    });

    it('should return an error if the response is not JSON', async () => {
      mockFetch.mockResolvedValue(new Response('Not JSON'));

      const result = await getGitHubRepositoryLanguages({
        username: 'testuser',
        repository: 'testrepo',
      });

      expect(result).toEqual(
        failure({ code: 'UNKNOWN', cause: new SyntaxError() }),
      );
    });

    it('should return an error if the request fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'));

      const result = await getGitHubRepositoryLanguages({
        username: 'testuser',
        repository: 'testrepo',
      });

      expect(result).toEqual(
        failure({ code: 'UNKNOWN', cause: expect.any(Error) }),
      );
    });
  });

  describe('getGitHubUserRepositoriesStream', () => {
    it('should return a stream of repositories', async () => {
      const mockRepositoriesPage1 = generateMockGitHubRepositories(10);
      const mockRepositoriesPage2 = generateMockGitHubRepositories(10);

      mockFetch
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockRepositoriesPage1), {
            status: 200,
            statusText: 'OK',
            headers: {
              link: '<https://api.github.com/user/123/repos?page=2>; rel="next", <https://api.github.com/user/123/repos?page=2>; rel="last"',
            },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockRepositoriesPage2), {
            status: 200,
            statusText: 'OK',
          }),
        );

      const result = getGitHubUserRepositoriesStream({ username: 'testuser' });

      let repositories = await result.next();

      expect(repositories.value).toEqual(mockRepositoriesPage1);

      repositories = await result.next();

      expect(repositories.value).toEqual(mockRepositoriesPage2);

      expect(await result.next()).toEqual({ done: true, value: undefined });
    });

    it('should not return an empty array if the user has no repositories', async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          statusText: 'OK',
        }),
      );

      const result = getGitHubUserRepositoriesStream({ username: 'testuser' });

      expect(await result.next()).toEqual({ done: true, value: undefined });
    });

    it('should stop streaming if an error occurs', async () => {
      const mockRepositories = generateMockGitHubRepositories(10);
      mockFetch
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockRepositories), {
            status: 200,
            statusText: 'OK',
            headers: {
              link: '<https://api.github.com/user/123/repos?page=2>; rel="next", <https://api.github.com/user/123/repos?page=2>; rel="last"',
            },
          }),
        )
        .mockRejectedValueOnce(new Error('Network Error'));

      const result = getGitHubUserRepositoriesStream({ username: 'testuser' });

      const repositories = await result.next();

      expect(repositories.value).toEqual(mockRepositories);

      const error = await result.next();

      expect(error.done).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
