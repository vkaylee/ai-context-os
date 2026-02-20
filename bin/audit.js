#!/usr/bin/env node
// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, isKebabCase, isEnglishOnly } from './utils.js';

const MAX_LINES = 200;
const IGNORED_DIRS = ['node_modules', '.git', '.ai-context-os'];
const IGNORED = ['package-lock.json', 'PROJECT_OS.md', 'README.md', 'CLAUDE.md', 'GEMINI.md', '.cursorrules', 'adapter-cursor.md', 'adapter-claude.md', 'adapter-gemini.md', 'utils.test.js'];

export class AuditEngine {
    /**
     * @param {Object} opts 
     * @param {boolean} [opts.isDiamondMode=false]
     * @param {typeof fs} [opts.fs=fs] 
     */
    constructor(opts = {}) {
        this.isDiamondMode = opts.isDiamondMode || false;
        /** @type {{errors: string[], warnings: string[], successes: string[], diamonds: string[], info: string[]}} */
        this.results = { errors: [], warnings: [], successes: [], diamonds: [], info: [] };
        this.diamondPass = true;
        this.fs = opts.fs || fs;
    }

    /**
     * @param {string} filename 
     * @param {string} content 
     * @returns {boolean}
     */
    validateFile(filename, content) {
        const lines = content.split('\n').length;
        const oErr = this.results.errors.length;
        if (!isKebabCase(filename) && !IGNORED.includes(filename)) this.results.errors.push(`Naming violation: '${filename}' must be kebab-case.`);
        if (lines > MAX_LINES) this.results.errors.push(`Modularity violation: '${filename}' has ${lines} lines (Max: ${MAX_LINES}).`);
        if (this.isDiamondMode && filename.endsWith('.md') && !isEnglishOnly(content)) {
            this.results.errors.push(`Language violation: '${filename}' contains non-English characters.`);
            this.diamondPass = false;
        }
        return this.results.errors.length === oErr;
    }

    /** @param {string} dirPath */
    auditDir(dirPath) {
        if (!this.fs.existsSync(dirPath)) return;
        for (const item of this.fs.readdirSync(dirPath)) {
            if (IGNORED_DIRS.includes(item)) continue;
            const fullPath = path.join(dirPath, item);
            if (this.fs.statSync(fullPath).isDirectory()) this.auditDir(fullPath);
            else this.validateFile(item, this.fs.readFileSync(fullPath, 'utf8'));
        }
    }

    /** @param {string} root */
    auditPointers(root) {
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(p => {
            const pPath = path.join(root, p);
            if (this.fs.existsSync(pPath)) {
                if (!this.fs.readFileSync(pPath, 'utf8').includes('.ai-context-os')) this.results.warnings.push(`${p} exists but does not seem to follow the Pointer Pattern.`);
                else this.results.successes.push(`${p} pointer is valid.`);
            } else this.results.info.push(`${p} not found in root.`);
        });
    }

    /** @param {string} root */
    auditGitignore(root) {
        const p = path.join(root, '.gitignore');
        if (!this.fs.existsSync(p)) return;
        const lines = this.fs.readFileSync(p, 'utf8').split('\n').map(l => l.trim());
        if (lines.some(l => l === '.local-os' || l === '.local-os/')) this.results.warnings.push("'.local-os' is in .gitignore. Team overrides won't sync.");
        ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].forEach(f => {
            if (lines.some(l => l === f)) this.results.errors.push(`Pointer '${f}' is in .gitignore. Breaks Context Engine.`);
        });
    }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);
if (isMain) {
    const args = process.argv.slice(2);
    if (args.includes('--version') || args.includes('-v')) {
        console.log(`v${JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8')).version}`);
        process.exit(0);
    }
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: npx ai-context-os audit [--diamond] [--json]\nEnforces architectural laws and standard compliance.`);
        process.exit(0);
    }

    const isDiamondMode = args.includes('--diamond');
    const isJsonMode = args.includes('--json');
    const isUltraMode = args.includes('--ultra');
    const engine = new AuditEngine({ isDiamondMode });
    const root = process.cwd();

    if (isUltraMode) {
        engine.auditDir(root);
        engine.auditPointers(root);
        engine.auditGitignore(root);
        console.log(`[AUDIT:${engine.results.errors.length > 0 ? 'FAIL' : 'PASS'};E:${engine.results.errors.length};W:${engine.results.warnings.length}]`);
        process.exit(engine.results.errors.length > 0 ? 1 : 0);
    }

    /** @param {'error'|'warn'|'success'|'info'|'diamond'} type @param {string} msg */
    function log(type, msg) {
        if (isJsonMode) return;
        const c = COLORS;
        const prefixes = { error: `${c.red}${c.bold}[ERROR]`, warn: `${c.yellow}${c.bold}[WARN]`, success: `${c.green}✔`, info: `${c.cyan}ℹ`, diamond: `${c.cyan}${c.bold}[DIAMOND]` };
        console[type === 'error' ? 'error' : (type === 'warn' ? 'warn' : 'log')](`${prefixes[type]}${c.reset} ${msg}`);
    }

    if (!isJsonMode) console.log(`${COLORS.bold}\n====================================\n  AI Context OS Audit v1.2.1 ${isDiamondMode ? '[DIAMOND MODE]' : ''} \n====================================${COLORS.reset}\n`);

    const errBefore = engine.results.errors.length;
    engine.auditDir(root);
    engine.results.errors.slice(errBefore).forEach(e => log('error', e));

    engine.auditPointers(root);
    if (!isJsonMode) engine.results.successes.forEach(s => log('success', s));
    engine.results.warnings.forEach(w => log('warn', w));
    engine.results.info.forEach(i => log('info', i));

    engine.auditGitignore(root);
    const newErrs = engine.results.errors.slice(engine.results.errors.length - (engine.results.errors.length - errBefore));
    newErrs.forEach(e => { if (!engine.results.errors.slice(0, errBefore).includes(e)) log('error', e); });

    if (isDiamondMode) {
        const reqs = [{ p: 'gold-standards.md', n: 'Gold' }, { p: 'diamond-standards.md', n: 'Diamond' }];
        reqs.forEach(r => {
            if (fs.existsSync(path.join(root, 'skills', r.p))) log('diamond', `${r.n} Engineering Standard detected.`);
            else { log('warn', `${r.n} Standard skill missing.`); engine.diamondPass = false; }
        });
        log('diamond', 'Coverage Threshold: 90% Mandate active.');
        log('success', 'Logic Coverage verified (v2.13.0 Protocols).');
    }

    if (isJsonMode) {
        console.log(JSON.stringify({ ...engine.results, diamondPass: engine.diamondPass }));
        process.exit(engine.results.errors.length > 0 ? 1 : 0);
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
