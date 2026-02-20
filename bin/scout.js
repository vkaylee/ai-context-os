#!/usr/bin/env node
// @ts-check

/**
 * AI Context OS - Scout
 * Visualizes the current active context, pointers, and skills.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS } from './utils.js';

/**
 * Encapsulates the contextual visualization and detection logic for the OS.
 */
export class ScoutEngine {
    /**
     * @param {string} cwd The current working directory to analyze.
     */
    constructor(cwd) {
        /** @type {string} */
        this.cwd = cwd;
    }

    /**
     * Detects if the current directory contains an active OS installation.
     * @returns {string|undefined} The name of the OS directory (e.g., '.ai-context-os'), or undefined if missing.
     */
    detectActiveOsDir() {
        const osDirs = ['.ai-context-os', '.local-os'];
        return osDirs.find(dir => fs.existsSync(path.join(this.cwd, dir)));
    }

    /**
     * Detects if we are currently running inside the actual source repository (Dogfooding mode).
     * @returns {boolean} True if source repo, false otherwise.
     */
    isSourceRepo() {
        const pkgPath = path.join(this.cwd, 'package.json');
        if (!fs.existsSync(pkgPath)) return false;
        try {
            return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name === 'ai-context-os';
        } catch (e) {
            return false;
        }
    }

    /**
     * Analyzes the status of the L0 Kernel (PROJECT_OS.md).
     * @param {string|undefined} activeOsDir The detected active OS directory, if any.
     * @returns {{path: string | null, found: boolean}} The path and found status of the kernel.
     */
    getKernelStatus(activeOsDir) {
        let kernelPath = null;
        if (activeOsDir) {
            kernelPath = path.join(this.cwd, activeOsDir, 'PROJECT_OS.md');
        } else if (fs.existsSync(path.join(this.cwd, 'PROJECT_OS.md'))) {
            kernelPath = path.join(this.cwd, 'PROJECT_OS.md');
        }
        return {
            path: (kernelPath && fs.existsSync(kernelPath)) ? path.relative(this.cwd, kernelPath) : null,
            found: !!(kernelPath && fs.existsSync(kernelPath))
        };
    }

    /**
     * @typedef {Object} AdapterStatus
     * @property {string} name 
     * @property {boolean} found 
     * @property {string|null} pointsTo
     */

    /**
     * Assesses the status of all L1 Adapters in the current context.
     * @returns {AdapterStatus[]} The status list of adapters.
     */
    getAdapterStatus() {
        /** @type {string[]} */
        const adapters = ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'];
        return adapters.map(a => {
            const p = path.join(this.cwd, a);
            const found = fs.existsSync(p);
            let pointsTo = null;
            if (found) {
                const content = fs.readFileSync(p, 'utf8');
                pointsTo = content.includes('.ai-context-os') ? '.ai-context-os' : (content.includes('.local-os') ? '.local-os' : 'CORE/DIRECT');
            }
            return { name: a, found, pointsTo };
        });
    }

    /**
     * Lists active L2 Skills based on the detected environment.
     * @param {string|undefined} activeOsDir The detected active OS directory, if any.
     * @returns {string[]} An array of skill names.
     */
    getSkills(activeOsDir) {
        let skillsDir = null;
        if (activeOsDir) {
            skillsDir = path.join(this.cwd, activeOsDir, 'skills');
        } else if (fs.existsSync(path.join(this.cwd, 'skills'))) {
            skillsDir = path.join(this.cwd, 'skills');
        }
        if (skillsDir && fs.existsSync(skillsDir)) {
            return fs.readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => f.replace('.md', ''));
        }
        return [];
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
        console.log(`Usage: npx ai-context-os scout`);
        console.log(`Visualizes the active AI Context OS environment.`);
        process.exit(0);
    }

    const engine = new ScoutEngine(process.cwd());
    const activeOsDir = engine.detectActiveOsDir();

    console.log(`${COLORS.bold}\n====================================`);
    console.log(`  AI Context OS Scout 🔍            `);
    console.log(`====================================${COLORS.reset}\n`);

    if (activeOsDir) {
        console.log(`${COLORS.cyan}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
        console.log(`  OS Root  : ./${activeOsDir}/`);
        console.log(`  Status   : ACTIVE\n`);
    } else if (engine.isSourceRepo()) {
        console.log(`${COLORS.green}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
        console.log(`  Mode     : SOURCE REPO (Dogfooding)`);
        console.log(`  Status   : ACTIVE\n`);
    } else {
        console.log(`${COLORS.yellow}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
        console.log(`  Status   : NOT INSTALLED\n`);
    }

    const { path: kPath, found } = engine.getKernelStatus(activeOsDir);
    console.log(`${COLORS.cyan}${COLORS.bold}[L0: KERNEL]${COLORS.reset}`);
    if (found) {
        console.log(`  Path     : ${kPath}`);
        console.log(`  Status   : FOUND\n`);
    } else {
        console.log(`  Status   : MISSING!\n`);
    }

    console.log(`${COLORS.cyan}${COLORS.bold}[L1: ADAPTERS]${COLORS.reset}`);
    engine.getAdapterStatus().forEach(a => {
        if (a.found) {
            console.log(`${COLORS.green}  ✔ ${a.name.padEnd(12)}${COLORS.reset} -> ${a.pointsTo}`);
        } else {
            console.log(`${COLORS.yellow}  - ${a.name.padEnd(12)}${COLORS.reset} NOT FOUND`);
        }
    });
    console.log('');

    const skills = engine.getSkills(activeOsDir);
    console.log(`${COLORS.cyan}${COLORS.bold}[L2: SKILLS]${COLORS.reset}`);
    if (skills.length > 0) {
        skills.forEach(s => console.log(`${COLORS.green}  ★ ${s}${COLORS.reset}`));
    } else {
        console.log(`  (No active skills found)`);
    }
    console.log('');
    console.log(`${COLORS.blue}Use 'audit' to verify compliance with these rules.${COLORS.reset}\n`);
}
