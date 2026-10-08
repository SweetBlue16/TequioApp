import '@testing-library/jest-dom';
// eslint-disable-next-line import/no-nodejs-modules
import { TextEncoder, TextDecoder } from 'node:util';

/**
 * Polyfill Web Encoding APIs in the JSDOM environment for modern React Router.
 */
Object.assign(globalThis, {
  TextEncoder: TextEncoder as unknown as typeof globalThis.TextEncoder,
  TextDecoder: TextDecoder as unknown as typeof globalThis.TextDecoder,
});