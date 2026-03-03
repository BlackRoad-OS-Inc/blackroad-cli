import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateUrl } from '../lib/utils.js';

describe('URL validation (open command)', () => {
  test('accepts valid https URLs', () => {
    assert.equal(validateUrl('https://blackroad.io'), true);
    assert.equal(validateUrl('https://api.blackroad.io/v1'), true);
  });

  test('accepts valid http URLs', () => {
    assert.equal(validateUrl('http://localhost:3000'), true);
  });

  test('rejects non-URL strings', () => {
    assert.equal(validateUrl('not-a-url'), false);
    assert.equal(validateUrl(''), false);
    assert.equal(validateUrl('   '), false);
  });

  test('rejects javascript: and file: protocols', () => {
    assert.equal(validateUrl('javascript:alert(1)'), false);
    assert.equal(validateUrl('file:///etc/passwd'), false);
  });

  test('rejects shell-injection attempts', () => {
    assert.equal(validateUrl('https://x.com"; rm -rf /'), false);
    assert.equal(validateUrl('; rm -rf /'), false);
  });
});
