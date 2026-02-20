import test from 'node:test';
import assert from 'node:assert';
import { AuditEngine } from '../bin/audit.js';

test('AuditEngine: Naming Conventions', () => {
    const engine = new AuditEngine();

    // Positive
    assert.strictEqual(engine.validateFile('valid-name.js', 'console.log(1)'), true);

    // Negative
    assert.strictEqual(engine.validateFile('invalidName.js', 'console.log(1)'), false);
    assert.match(engine.results.errors[0], /Naming violation/);
});

test('AuditEngine: Modularity (Line Limits)', () => {
    const engine = new AuditEngine();

    // Positive (100 lines)
    const goodContent = 'line\n'.repeat(100);
    assert.strictEqual(engine.validateFile('short.js', goodContent), true);

    // Negative (300 lines)
    const badContent = 'line\n'.repeat(300);
    assert.strictEqual(engine.validateFile('long.js', badContent), false);
    assert.match(engine.results.errors[0], /Modularity violation: 'long.js' has 301 lines/);
});

test('AuditEngine: Diamond Mode - Language Check', () => {
    const engine = new AuditEngine({ isDiamondMode: true });

    // Positive (English)
    assert.strictEqual(engine.validateFile('doc.md', 'Only English here'), true);

    // Negative (Vietnamese)
    assert.strictEqual(engine.validateFile('doc-vn.md', 'Có tiếng Việt'), false);
    assert.match(engine.results.errors[0], /Language violation: 'doc-vn.md' contains non-English characters/);
    assert.strictEqual(engine.diamondPass, false);
});

test('AuditEngine: Pointer Pattern Verification', () => {
    const engine = new AuditEngine();

    // Positive
    assert.strictEqual(engine.validatePointer('CLAUDE.md', 'Ref: .ai-context-os/CLAUDE.md'), true);

    // Negative
    assert.strictEqual(engine.validatePointer('FAKE.md', 'No pointer link here'), false);
    assert.match(engine.results.warnings[0], /does not seem to follow the Pointer Pattern/);
});
