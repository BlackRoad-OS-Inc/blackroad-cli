import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sleep } from '../lib/utils.js';

describe('sleep utility', () => {
  test('resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 45, `expected >= 45ms, got ${elapsed}ms`);
  });

  test('returns a Promise', () => {
    const result = sleep(0);
    assert.ok(result instanceof Promise);
    return result;
  });
});
