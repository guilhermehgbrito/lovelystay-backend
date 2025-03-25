import { db } from '@/lib/db';
import { getUserCommand } from '@/cli/user/get';
import { findByGithubUsername } from '@/app/data/user.data';
import { isSuccess } from '@/logic/result';
import { User } from '@/app/models/user.model';

jest.mock('@/app/data/user.data', () => {
  const actual = jest.requireActual('@/app/data/user.data');

  return {
    ...actual,
    findByGithubUsername: jest.fn(actual.findByGithubUsername), // Just to spy on the function
  };
});

describe('GitHub CLI User Get', () => {
  const githubUsername = 'octocat'; // GitHub Official Account

  afterEach(async () => {
    await db.none('TRUNCATE TABLE "users" CASCADE');
  });

  afterAll(async () => {
    await db.$pool.end();
  });

  it('should get a user', async () => {
    await getUserCommand.parseAsync([githubUsername], { from: 'user' });

    const user = await findByGithubUsername({ githubUsername });

    expect(user).toBeDefined();
    expect(isSuccess(user)).toBe(true);
    expect(user.data).not.toBeNull();
    expect(user.data).toEqual({
      id: expect.any(Number),
      githubId: 583231,
      githubUsername,
      email: 'octocat@github.com',
      bio: null,
      name: 'The Octocat',
      location: 'San Francisco',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    } as User);
  });

  it('should get a user with code repositories', async () => {
    await getUserCommand.parseAsync([githubUsername], { from: 'user' });

    const user = await findByGithubUsername({ githubUsername });

    expect(user).toBeDefined();
    expect(isSuccess(user)).toBe(true);
    expect(user.data).not.toBeNull();

    const [codeRepositories] = await db.map(
      'SELECT COUNT(*) FROM "code_repositories" WHERE "owner_id" = $1',
      [user.data!.id],
      (row) => row.count,
    );

    expect(codeRepositories).toBeDefined();
    expect(parseInt(codeRepositories)).toBeGreaterThan(0);
  });

  it('should force the user to be fetched from GitHub', async () => {
    await getUserCommand.parseAsync([githubUsername], { from: 'user' });

    const user1 = await findByGithubUsername({ githubUsername });

    expect(isSuccess(user1)).toBe(true);

    await getUserCommand.parseAsync([githubUsername, '--force'], {
      from: 'user',
    });

    const user2 = await findByGithubUsername({ githubUsername });

    expect(isSuccess(user2)).toBe(true);
    expect(user2.data?.updatedAt).not.toEqual(user1.data?.updatedAt);
  });

  it('should not fetch the user if it already exists', async () => {
    await getUserCommand.parseAsync([githubUsername], { from: 'user' });

    const user = await findByGithubUsername({ githubUsername });

    expect(user).toBeDefined();

    await getUserCommand.parseAsync([githubUsername], { from: 'user' });

    const user2 = await findByGithubUsername({ githubUsername });

    expect(user2).toBeDefined();
    expect(isSuccess(user2)).toBe(true);
    expect(user2.data).toEqual(user.data);
  });

  it('should not accept invalid output types', async () => {
    await getUserCommand.parseAsync([githubUsername, '-t', 'invalid'], {
      from: 'user',
    });

    expect(findByGithubUsername).not.toHaveBeenCalled();
  });

  it('should not accept invalid usernames', async () => {
    const invalidUsernames = [
      'using//slashes',
      'using.dots',
      'this-excceeds-39-characters-and-should-be-invalid',
      '"ending-with-hyphen-"',
      '"--starting-with-hyphen"',
      'multiple--consecutive-hyphens',
      'using@at',
    ];

    for (const invalidUsername of invalidUsernames) {
      await getUserCommand.parseAsync([invalidUsername], { from: 'user' });
    }

    expect(findByGithubUsername).not.toHaveBeenCalled();
  });
});
