// @ts-check
import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.resolve(__dirname, '../bin');
const scripts = ['audit.js', 'install.js', 'scout.js', 'doctor.js'];

/**
 * Generates a random "junk" string for fuzzing.
 * @returns {string}
 */
function generateJunk() {
    const types = [
        () => Math.random().toString(36).substring(2, 15), // Random alphanumeric
        () => '!@#$%^&*()_+|~-=`{}[]:<>?,./;', // Special chars
        () => ' '.repeat(Math.floor(Math.random() * 100)), // Whitespace
        () => 'A'.repeat(5000), // Large buffer
        () => '; rm -rf /; sudo kill -9 1', // Shell injection attempt
        () => '$(whoami)', // Command expansion
        () => '\x01\x02\x03\x1B', // Control characters (no null byte)        () => 'Tiếng Việt có dấu ốc', // Unicode
    ];
    const rand = Math.floor(Math.random() * types.length);
    return types[rand]();
}

scripts.forEach(script => {
    const scriptPath = path.join(binDir, script);

    test(`Fuzzing ${script}: 25-cycle randomized stress test`, () => {
        // Reducing to 25 cycles for CI performance while maintaining exploratory value
        for (let i = 0; i < 25; i++) {
            const args = [];
            const numArgs = Math.floor(Math.random() * 5);
            for (let j = 0; j < numArgs; j++) {
                args.push(generateJunk());
            }

            const result = spawnSync('node', [scriptPath, ...args], {
                encoding: 'utf8',
                timeout: 2000 // 2s timeout to prevent hang
            });

            // Diamond Standard: A CLI MUST NOT CRASH (exit code > 1 typically indicates crash/signal)
            // Error code 1 is allowed as it indicates a graceful validation failure.
            assert.ok(result.status === 0 || result.status === 1,
                `CRASH DETECTED in ${script} with args [${args.join(', ')}]. \nExit Code: ${result.status}\nError: ${result.stderr}`);

            // Check for unhandled exceptions in output
            assert.ok(!result.stderr.includes('ReferenceError'), `ReferenceError in ${script}`);
            assert.ok(!result.stderr.includes('TypeError'), `TypeError in ${script}`);
        }
    });
});
