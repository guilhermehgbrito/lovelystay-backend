import { FailureError } from '@/logic/result';

export type MigrationsErrorCodes = 'UNKNOWN';
export type MigrationsError = FailureError<MigrationsErrorCodes>;
