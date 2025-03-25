import { IBaseProtocol } from 'pg-promise';

export const db = {
  one: jest.fn(),
  oneOrNone: jest.fn(),
  manyOrNone: jest.fn(),
  tx: jest.fn(),
  none: jest.fn(),
  result: jest.fn(),
  query: jest.fn(),
  many: jest.fn(),
  multiResult: jest.fn(),
  any: jest.fn(),
  multi: jest.fn(),
  stream: jest.fn(),
  func: jest.fn(),
  proc: jest.fn(),
  map: jest.fn(),
  each: jest.fn(),
  task: jest.fn(),
  taskIf: jest.fn(),
  txIf: jest.fn(),
} as jest.Mocked<IBaseProtocol<unknown>>;

export const pgp = jest.requireActual('pg-promise')();
