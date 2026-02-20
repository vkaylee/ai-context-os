#!/usr/bin/env node

/**
 * AI Context OS - Scout
 * Visualizes the current active context, pointers, and skills.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS } from './utils.js';

const cwd = process.cwd();

// --- Detect OS Root ---
const osDirs = ['.ai-context-os', '.local-os'];
let activeOsDir = osDirs.find(dir => fs.existsSync(path.join(cwd, dir)));

console.log(`${COLORS.bold}\n====================================`);
console.log(`  AI Context OS Scout 🔍            `);
console.log(`====================================${COLORS.reset}\n`);

// 1. Environment Status
if (activeOsDir) {
    console.log(`${COLORS.cyan}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
    console.log(`  OS Root  : ./${activeOsDir}/`);
    console.log(`  Status   : ACTIVE\n`);
} else {
    // If not found in CWD, check if we are in the source repo itself
    const pkgPath = path.join(cwd, 'package.json');
    const isSource = fs.existsSync(pkgPath) && JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name === 'ai-context-os';

    if (isSource) {
        console.log(`${COLORS.green}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
        console.log(`  Mode     : SOURCE REPO (Dogfooding)`);
        console.log(`  Status   : ACTIVE\n`);
    } else {
        console.log(`${COLORS.yellow}${COLORS.bold}[ENVIRONMENT]${COLORS.reset}`);
        console.log(`  Status   : NOT INSTALLED (Root context missing)\n`);
    }
}

// 2. L0 Kernel
// Try to find Kernel in OS Dir or root
let kernelPath = null;
if (activeOsDir) {
    kernelPath = path.join(cwd, activeOsDir, 'PROJECT_OS.md');
} else if (fs.existsSync(path.join(cwd, 'PROJECT_OS.md'))) {
    kernelPath = path.join(cwd, 'PROJECT_OS.md');
}

if (kernelPath && fs.existsSync(kernelPath)) {
    console.log(`${COLORS.cyan}${COLORS.bold}[L0: KERNEL]${COLORS.reset}`);
    console.log(`  Path     : ${path.relative(cwd, kernelPath)}`);
    console.log(`  Status   : FOUND (Single Source of Truth)\n`);
} else {
    console.log(`${COLORS.red}${COLORS.bold}[L0: KERNEL]${COLORS.reset}`);
    console.log(`  Status   : MISSING!\n`);
}

// 3. L1 Adapters
const adapters = ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'];
console.log(`${COLORS.cyan}${COLORS.bold}[L1: ADAPTERS]${COLORS.reset}`);
let foundAdapters = false;
adapters.forEach(a => {
    const p = path.join(cwd, a);
    if (fs.existsSync(p)) {
        foundAdapters = true;
        const content = fs.readFileSync(p, 'utf8');
        const pointsTo = content.includes('.ai-context-os') ? '.ai-context-os' : (content.includes('.local-os') ? '.local-os' : 'CORE/DIRECT');
        console.log(`${COLORS.green}  ✔ ${a.padEnd(12)}${COLORS.reset} -> ${pointsTo}`);
    } else {
        console.log(`${COLORS.yellow}  - ${a.padEnd(12)}${COLORS.reset} NOT FOUND`);
    }
});
if (!foundAdapters) console.log(`  (No active adapters in current directory)`);
console.log('');

// 4. L2 Skills
let skillsDir = null;
if (activeOsDir) {
    skillsDir = path.join(cwd, activeOsDir, 'skills');
} else if (fs.existsSync(path.join(cwd, 'skills'))) {
    skillsDir = path.join(cwd, 'skills');
}

console.log(`${COLORS.cyan}${COLORS.bold}[L2: SKILLS]${COLORS.reset}`);
if (skillsDir && fs.existsSync(skillsDir)) {
    const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    if (files.length > 0) {
        files.forEach(f => {
            console.log(`${COLORS.green}  ★ ${f.replace('.md', '')}${COLORS.reset}`);
        });
    } else {
        console.log(`  (No modular skills found)`);
    }
} else {
    console.log(`  (Skills directory missing)`);
}
console.log('');

console.log(`${COLORS.blue}Use 'audit' to verify compliance with these rules.${COLORS.reset}\n`);
