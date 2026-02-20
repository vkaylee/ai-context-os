export const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

/**
 * Check if a filename follows kebab-case.
 */
export function isKebabCase(filename) {
    if (filename.startsWith('.') || filename.startsWith('_')) return true; // Ignore hidden files

    // We parse the name without the extension
    // Handled in caller or here? In audit.js it uses path.parse, so let's expect the full filename here or just the string.
    // Handle compound extensions like .test.js by taking everything before the first dot
    const dotIndex = filename.indexOf('.');
    const nameWithoutExt = dotIndex > 0 ? filename.substring(0, dotIndex) : filename;

    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);
}

/**
 * Basic check for non-English characters in text.
 */
export function isEnglishOnly(text) {
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
    return !vietnameseRegex.test(text);
}
