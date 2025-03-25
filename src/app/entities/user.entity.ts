export type UserEntity = {
  id: number;
  github_id: number;
  github_username: string;
  name: string;
  email: string | null;
  location: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
};
