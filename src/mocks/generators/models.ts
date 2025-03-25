import { faker } from '@faker-js/faker';
import { User } from '@/app/models/user.model';
import {
  CodeRepository,
  ProgrammingLanguage,
} from '@/app/models/code-repository.model';

export const generateMockUser = (overrides: Partial<User> = {}): User => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  githubId: faker.number.int({ min: 1, max: 1000000 }),
  githubUsername: faker.internet.username(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  location: faker.location.city(),
  bio: faker.lorem.paragraph(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

const programmingLanguages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'Ruby',
  'PHP',
  'Swift',
];

const remoteNames = ['github'];

export const generateMockCodeRepository = (
  overrides: Partial<CodeRepository> = {},
): CodeRepository => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  ownerId: faker.number.int({ min: 1, max: 10000 }),
  remoteName: faker.helpers.arrayElement(
    remoteNames,
  ) as CodeRepository['remoteName'],
  name: faker.word.sample(),
  description: faker.lorem.sentence(),
  languages: faker.helpers.arrayElements(programmingLanguages, {
    min: 1,
    max: 4,
  }) as ProgrammingLanguage[],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const generateMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, () => generateMockUser());
};

export const generateMockCodeRepositories = (
  count: number,
): CodeRepository[] => {
  return Array.from({ length: count }, () => generateMockCodeRepository());
};
