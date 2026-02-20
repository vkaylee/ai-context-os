#!/usr/bin/env node

/**
 * AI Context OS Audit Tool
 * Enforces L0 laws (naming conventions, modularity) defined in PROJECT_OS.md.
 */

import fs from 'fs';
import path from 'path';
import { COLORS, isKebabCase, isEnglishOnly } from './utils.js';

const MAX_LINES = 200;
const IGNORED_DIRS = ['node_modules', '.git', '.ai-context-os'];
const IGNORED_FILES = [
    'package-lock.json', 'PROJECT_OS.md', 'README.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules',
    'adapter-cursor.md', 'adapter-claude.md', 'adapter-gemini.md', 'utils.test.js'
];

let errorCount = 0;
let warningCount = 0;
let diamondPass = true;

const isDiamondMode = process.argv.includes('--diamond');
const isVersionMode = process.argv.includes('--version') || process.argv.includes('-v');

if (isVersionMode) {
    const __filename = path.join(process.cwd(), 'bin', 'audit.js'); // Heuristic if running locally
    // Better way: use import.meta.url relative to package.json
    const binDir = path.dirname(new URL(import.meta.url).pathname);
    const pkg = JSON.parse(fs.readFileSync(path.join(binDir, '..', 'package.json'), 'utf8'));
    console.log(`v${pkg.version}`);
    process.exit(0);
}

function log(type, message) {
    switch (type) {
        case 'error':
            console.error(`${COLORS.red}${COLORS.bold}[ERROR]${COLORS.reset} ${message}`);
            errorCount++;
            diamondPass = false;
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
        case 'diamond':
            console.log(`${COLORS.cyan}${COLORS.bold}[DIAMOND]${COLORS.reset} ${message}`);
            break;
    }
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

    // Diamond Rule: Language (English Only for .md)
    if (isDiamondMode && filename.endsWith('.md')) {
        if (!isEnglishOnly(content)) {
            log('error', `Language violation: '${filename}' contains non-English characters.`);
            diamondPass = false;
        }
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
    const pointers = ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'];

    for (const p of pointers) {
        const pPath = path.join(root, p);
        if (fs.existsSync(pPath)) {
            const content = fs.readFileSync(pPath, 'utf8');
            if (!content.includes('.ai-context-os')) {
                log('warn', `${p} exists but does not seem to follow the Pointer Pattern.`);
            } else {
                log('success', `${p} pointer is valid.`);
            }
        } else {
            log('info', `${p} not found in root.`);
        }
    }
}

function auditDiamondStandards() {
    const root = process.cwd();
    const goldPath = path.join(root, 'skills', 'gold-standards.md');
    const diamondPath = path.join(root, 'skills', 'diamond-standards.md');

    if (fs.existsSync(goldPath)) {
        log('diamond', 'Gold Engineering Standard detected.');
    } else {
        log('warn', 'Gold Standard skill missing.');
        diamondPass = false;
    }

    if (fs.existsSync(diamondPath)) {
        log('diamond', 'Diamond Engineering Standard detected.');
    } else {
        log('warn', 'Diamond Standard skill missing.');
        diamondPass = false;
    }
}

function auditGitignore() {
    const p = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(p)) return;
    const lines = fs.readFileSync(p, 'utf8').split('\n').map(l => l.trim());
    if (lines.some(l => l === '.local-os' || l === '.local-os/')) {
        log('warn', "'.local-os' is in .gitignore. Team overrides won't sync.");
    }
    for (const f of ['.cursorrules', 'CLAUDE.md', 'GEMINI.md']) {
        if (lines.some(l => l === f)) log('error', `Pointer '${f}' is in .gitignore. Breaks Context Engine.`);
    }
}

// Start Audit
console.log(`${COLORS.bold}\n====================================`);
console.log(`  AI Context OS Audit v1.1.0 ${isDiamondMode ? '[DIAMOND MODE]' : ''} `);
console.log(`====================================${COLORS.reset}\n`);

auditDir(process.cwd());
auditPointerPattern();
auditGitignore();
if (isDiamondMode) auditDiamondStandards();

console.log(`\n------------------------------------`);
if (errorCount > 0) {
    console.log(`${COLORS.red}${COLORS.bold}Audit Failed: ${errorCount} error(s), ${warningCount} warning(s).${COLORS.reset}`);
    process.exit(1);
} else if (isDiamondMode && !diamondPass) {
    console.log(`${COLORS.yellow}${COLORS.bold}Audit Passed with Warnings: Diamond Standard not fully met.${COLORS.reset}`);
    process.exit(0);
} else {
    console.log(`${COLORS.green}${COLORS.bold}Audit Passed: All protocols followed!${COLORS.reset}`);
    process.exit(0);
}
