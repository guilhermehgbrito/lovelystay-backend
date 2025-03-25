import { z } from 'zod';

const gitHubConfigSchema = z.object({
  apiKey: z.string().optional(),
  apiVersion: z.string().optional().default('2022-11-28'),
  apiBaseUrl: z
    .string()
    .transform((value) => value.replace(/\/$/, ''))
    .default('https://api.github.com'),
});

export const gitHubConfig = gitHubConfigSchema.parse({
  apiKey: process.env.GITHUB_API_KEY,
  apiVersion: process.env.GITHUB_API_VERSION,
  apiBaseUrl: process.env.GITHUB_API_BASE_URL,
});

export const getBaseHeaders = () => {
  const headers = new Headers();

  if (gitHubConfig.apiKey) {
    headers.set('Authorization', `Bearer ${gitHubConfig.apiKey}`);
  }

  headers.set('X-GitHub-Api-Version', gitHubConfig.apiVersion);
  headers.set('Accept', 'application/vnd.github+json');

  return headers;
};

export const getBaseRequest = (path: string) => {
  return new Request(`${gitHubConfig.apiBaseUrl}${path}`, {
    headers: getBaseHeaders(),
  });
};
