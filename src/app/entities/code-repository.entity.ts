export type CodeRepositoryEntity = {
  id: number;
  owner_id: number;
  remote_name: string;
  name: string;
  description: string | null;
  languages: string[];
  created_at: Date;
  updated_at: Date;
};
