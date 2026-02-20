import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.resolve(__dirname, '../bin');

const scripts = ['audit.js', 'install.js', 'scout.js', 'doctor.js'];

scripts.forEach(script => {
    const scriptPath = path.join(binDir, script);

    test(`${script} Entry point: Help`, () => {
        const result = spawnSync('node', [scriptPath, '--help'], { encoding: 'utf8' });
        assert.strictEqual(result.status, 0);
        assert.match(result.stdout, /Usage:/i);
    });

    test(`${script} Entry point: Version`, () => {
        const result = spawnSync('node', [scriptPath, '--version'], { encoding: 'utf8' });
        assert.strictEqual(result.status, 0);
        assert.match(result.stdout, /^v\d+\.\d+\.\d+/);
    });
});

test('Audit.js: Basic execution', () => {
    const result = spawnSync('node', [path.join(binDir, 'audit.js')], { encoding: 'utf8' });
    assert.strictEqual(result.status, 0);
});

test('Install.js: Missing target error', () => {
    const result = spawnSync('node', [path.join(binDir, 'install.js'), 'non-existent-dir-error'], { encoding: 'utf8' });
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Error:/);
});
