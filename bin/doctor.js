import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const SOURCE_DIR = path.resolve(path.dirname(__filename), '..');

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'package.json'), 'utf8'));
    console.log(`v${pkg.version}`);
    process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: npx ai-context-os doctor`);
    console.log(`Diagnoses system environment for AI Context OS compatibility.`);
    process.exit(0);
}

console.log("\n==============================");
console.log("  AI Context OS - Doctor 🩺  ");
console.log("==============================\n");

const diagnostics = [
    { name: "Node.js Version", result: process.version, pass: parseFloat(process.version.slice(1)) >= 18 },
    { name: "OS Platform", result: process.platform, pass: true },
    { name: "Architecture", result: process.arch, pass: true },
    { name: "Memory Free", result: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`, pass: os.freemem() > 100 * 1024 * 1024 }
];

diagnostics.forEach(d => {
    const status = d.pass ? "✅" : "❌";
    console.log(`${status} ${d.name.padEnd(20)}: ${d.result}`);
});

console.log("\n[SYSTEM CHECK COMPLETE]");
