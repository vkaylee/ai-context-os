#!/usr/bin/env node

/**
 * AI Context OS Audit Tool
 * Enforces L0 laws (naming conventions, modularity) defined in PROJECT_OS.md.
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const MAX_LINES = 200;
const IGNORED_DIRS = ['node_modules', '.git', '.ai-context-os'];
const IGNORED_FILES = ['package-lock.json', 'PROJECT_OS.md', 'README.md', 'CLAUDE.md'];

let errorCount = 0;
let warningCount = 0;

function log(type, message) {
    switch (type) {
        case 'error':
            console.error(`${COLORS.red}${COLORS.bold}[ERROR]${COLORS.reset} ${message}`);
            errorCount++;
            break;
        case 'warn':
            console.warn(`${COLORS.yellow}${COLORS.bold}[WARN]${COLORS.reset} ${message}`);
            warningCount++;
            break;
        case 'success':
            console.log(`${COLORS.green}✔${COLORS.reset} ${message}`);
            break;
        case 'info':
            console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${message}`);
            break;
    }
}

/**
 * Check if a filename follows kebab-case.
 */
function isKebabCase(filename) {
    if (filename.startsWith('.') || filename.startsWith('_')) return true; // Ignore hidden files
    const nameWithoutExt = path.parse(filename).name;
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);
}

/**
 * Audit a single file.
 */
function auditFile(filePath) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;

    // Rule: Naming Convention (kebab-case)
    if (!isKebabCase(filename) && !IGNORED_FILES.includes(filename)) {
        log('error', `Naming violation: '${filename}' must be kebab-case.`);
    }

    // Rule: Modularity (< 200 lines)
    if (lines > MAX_LINES) {
        log('error', `Modularity violation: '${filename}' has ${lines} lines (Max: ${MAX_LINES}).`);
    }
}

/**
 * Recursively audit a directory.
 */
function auditDir(dirPath) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        if (IGNORED_DIRS.includes(item)) continue;

        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            auditDir(fullPath);
        } else if (stats.isFile()) {
            auditFile(fullPath);
        }
    }
}

function auditPointerPattern() {
    const root = process.cwd();
    const cursorRulesLocal = path.join(root, '.cursorrules');
    const claudeMdLocal = path.join(root, 'CLAUDE.md');

    if (fs.existsSync(cursorRulesLocal)) {
        const content = fs.readFileSync(cursorRulesLocal, 'utf8');
        if (!content.includes('.ai-context-os')) {
            log('warn', '.cursorrules exists but does not seem to follow the Pointer Pattern.');
        }
    } else {
        log('info', '.cursorrules not found in root.');
    }

    if (fs.existsSync(claudeMdLocal)) {
        const content = fs.readFileSync(claudeMdLocal, 'utf8');
        if (!content.includes('.ai-context-os')) {
            log('warn', 'CLAUDE.md exists but does not seem to follow the Pointer Pattern.');
        }
    } else {
        log('info', 'CLAUDE.md not found in root.');
    }
}

// Start Audit
console.log(`${COLORS.bold}\n==============================`);
console.log(`  AI Context OS Audit v1.0.0  `);
console.log(`==============================${COLORS.reset}\n`);

auditDir(process.cwd());
auditPointerPattern();

console.log(`\n------------------------------`);
if (errorCount > 0) {
    console.log(`${COLORS.red}${COLORS.bold}Audit Failed: ${errorCount} error(s), ${warningCount} warning(s).${COLORS.reset}`);
    process.exit(1);
} else {
    console.log(`${COLORS.green}${COLORS.bold}Audit Passed: All protocols followed!${COLORS.reset}`);
    process.exit(0);
}
