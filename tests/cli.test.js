import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '../bin/cli.js');

test('CLI Dispatcher: Help Output', () => {
    const result = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8' });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /AI Context OS CLI/);
    assert.match(result.stdout, /Available Commands:/);
});

test('CLI Dispatcher: Version Output', () => {
    const result = spawnSync('node', [cliPath, '--version'], { encoding: 'utf8' });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /^v\d+\.\d+\.\d+/);
});

test('CLI Dispatcher: Dynamic Command Registry - Doctor', () => {
    const result = spawnSync('node', [cliPath, 'doctor'], { encoding: 'utf8' });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /AI Context OS - Doctor/);
});

test('CLI Dispatcher: Dynamic Command Registry - Scout', () => {
    const result = spawnSync('node', [cliPath, 'scout'], { encoding: 'utf8' });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /AI Context OS Scout/);
});

test('CLI Dispatcher: Invalid Command Fallback (Path Mode)', () => {
    // Should attempt to run 'install' on a non-existent path
    const result = spawnSync('node', [cliPath, 'non-existent-path'], { encoding: 'utf8' });
    // It should fail in install.js but the dispatcher successfully routed it
    assert.match(result.stderr || result.stdout, /Error: Target directory .* does not exist/);
});
