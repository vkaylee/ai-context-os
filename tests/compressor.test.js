// @ts-check
import test from 'node:test';
import assert from 'node:assert';
import { CompressorEngine } from '../bin/compressor.js';

test('CompressorEngine: Basic Compression', () => {
    const md = `
# Title
## Section
- Rule 1
- Rule 2
This is a target sentence.
    `;
    const compressed = CompressorEngine.compress(md);
    assert.ok(compressed.includes('[TITLE]'));
    assert.ok(compressed.includes('[SECTION]'));
    assert.ok(compressed.includes('!Rule 1'));
    assert.ok(compressed.includes('!Rule 2'));
    assert.ok(compressed.includes('target'));
});

test('CompressorEngine: Token Shaving', () => {
    const md = 'Please ensure that the results are correct.';
    const compressed = CompressorEngine.compress(md);
    // 'please', 'ensure', 'that', 'the', 'are' should be removed
    // The refined compressor also removes 'is', 'of', 'in', 'with' etc.
    assert.ok(!compressed.includes('please'));
    assert.ok(!compressed.includes('ensure'));
    assert.ok(!compressed.includes('that'));
    assert.ok(!compressed.includes('the'));
    assert.ok(!compressed.includes('are'));
});

test('CompressorEngine: Directive Transformation', () => {
    const md = 'This is a MANDATORY requirement. It must be a violation.';
    const compressed = CompressorEngine.compress(md);
    assert.ok(compressed.includes('!!')); // MANDATORY -> !!
    assert.ok(compressed.includes('REQ')); // requirement -> REQ
    assert.ok(compressed.includes('ERR')); // violation -> ERR
});
