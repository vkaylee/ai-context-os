#!/usr/bin/env node

/**
 * AI Context OS - Doctor
 * Diagnostic tool for basic system environment checks.
 */

import os from 'os';

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
