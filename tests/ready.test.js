// @ts-check
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '../bin/cli.js');

test('CLI: scout --ready atomic payload', () => {
    const result = spawnSync('node', [cliPath, 'scout', '--ready'], { encoding: 'utf8' });

    assert.strictEqual(result.status, 0);
    const lines = result.stdout.trim().split('\n');

    // Line 1 should be ULTP
    assert.ok(lines[0].startsWith('[OS:D]'));
    assert.ok(lines[0].includes('[L0:V;P:.ai-context-os/PROJECT_OS.md]'));

    // Line 2 should be separator
    assert.strictEqual(lines[1], '---');

    // Line 3+ should be compressed logic
    assert.ok(result.stdout.includes('[🚀 PROJECT OS: AI CONTEXT ORCHESTRATOR KERNEL]'));
    assert.ok(result.stdout.includes('**Single Source Truth (SSOT)**'));
});
