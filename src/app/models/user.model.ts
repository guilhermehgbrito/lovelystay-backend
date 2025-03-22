export type User = {
  id: number;
  githubId: number;
  githubUsername: string;
  name: string;
  email: string | null;
  location: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};
