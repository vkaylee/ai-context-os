import test from 'node:test';
import assert from 'node:assert/strict';
import { isKebabCase, isEnglishOnly } from '../bin/utils.js';

test('isKebabCase validation', async (t) => {
    await t.test('accepts valid kebab-case filenames', () => {
        assert.equal(isKebabCase('valid-name.md'), true);
        assert.equal(isKebabCase('another-valid-name.js'), true);
        assert.equal(isKebabCase('simple.txt'), true);
    });

    await t.test('rejects invalid casing', () => {
        assert.equal(isKebabCase('camelCase.md'), false);
        assert.equal(isKebabCase('PascalCase.md'), false);
        assert.equal(isKebabCase('snake_case.md'), false);
        assert.equal(isKebabCase('Spaced Name.md'), false);
        assert.equal(isKebabCase('UPPERCASE.md'), false);
    });

    await t.test('ignores hidden files and special prefixes', () => {
        assert.equal(isKebabCase('.cursorrules'), true);
        assert.equal(isKebabCase('.gitignore'), true);
        assert.equal(isKebabCase('_temp.js'), true);
    });
});

test('isEnglishOnly validation', async (t) => {
    await t.test('accepts plain English text', () => {
        assert.equal(isEnglishOnly('Hello world, this is a test.'), true);
        assert.equal(isEnglishOnly('Markdown headers # like this work too.'), true);
    });

    await t.test('accepts text with emojis and symbols', () => {
        assert.equal(isEnglishOnly('Hello 🌍! You are 100% cool 🎉'), true);
    });

    await t.test('rejects text with Vietnamese diacritics', () => {
        assert.equal(isEnglishOnly('Xin chào thế giới'), false);
        assert.equal(isEnglishOnly('Cảm ơn bạn.'), false);
        assert.equal(isEnglishOnly('Đây là tiếng Việt.'), false);
    });
});
