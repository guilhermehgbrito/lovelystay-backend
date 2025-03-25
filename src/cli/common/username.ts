import { z } from 'zod';

/**
 * According to the form validation messages on [Join Github page](https://github.com/join),

  Github username may only contain alphanumeric characters or hyphens.
  Github username cannot have multiple consecutive hyphens.
  Github username cannot begin or end with a hyphen.
  Maximum is 39 characters.
 */
export const usernameSchema = z
  .string()
  .regex(
    /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
    'Username must contain only alphanumeric characters, underscores, and hyphens. Should be less than 39 characters',
  );
