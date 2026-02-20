#!/usr/bin/env node
// @ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS } from './utils.js';
import { CompressorEngine } from './compressor.js';
import { ScoutEngine } from './scout-engine.js';
import { ULTP } from './ultp.js';

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);
if (isMain) {
    const SOURCE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const args = process.argv.slice(2);

    if (args.includes('--version') || args.includes('-v')) {
        console.log(`v${JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'package.json'), 'utf8')).version}`);
        process.exit(0);
    }
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: npx ai-context-os scout [--json] [--compress] [--ultra] [--ready]\nVisualizes the active AI Context OS environment.`);
        process.exit(0);
    }

    const isJsonMode = args.includes('--json'), isCompressMode = args.includes('--compress'), isUltraMode = args.includes('--ultra'), isReadyMode = args.includes('--ready');
    const engine = new ScoutEngine(process.cwd()), osDir = engine.detectActiveOsDir();

    if (isReadyMode || isUltraMode) {
        /** @type {import('./ultp.js').ULTPState} */
        const results = {
            environment: { osRoot: osDir ? `./${osDir}/` : null, status: osDir || engine.isSourceRepo() ? 'ACTIVE' : 'NOT INSTALLED', isDogfooding: engine.isSourceRepo() },
            kernel: engine.getKernelStatus(osDir), adapters: engine.getAdapterStatus(), skills: engine.getSkills(osDir)
        };
        const ultra = ULTP.encode(results);
        if (isUltraMode && !isReadyMode) { console.log(ultra); process.exit(0); }

        if (isReadyMode) {
            console.log(ultra);
            console.log('---');
            const { path: kPath, found } = engine.getKernelStatus(osDir);
            if (found && kPath) console.log(CompressorEngine.compress(fs.readFileSync(path.join(process.cwd(), kPath), 'utf8')));
            else console.error(`${COLORS.red}Error: Kernel not found for ready injection.${COLORS.reset}`);
            process.exit(0);
        }
    }

    if (isCompressMode) {
        const { path: kPath, found } = engine.getKernelStatus(osDir);
        if (!found || !kPath) { console.error(`${COLORS.red}Error: PROJECT_OS.md not found.${COLORS.reset}`); process.exit(1); }
        console.log(CompressorEngine.compress(fs.readFileSync(path.join(process.cwd(), kPath), 'utf8')));
        process.exit(0);
    }

    if (isJsonMode) {
        console.log(JSON.stringify({
            environment: { osRoot: osDir ? `./${osDir}/` : null, status: osDir || engine.isSourceRepo() ? 'ACTIVE' : 'NOT INSTALLED' },
            kernel: engine.getKernelStatus(osDir), adapters: engine.getAdapterStatus(), skills: engine.getSkills(osDir)
        }));
        process.exit(0);
    }

    /** @param {'env'|'src'|'err'} type @param {string} label @param {string} [msg=''] */
    const log = (type, label, msg = '') => {
        /** @type {Object<string, string>} */
        const c = { env: COLORS.cyan, src: COLORS.green, err: COLORS.yellow };
        console.log(`${c[type] || COLORS.cyan}${COLORS.bold}[${label}]${COLORS.reset}\n${msg}`);
    };

    console.log(`${COLORS.bold}\n====================================\n  AI Context OS Scout 🔍 \n====================================${COLORS.reset}\n`);

    if (osDir) log('env', 'ENVIRONMENT', `  OS Root  : ./${osDir}/\n  Status   : ACTIVE`);
    else if (engine.isSourceRepo()) log('src', 'ENVIRONMENT', `  Mode     : SOURCE REPO (Dogfooding)\n  Status   : ACTIVE`);
    else log('err', 'ENVIRONMENT', `  Status   : NOT INSTALLED`);

    const { path: kP, found: kF } = engine.getKernelStatus(osDir);
    log('env', 'L0: KERNEL', kF ? `  Path     : ${kP}\n  Status   : FOUND` : `  Status   : MISSING!`);

    console.log(`${COLORS.cyan}${COLORS.bold}[L1: ADAPTERS]${COLORS.reset}`);
    engine.getAdapterStatus().forEach(a => console.log(`${a.found ? COLORS.green + '  ✔' : COLORS.yellow + '  -'} ${a.name.padEnd(12)}${COLORS.reset} ${a.found ? '-> ' + a.pointsTo : 'NOT FOUND'}`));

    const skills = engine.getSkills(osDir);
    log('env', 'L2: SKILLS', skills.length ? skills.map(s => `${COLORS.green}  ★ ${s}${COLORS.reset}`).join('\n') : `  (No active skills found)`);

    console.log(`\n${COLORS.blue}Use 'audit' to verify compliance with these rules.${COLORS.reset}\n`);
}
