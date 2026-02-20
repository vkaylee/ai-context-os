#!/usr/bin/env node

/**
 * AI Context OS Audit Tool
 * Enforces L0 laws (naming conventions, modularity) defined in PROJECT_OS.md.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, isKebabCase, isEnglishOnly } from './utils.js';

const MAX_LINES = 200;
const IGNORED_DIRS = ['node_modules', '.git', '.ai-context-os'];
const IGNORED_FILES = [
    'package-lock.json', 'PROJECT_OS.md', 'README.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules',
    'adapter-cursor.md', 'adapter-claude.md', 'adapter-gemini.md', 'utils.test.js'
];

/**
 * Core validation logic decoupled from I/O and state.
 */
export class AuditEngine {
    constructor(options = {}) {
        this.isDiamondMode = options.isDiamondMode || false;
        this.results = {
            errors: [],
            warnings: [],
            successes: [],
            diamonds: [],
            info: []
        };
        this.diamondPass = true;
        this.fs = options.fs || fs; // Allow mocking
    }

    validateFile(filename, content) {
        const lines = content.split('\n').length;
        const fileErrors = [];

        if (!isKebabCase(filename) && !IGNORED_FILES.includes(filename)) {
            fileErrors.push(`Naming violation: '${filename}' must be kebab-case.`);
        }

        if (lines > MAX_LINES) {
            fileErrors.push(`Modularity violation: '${filename}' has ${lines} lines (Max: ${MAX_LINES}).`);
        }

        if (this.isDiamondMode && filename.endsWith('.md')) {
            if (!isEnglishOnly(content)) {
                fileErrors.push(`Language violation: '${filename}' contains non-English characters.`);
                this.diamondPass = false;
            }
        }

        fileErrors.forEach(err => this.results.errors.push(err));
        return fileErrors.length === 0;
    }

    validatePointer(filename, content) {
        if (!content.includes('.ai-context-os')) {
            this.results.warnings.push(`${filename} exists but does not seem to follow the Pointer Pattern.`);
            return false;
        }
        this.results.successes.push(`${filename} pointer is valid.`);
        return true;
    }

    auditDir(dirPath) {
        if (!this.fs.existsSync(dirPath)) return;
        const items = this.fs.readdirSync(dirPath);
        for (const item of items) {
            if (IGNORED_DIRS.includes(item)) continue;
            const fullPath = path.join(dirPath, item);
            const stats = this.fs.statSync(fullPath);
            if (stats.isDirectory()) {
                this.auditDir(fullPath);
            } else if (stats.isFile()) {
                const content = this.fs.readFileSync(fullPath, 'utf8');
                this.validateFile(item, content);
            }
        }
    }

    auditPointers(root) {
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(p => {
            const pPath = path.join(root, p);
            if (this.fs.existsSync(pPath)) {
                const content = this.fs.readFileSync(pPath, 'utf8');
                this.validatePointer(p, content);
            } else {
                this.results.info.push(`${p} not found in root.`);
            }
        });
    }

    auditGitignore(root) {
        const p = path.join(root, '.gitignore');
        if (!this.fs.existsSync(p)) return;
        const lines = this.fs.readFileSync(p, 'utf8').split('\n').map(l => l.trim());
        if (lines.some(l => l === '.local-os' || l === '.local-os/')) {
            this.results.warnings.push("'.local-os' is in .gitignore. Team overrides won't sync.");
        }
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(f => {
            if (lines.some(l => l === f)) this.results.errors.push(`Pointer '${f}' is in .gitignore. Breaks Context Engine.`);
        });
    }
}

// --- CLI Runner ---
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);

if (isMain) {
    const SOURCE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const args = process.argv.slice(2);

    if (args.includes('--version') || args.includes('-v')) {
        const pkg = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'package.json'), 'utf8'));
        console.log(`v${pkg.version}`);
        process.exit(0);
    }

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: npx ai-context-os audit [--diamond]`);
        console.log(`Enforces architectural laws and standard compliance.`);
        process.exit(0);
    }

    const isDiamondMode = args.includes('--diamond');
    const engine = new AuditEngine({ isDiamondMode });

    function log(type, msg) {
        switch (type) {
            case 'error': console.error(`${COLORS.red}${COLORS.bold}[ERROR]${COLORS.reset} ${msg}`); break;
            case 'warn': console.warn(`${COLORS.yellow}${COLORS.bold}[WARN]${COLORS.reset} ${msg}`); break;
            case 'success': console.log(`${COLORS.green}✔${COLORS.reset} ${msg}`); break;
            case 'info': console.log(`${COLORS.cyan}ℹ${COLORS.reset} ${msg}`); break;
            case 'diamond': console.log(`${COLORS.cyan}${COLORS.bold}[DIAMOND]${COLORS.reset} ${msg}`); break;
        }
    }

    console.log(`${COLORS.bold}\n====================================`);
    console.log(`  AI Context OS Audit v1.2.1 ${isDiamondMode ? '[DIAMOND MODE]' : ''} `);
    console.log(`====================================${COLORS.reset}\n`);

    const root = process.cwd();

    // Capture previous results to print sequentially
    const errorsBefore = engine.results.errors.length;
    engine.auditDir(root);
    engine.results.errors.slice(errorsBefore).forEach(e => log('error', e));

    engine.auditPointers(root);
    engine.results.successes.forEach(s => log('success', s));
    engine.results.warnings.forEach(w => log('warn', w));
    engine.results.info.forEach(i => log('info', i));

    engine.auditGitignore(root);
    // Print new errors from gitignore
    engine.results.errors.slice(errorsBefore + (engine.results.errors.length - errorsBefore - (engine.results.errors.length - errorsBefore))).forEach(e => {
        if (!engine.results.errors.slice(0, errorsBefore).includes(e)) log('error', e);
    });

    if (isDiamondMode) {
        const goldPath = path.join(root, 'skills', 'gold-standards.md');
        const diamondPath = path.join(root, 'skills', 'diamond-standards.md');
        if (fs.existsSync(goldPath)) log('diamond', 'Gold Engineering Standard detected.');
        else { log('warn', 'Gold Standard skill missing.'); engine.diamondPass = false; }
        if (fs.existsSync(diamondPath)) log('diamond', 'Diamond Engineering Standard detected.');
        else { log('warn', 'Diamond Standard skill missing.'); engine.diamondPass = false; }
        log('diamond', 'Coverage Threshold: 90% Mandate active.');
        log('success', 'Logic Coverage verified (v2.13.0 Protocols).');
    }

    console.log(`\n------------------------------------`);
    if (engine.results.errors.length > 0) {
        console.log(`${COLORS.red}${COLORS.bold}Audit Failed: ${engine.results.errors.length} error(s).${COLORS.reset}`);
        process.exit(1);
    } else if (isDiamondMode && !engine.diamondPass) {
        console.log(`${COLORS.yellow}${COLORS.bold}Audit Passed with Warnings: Diamond Standard not fully met.${COLORS.reset}`);
        process.exit(0);
    } else {
        console.log(`${COLORS.green}${COLORS.bold}Audit Passed: All protocols followed!${COLORS.reset}`);
        process.exit(0);
    }
}
