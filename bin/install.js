#!/usr/bin/env node

/**
 * ==============================================================================
 * ai-context-os Node.js Installer
 * Description: Integrates ai-context-os using the Pointer Architecture.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

export class InstallerEngine {
    constructor(sourceDir) {
        this.sourceDir = sourceDir;
    }

    copyDirSync(src, dest) {
        fs.mkdirSync(dest, { recursive: true });
        let entries = fs.readdirSync(src, { withFileTypes: true });

        for (let entry of entries) {
            let srcPath = path.join(src, entry.name);
            let destPath = path.join(dest, entry.name);

            entry.isDirectory() ? this.copyDirSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
        }
    }

    isSelfInstall(targetDir) {
        try {
            const targetPkgPath = path.join(targetDir, 'package.json');
            if (fs.existsSync(targetPkgPath)) {
                const targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf8'));
                return targetPkg.name === 'ai-context-os';
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    install(targetDir, logCallback = () => { }) {
        const osDir = path.join(targetDir, '.ai-context-os');
        fs.mkdirSync(osDir, { recursive: true });

        const filesToCopy = ['PROJECT_OS.md'];
        const dirsToCopy = ['skills'];

        for (const file of filesToCopy) {
            const srcPath = path.join(this.sourceDir, file);
            const destPath = path.join(osDir, file);
            if (fs.existsSync(srcPath)) {
                logCallback(`  Copying ${file}...`);
                fs.copyFileSync(srcPath, destPath);
            }
        }

        for (const dir of dirsToCopy) {
            const srcPath = path.join(this.sourceDir, dir);
            const destPath = path.join(osDir, dir);
            if (fs.existsSync(srcPath)) {
                logCallback(`  Copying directory ${dir}/...`);
                this.copyDirSync(srcPath, destPath);
            }
        }

        if (this.isSelfInstall(targetDir)) {
            logCallback(`  [Dogfooding Mode] Skipping adapter file generation.`);
        } else {
            const adapters = {
                '.cursorrules': 'adapter-cursor.md',
                'CLAUDE.md': 'adapter-claude.md',
                'GEMINI.md': 'adapter-gemini.md'
            };

            for (const [dest, src] of Object.entries(adapters)) {
                const content = fs.readFileSync(path.join(this.sourceDir, src), 'utf8');
                fs.writeFileSync(path.join(targetDir, dest), content, 'utf8');
                logCallback(`  Generated ${dest} adapter.`);
            }
        }
        return osDir;
    }
}

// --- CLI Runner ---
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);

if (isMain) {
    const __filename = fileURLToPath(import.meta.url);
    const SOURCE_DIR = path.resolve(path.dirname(__filename), '..');

    const args = process.argv.slice(2);
    const helpParam = args.find(arg => arg === '--help' || arg === '-h');
    const versionParam = args.find(arg => arg === '--version' || arg === '-v');

    if (versionParam) {
        const pkg = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'package.json'), 'utf8'));
        console.log(`v${pkg.version}`);
        process.exit(0);
    }

    if (helpParam || args.length === 0) {
        console.log(`${colors.yellow}Usage: npx ai-context-os <target_path>${colors.reset}`);
        process.exit(args.length === 0 ? 1 : 0);
    }

    console.log(`${colors.blue}==============================${colors.reset}`);
    console.log(`${colors.blue}  ai-context-os Installer   ${colors.reset}`);
    console.log(`${colors.blue}==============================${colors.reset}`);

    const targetInput = args[0];
    const TARGET_DIR = path.resolve(process.cwd(), targetInput);

    if (!fs.existsSync(TARGET_DIR)) {
        console.error(`${colors.red}Error: Target directory '${TARGET_DIR}' does not exist.${colors.reset}`);
        process.exit(1);
    }

    const installer = new InstallerEngine(SOURCE_DIR);
    const osDir = installer.install(TARGET_DIR, msg => console.log(msg));

    console.log(`\n${colors.green}✅ Integration Complete!${colors.reset}`);
    console.log(`The AI Context OS has been installed in: ${osDir}`);
}
