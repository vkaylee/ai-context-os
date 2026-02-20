import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('Architecture Purity Guardrails', async (t) => {
    await t.test('Source repo should NOT contain auto-globbing adapter names', () => {
        // These names cause context pollution if they exist in node_modules
        const forbidden = ['GEMINI.md', 'CLAUDE.md', '.cursorrules'];

        // We check the .ai-context-os directory specifically
        const osDir = path.join(ROOT, '.ai-context-os');
        if (fs.existsSync(osDir)) {
            const files = fs.readdirSync(osDir);
            for (const f of forbidden) {
                assert.ok(!files.includes(f), `Purity violation: ${f} found in .ai-context-os/`);
            }
        }
    });

    await t.test('Installer should have source templates named as adapters', () => {
        const required = ['adapter-gemini.md', 'adapter-claude.md', 'adapter-cursor.md'];
        for (const f of required) {
            assert.ok(fs.existsSync(path.join(ROOT, f)), `Missing source template: ${f}`);
        }
    });

    await t.test('Atomic Modularity: All bin scripts must be < 200 lines', () => {
        const binDir = path.join(ROOT, 'bin');
        const files = fs.readdirSync(binDir).filter(f => f.endsWith('.js'));

        for (const f of files) {
            const content = fs.readFileSync(path.join(binDir, f), 'utf8');
            const lines = content.split('\n').length;
            assert.ok(lines <= 200, `Modularity Breach: bin/${f} has ${lines} lines (Limit: 200)`);
        }
    });
});
