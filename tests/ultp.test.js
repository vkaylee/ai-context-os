// @ts-check
import test from 'node:test';
import assert from 'node:assert';
import { ULTP } from '../bin/ultp.js';

test('ULTP Engine: Encoding & Decoding', () => {
    /** @type {import('../bin/ultp.js').ULTPState} */
    const state = {
        environment: { osRoot: './.os/', status: 'ACTIVE', isDogfooding: false },
        kernel: { found: true, path: 'os.md' },
        adapters: [
            { name: '.cursorrules', found: true, pointsTo: '.os' },
            { name: 'CLAUDE.md', found: true, pointsTo: '.os' }
        ],
        skills: ['py', 'js']
    };

    const encoded = ULTP.encode(state);
    // Lists are sorted alphabetically in v2.17.0+
    assert.strictEqual(encoded, '[OS:A][L0:V;P:os.md][L1:C,K][L2:js,py]');

    assert.ok(ULTP.validate(encoded));

    const decoded = ULTP.decode(encoded);
    assert.ok(decoded);
    assert.strictEqual(decoded.os, 'A');
    assert.strictEqual(decoded.kernel.found, true);
    assert.strictEqual(decoded.kernel.path, 'os.md');
    assert.deepEqual(decoded.skills, ['js', 'py']);
});

test('ULTP Engine: Syntax Validation', () => {
    assert.ok(ULTP.validate('[OS:A][L0:V;P:os.md][L1:C][L2:js]'));
    assert.ok(ULTP.validate('[OS:N][L0:X;P:][L1:][L2:]'));

    assert.strictEqual(ULTP.validate('invalid'), false);
    assert.strictEqual(ULTP.validate('[OS:A][L0:V]'), false); // Missing sections
    assert.strictEqual(ULTP.validate('[OS:Z][L0:V;P:os.md][L1:][L2:]'), false); // Invalid OS status
});

test('ULTP Engine: Efficiency vs JSON', () => {
    const state = {
        environment: { osRoot: './.os/', status: 'ACTIVE', isDogfooding: false },
        kernel: { found: true, path: 'os.md' },
        adapters: [{ name: '.cursorrules', found: true, pointsTo: '.os' }],
        skills: ['tdd', 'audit']
    };

    const jsonStr = JSON.stringify(state);
    const ultpStr = ULTP.encode(state);

    console.log(`JSON Length: ${jsonStr.length}`);
    console.log(`ULTP Length: ${ultpStr.length}`);

    // JSON: ~140 chars, ULTP: ~40 chars. Should be < 50%
    assert.ok(ultpStr.length < (jsonStr.length / 2));
});
