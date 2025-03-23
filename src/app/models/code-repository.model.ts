export type CodeRepositoryRemote = 'github';

export type ProgrammingLanguage = string & {
  readonly __brand: unique symbol;
};

export type CodeRepository = {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  remoteName: CodeRepositoryRemote;
  languages: ProgrammingLanguage[];
  createdAt: Date;
  updatedAt: Date;
};
