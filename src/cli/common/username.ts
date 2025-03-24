import { z } from 'zod';

export const usernameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9_-]{1,39}$/,
    'Username must contain only alphanumeric characters, underscores, and hyphens. Should be less than 39 characters',
  );
