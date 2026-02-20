#!/usr/bin/env node

/**
 * AI Context OS - Unified CLI
 * Dispatches commands to specialized modules (Install, Audit).
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const binDir = path.dirname(__filename);
const sourceDir = path.resolve(binDir, '..');

const args = process.argv.slice(2);
const command = args[0];

// Help & Version
if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
    console.log(`v${pkg.version}`);
    process.exit(0);
}

if (!command || args.includes('--help') || args.includes('-h')) {
    console.log("AI Context OS CLI");
    console.log("\nUsage:");
    console.log("  ai-context-os install <path>  Integrate OS into a project");
    console.log("  ai-context-os audit           Check project compliance");
    console.log("  ai-context-os -v              Show version");
    process.exit(0);
}

// Dispatch logic
let scriptPath;
let scriptArgs;

if (command === 'audit') {
    scriptPath = path.join(binDir, 'audit.js');
    scriptArgs = args.slice(1);
} else if (command === 'install') {
    scriptPath = path.join(binDir, 'install.js');
    scriptArgs = args.slice(1);
} else {
    // Default to install for backward compatibility (treat first arg as path)
    scriptPath = path.join(binDir, 'install.js');
    scriptArgs = args;
}

const child = spawn('node', [scriptPath, ...scriptArgs], { stdio: 'inherit' });
child.on('close', (code) => process.exit(code));
