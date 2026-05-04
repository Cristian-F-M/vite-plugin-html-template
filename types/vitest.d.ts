import 'vitest';

interface CustomMatchers<R = unknown> {
  /**
   * Compare if a HTML string container to another one, 
   * ingnoring spaces, tabs and break lines.
   */
  toContainHTML(expected: string): R;
}

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: ----
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}