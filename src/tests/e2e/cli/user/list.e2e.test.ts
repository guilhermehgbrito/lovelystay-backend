import { db } from '@/lib/db';
import {
  generateMockCodeRepository,
  generateMockUser,
} from '@/mocks/generators/models';
import { ProgrammingLanguage } from '@/app/models/code-repository.model';
import { listUserCommand } from '@/cli/user/list';
import { printOutput } from '@/cli/common/output-type';
import { userSql } from '@/lib/db/sql/user';
import { saveCodeRepository } from '@/app/data/code-repository.data';

jest.mock('@/cli/common/output-type.ts', () => {
  return {
    ...jest.requireActual('@/cli/common/output-type.ts'),
    printOutput: jest.fn(),
  };
});

describe('GitHub CLI User Get', () => {
  const mockPrintOutput = printOutput as jest.Mock;

  beforeEach(() => {
    mockPrintOutput.mockClear();
  });

  beforeAll(async () => {
    const mockedUsers = [
      generateMockUser({ location: 'Lisbon' }),
      generateMockUser({ location: 'Lisbon' }),
      generateMockUser({ location: 'Porto' }),
      generateMockUser({ location: 'Coimbra' }),
      generateMockUser({ location: 'Madrid' }),
      generateMockUser({ location: 'Barcelona' }),
      generateMockUser({ location: 'Valencia' }),
    ];

    const mockedLanguages = [
      ['javascript', 'typescript'],
      ['rust', 'typescript'],
      ['python', 'rust'],
      ['go', 'c++'],
      ['javascript', 'typescript'],
      ['c#', 'java'],
      ['kotlin', 'typescript'],
    ] as ProgrammingLanguage[][];

    await db.task('initial-dump', async (t) => {
      for (const user of mockedUsers) {
        const result = await t.one(userSql.saveUser, user);
        user.id = result.id;
      }

      for (const index in mockedUsers) {
        const user = mockedUsers[index];
        const languages = mockedLanguages[index] ?? [];

        await saveCodeRepository(
          generateMockCodeRepository({
            ownerId: user.id,
            languages,
          }),
          t,
        );
      }
    });
  });

  afterAll(async () => {
    await db.$pool.end();
  });

  it('should list users', async () => {
    await listUserCommand.parseAsync([]);

    const [users, options] = mockPrintOutput.mock.calls[0];

    expect(users).toHaveLength(7);
    expect(options.outputType).toBe('json');
  });

  it('should list users with csv output', async () => {
    await listUserCommand.parseAsync(['-t', 'csv'], { from: 'user' });

    const [users, options] = mockPrintOutput.mock.calls[0];

    expect(users).toHaveLength(7);
    expect(options.outputType).toBe('csv');
  });

  it('should list users with table output', async () => {
    await listUserCommand.parseAsync(['-t', 'table'], { from: 'user' });

    const [users, options] = mockPrintOutput.mock.calls[0];

    expect(users).toHaveLength(7);
    expect(options.outputType).toBe('table');
  });

  it('should list users with location filter', async () => {
    await listUserCommand.parseAsync(['--location', 'Lisbon'], {
      from: 'user',
    });

    const [users, options] = mockPrintOutput.mock.calls[0];

    expect(users).toHaveLength(2);
    expect(options.outputType).toBe('json');
  });

  it('should list users with location filter and csv output', async () => {
    await listUserCommand.parseAsync(['--location', 'Lisbon', '-t', 'csv'], {
      from: 'user',
    });

    const [users, options] = mockPrintOutput.mock.calls[0];

    expect(users).toHaveLength(2);
    expect(options.outputType).toBe('csv');
  });

  it('should list users with language filter', async () => {
    await listUserCommand.parseAsync(
      ['--languages', 'javascript', 'typescript'],
      { from: 'user' },
    );

    const [users1, options1] = mockPrintOutput.mock.calls[0];

    expect(users1).toHaveLength(2);
    expect(options1.outputType).toBe('json');

    await listUserCommand.parseAsync(
      ['--languages', 'typescript', '-t', 'csv'],
      { from: 'user' },
    );

    const [users2, options2] = mockPrintOutput.mock.calls.at(-1);

    expect(users2).toHaveLength(4);
    expect(options2.outputType).toBe('csv');
  });

  it('should list users with location and language filter', async () => {
    await listUserCommand.parseAsync(
      ['--location', 'Lisbon', '--languages', 'typescript'],
      { from: 'user' },
    );

    const [users1, options1] = mockPrintOutput.mock.calls[0];

    expect(users1).toHaveLength(2);
    expect(options1.outputType).toBe('json');

    await listUserCommand.parseAsync(
      ['--location', 'Lisbon', '--languages', 'javascript', '-t', 'csv'],
      { from: 'user' },
    );

    const [users2, options2] = mockPrintOutput.mock.calls.at(-1);

    expect(users2).toHaveLength(1);
    expect(options2.outputType).toBe('csv');
  });

  it('should not list users with invalid location filter', async () => {
    await listUserCommand.parseAsync(
      ['--location', '"in.valid"', '-t', 'json'],
      { from: 'user' },
    );

    expect(mockPrintOutput).not.toHaveBeenCalled();
  });

  it('should not list users with invalid language filter', async () => {
    await listUserCommand.parseAsync(['--languages', '"/@as"', '-t', 'json'], {
      from: 'user',
    });

    expect(mockPrintOutput).not.toHaveBeenCalled();
  });

  it('should not list users with invalid output type', async () => {
    await listUserCommand.parseAsync(['-t', 'invalid'], { from: 'user' });

    expect(mockPrintOutput).not.toHaveBeenCalled();
  });
});
