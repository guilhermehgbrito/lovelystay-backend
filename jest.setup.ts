// Add any setup code here
// This file is automatically loaded by Jest

global.fetch = jest.fn();
process.env.LOG_LEVEL = 'silent';

Object.assign(console, {
  log: jest.fn(),
  table: jest.fn(),
});
