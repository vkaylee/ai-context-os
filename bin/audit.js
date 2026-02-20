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
            diamonds: []
        };
        this.diamondPass = true;
    }

    validateFile(filename, content) {
        const lines = content.split('\n').length;
        const fileErrors = [];

        // Rule: Naming Convention
        if (!isKebabCase(filename) && !IGNORED_FILES.includes(filename)) {
            fileErrors.push(`Naming violation: '${filename}' must be kebab-case.`);
        }

        // Rule: Modularity
        if (lines > MAX_LINES) {
            fileErrors.push(`Modularity violation: '${filename}' has ${lines} lines (Max: ${MAX_LINES}).`);
        }

        // Diamond Rule: Language
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
}

// --- CLI Runner ---
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);

if (isMain) {
    const isDiamondMode = process.argv.includes('--diamond');
    const isVersionMode = process.argv.includes('--version') || process.argv.includes('-v');

    if (isVersionMode) {
        const binDir = path.dirname(fileURLToPath(import.meta.url));
        const pkg = JSON.parse(fs.readFileSync(path.join(binDir, '..', 'package.json'), 'utf8'));
        console.log(`v${pkg.version}`);
        process.exit(0);
    }

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

    const auditDir = (dirPath) => {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            if (IGNORED_DIRS.includes(item)) continue;
            const fullPath = path.join(dirPath, item);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                auditDir(fullPath);
            } else if (stats.isFile()) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const prevErrorCount = engine.results.errors.length;
                engine.validateFile(item, content);
                if (engine.results.errors.length > prevErrorCount) {
                    const newErrors = engine.results.errors.slice(prevErrorCount);
                    newErrors.forEach(err => log('error', err));
                }
            }
        }
    };

    const auditPointers = () => {
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(p => {
            const pPath = path.join(process.cwd(), p);
            if (fs.existsSync(pPath)) {
                const content = fs.readFileSync(pPath, 'utf8');
                const prevWarnCount = engine.results.warnings.length;
                engine.validatePointer(p, content);
                if (engine.results.warnings.length > prevWarnCount) {
                    log('warn', engine.results.warnings[engine.results.warnings.length - 1]);
                } else {
                    log('success', `${p} pointer is valid.`);
                }
            } else {
                log('info', `${p} not found in root.`);
            }
        });
    };

    const auditGitignore = () => {
        const p = path.join(process.cwd(), '.gitignore');
        if (!fs.existsSync(p)) return;
        const lines = fs.readFileSync(p, 'utf8').split('\n').map(l => l.trim());
        if (lines.some(l => l === '.local-os' || l === '.local-os/')) {
            log('warn', "'.local-os' is in .gitignore. Team overrides won't sync.");
        }
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(f => {
            if (lines.some(l => l === f)) log('error', `Pointer '${f}' is in .gitignore. Breaks Context Engine.`);
        });
    };

    const auditDiamondResources = () => {
        const root = process.cwd();
        const goldPath = path.join(root, 'skills', 'gold-standards.md');
        const diamondPath = path.join(root, 'skills', 'diamond-standards.md');

        if (fs.existsSync(goldPath)) log('diamond', 'Gold Engineering Standard detected.');
        else { log('warn', 'Gold Standard skill missing.'); engine.diamondPass = false; }

        if (fs.existsSync(diamondPath)) log('diamond', 'Diamond Engineering Standard detected.');
        else { log('warn', 'Diamond Standard skill missing.'); engine.diamondPass = false; }
    };

    console.log(`${COLORS.bold}\n====================================`);
    console.log(`  AI Context OS Audit v1.2.0 ${isDiamondMode ? '[DIAMOND MODE]' : ''} `);
    console.log(`====================================${COLORS.reset}\n`);

    auditDir(process.cwd());
    auditPointers();
    auditGitignore();
    if (isDiamondMode) auditDiamondResources();

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
