#!/usr/bin/env node

/**
 * AI Context OS - Unified CLI
 * Dispatches commands to specialized modules (Install, Audit).
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Utility colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    bold: '\x1b[1m'
};

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
    console.log(`\n${colors.bold}${colors.blue}AI Context OS CLI${colors.reset}`);
    console.log(`${colors.yellow}==============================${colors.reset}`);
    console.log(`\n${colors.bold}Usage:${colors.reset}`);
    console.log(`  ai-context-os <command> [options]\n`);
    console.log(`${colors.bold}Commands:${colors.reset}`);
    console.log(`  ${colors.green}install <path>${colors.reset}   Integrate the OS into a project (default if path provided)`);
    console.log(`  ${colors.green}audit${colors.reset}            Verify project architectural compliance`);
    console.log(`  ${colors.green}version${colors.reset}          Show CLI version (-v)`);
    console.log(`  ${colors.green}help${colors.reset}             Show this help message (-h)`);
    console.log(`\n${colors.bold}Examples:${colors.reset}`);
    console.log(`  npx ai-context-os .`);
    console.log(`  npx ai-context-os audit --diamond`);
    console.log(`\n${colors.yellow}Documentation: https://github.com/vkaylee/ai-context-os${colors.reset}\n`);
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
} else if (command === 'help' || command === 'usage') {
    const child = spawn('node', [__filename, '--help'], { stdio: 'inherit' });
    child.on('close', (code) => process.exit(code));
} else if (command === 'version') {
    const child = spawn('node', [__filename, '--version'], { stdio: 'inherit' });
    child.on('close', (code) => process.exit(code));
} else {
    // Default to install for backward compatibility (treat first arg as path)
    scriptPath = path.join(binDir, 'install.js');
    scriptArgs = args;
}

if (scriptPath && scriptArgs) {
    const child = spawn('node', [scriptPath, ...scriptArgs], { stdio: 'inherit' });
    child.on('close', (code) => process.exit(code));
}
