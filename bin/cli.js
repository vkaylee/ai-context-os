#!/usr/bin/env node
// @ts-check

/**
 * AI Context OS - Dynamic CLI Dispatcher
 * Synchronizes Command Registry, Routing, and Help Output.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

/**
 * @typedef {Object} CommandMeta
 * @property {string} description 
 * @property {string} [script] 
 * @property {string} usage 
 */

/** @type {Object<string, CommandMeta>} */
const COMMANDS = {
    'install': {
        description: 'Integrate the AI Context OS into a project (default)',
        script: 'install.js',
        usage: 'install <target_path>'
    },
    'audit': {
        description: 'Verify project architectural compliance',
        script: 'audit.js',
        usage: 'audit [--diamond]'
    },
    'scout': {
        description: 'Visualize active contexts, pointers, and skills',
        script: 'scout.js',
        usage: 'scout'
    },
    'doctor': {
        description: 'Run system diagnostics for the OS',
        script: 'doctor.js',
        usage: 'doctor'
    },
    'version': {
        description: 'Show current CLI version',
        usage: '-v, --version'
    },
    'help': {
        description: 'Show this professional help message',
        usage: '-h, --help, usage'
    }
};

// Utility colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m',
    red: '\x1b[31m'
};

const __filename = fileURLToPath(import.meta.url);
const binDir = path.dirname(__filename);
const sourceDir = path.resolve(binDir, '..');

/**
 * Dynamic Help Generator
 */
function showHelp() {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
        console.log(`\n${colors.bold}${colors.blue}AI Context OS CLI v${pkg.version}${colors.reset}`);
        console.log(`${colors.yellow}====================================${colors.reset}`);
        console.log(`\n${colors.bold}Usage:${colors.reset}`);
        console.log(`  ai-context-os <command> [options]\n`);
        console.log(`${colors.bold}Available Commands:${colors.reset}`);

        Object.entries(COMMANDS).forEach(([name, meta]) => {
            const padding = ' '.repeat(15 - name.length);
            console.log(`  ${colors.green}${name}${colors.reset}${padding}${meta.description}`);
            console.log(`  ${' '.repeat(15)}${colors.yellow}Usage: ${meta.usage}${colors.reset}\n`);
        });

        console.log(`${colors.bold}Examples:${colors.reset}`);
        console.log(`  npx ai-context-os .`);
        console.log(`  npx ai-context-os audit --diamond`);
        console.log(`\n${colors.blue}Documentation: https://github.com/vkaylee/ai-context-os${colors.reset}\n`);
    } catch (e) {
        console.error(`${colors.red}Fatal: Unable to read package metadata.${colors.reset}`);
        process.exit(1);
    }
}

/**
 * Version Reporter
 */
function showVersion() {
    const pkg = JSON.parse(fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'));
    console.log(`v${pkg.version}`);
}

// Security Boundary: Handle unhandled exceptions globally
process.on('uncaughtException', (err) => {
    console.error(`\n${colors.red}${colors.bold}[FATAL CRASH]${colors.reset} ${err.message}`);
    process.exit(1);
});

const args = process.argv.slice(2);
const firstArg = args[0];

// Global Flags
if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    process.exit(0);
}

if (!firstArg || args.includes('--help') || args.includes('-h') || firstArg === 'help' || firstArg === 'usage') {
    showHelp();
    process.exit(0);
}

// --- Dispatcher Routing ---
/** @type {string|undefined} */
let scriptPath;
/** @type {string[]} */
let scriptArgs = [];

const cmdMeta = COMMANDS[firstArg];

if (cmdMeta && cmdMeta.script) {
    scriptPath = path.join(binDir, cmdMeta.script);
    scriptArgs = args.slice(1);
} else if (firstArg === 'version') {
    showVersion();
    process.exit(0);
} else {
    // Default fallback: treat firstArg as a path for 'install'
    scriptPath = path.join(binDir, 'install.js');
    scriptArgs = args;
}

// Execute Sub-process
if (scriptPath) {
    const child = spawn('node', [scriptPath, ...scriptArgs], { stdio: 'inherit' });
    child.on('close', (code) => process.exit(code || 0));
    child.on('error', (err) => {
        console.error(`${colors.red}Execution Error: ${err.message}${colors.reset}`);
        process.exit(1);
    });
}
