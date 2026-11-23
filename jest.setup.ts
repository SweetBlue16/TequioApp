import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

/**
 * Polyfill Web Encoding APIs in the JSDOM environment for modern React Router.
 */
Object.assign(globalThis, {
  TextEncoder: TextEncoder as unknown as typeof globalThis.TextEncoder,
  TextDecoder: TextDecoder as unknown as typeof globalThis.TextDecoder,
});
// JSDOM has the dialog element but does not run the browser's modal focus algorithm.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    this.querySelector<HTMLElement>(
      'button:not(:disabled):not([tabindex="-1"]), input:not(:disabled), select:not(:disabled)'
    )?.focus();
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
}
