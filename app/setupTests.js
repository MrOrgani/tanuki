// optional: configure or set up a testing framework before each test
// if you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
import '@testing-library/jest-dom/extend-expect';

require('whatwg-fetch');
jest.mock('components/common/Avatar');

window.scrollTo = jest.fn();
// used for __tests__/testing-library.js
// learn more: https://github.com/testing-library/jest-dom

jest.mock('utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));
