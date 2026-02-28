/**
 * E2E tests for the BlackRoad CLI binary (bin/br.js)
 * Uses Node.js built-in test runner and child_process to exercise the CLI.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = join(__dirname, '..', 'bin', 'br.js');

async function br(...args) {
  try {
    const { stdout, stderr } = await execFileAsync('node', [BIN, ...args], {
      timeout: 10000,
    });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      code: err.code ?? 1,
    };
  }
}

describe('CLI binary (E2E)', () => {
  it('prints version with --version', async () => {
    const { stdout, code } = await br('--version');
    assert.equal(code, 0);
    // version should look like a semver string
    assert.match(stdout.trim(), /^\d+\.\d+\.\d+$/);
  });

  it('prints help with --help', async () => {
    const { stdout, code } = await br('--help');
    assert.equal(code, 0);
    assert.ok(stdout.includes('Usage:'), 'help should include Usage:');
    assert.ok(stdout.includes('status'), 'help should list status command');
    assert.ok(stdout.includes('deploy'), 'help should list deploy command');
    assert.ok(stdout.includes('health'), 'help should list health command');
  });

  it('status --help shows status options', async () => {
    const { stdout, code } = await br('status', '--help');
    assert.equal(code, 0);
    assert.ok(stdout.includes('--json') || stdout.includes('json'), 'status help should mention --json');
    assert.ok(stdout.includes('--watch') || stdout.includes('watch'), 'status help should mention --watch');
  });

  it('deploy --help shows deploy options', async () => {
    const { stdout, code } = await br('deploy', '--help');
    assert.equal(code, 0);
    assert.ok(stdout.includes('--all') || stdout.includes('service'), 'deploy help should show options');
  });

  it('emoji --help shows emoji options', async () => {
    const { stdout, code } = await br('emoji', '--help');
    assert.equal(code, 0);
    assert.ok(stdout.toLowerCase().includes('emoji') || stdout.includes('translate'));
  });

  it('notify --prefixes lists log prefixes', async () => {
    const { stdout, code } = await br('notify', '--prefixes');
    assert.equal(code, 0);
    assert.ok(stdout.length > 0, 'notify --prefixes should output something');
  });

  it('open with unknown target prints available targets', async () => {
    const { stdout } = await br('open', 'no-such-target-xyz');
    assert.ok(stdout.includes('railway') || stdout.includes('github') || stdout.includes('Unknown'));
  });
});
