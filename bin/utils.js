// @ts-check

/**
 * Console color definitions for CLI output.
 * @type {Object<string, string>}
 */
export const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

/**
 * Check if a filename follows kebab-case.
 * @param {string} filename The name of the file to check.
 * @returns {boolean} True if the filename is kebab-case (or ignored), false otherwise.
 */
export function isKebabCase(filename) {
    if (filename.startsWith('.') || filename.startsWith('_')) return true; // Ignore hidden files

    // Handle compound extensions like .test.js by taking everything before the first dot
    const dotIndex = filename.indexOf('.');
    const nameWithoutExt = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;

    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);
}

/**
 * Basic check for non-English characters in text.
 * Used primarily to enforce English-only documentation in Diamond mode.
 * @param {string} text The text content to analyze.
 * @returns {boolean} True if text does not contain specific Vietnamese diacritics, false otherwise.
 */
export function isEnglishOnly(text) {
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
    return !vietnameseRegex.test(text);
}
