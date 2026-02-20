import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ScoutEngine } from '../bin/scout-engine.js';
import { InstallerEngine } from '../bin/install.js';

const tempRoot = path.join(os.tmpdir(), `ai-os-exhaustive-${Date.now()}`);
fs.mkdirSync(tempRoot, { recursive: true });

test('ScoutEngine: Full Diagnostic Suite', () => {
    const projectDir = path.join(tempRoot, 'scout-exhaustive');
    fs.mkdirSync(projectDir, { recursive: true });

    // Case 1: Missing everything
    let engine = new ScoutEngine(projectDir);
    assert.strictEqual(engine.detectActiveOsDir(), undefined);
    assert.strictEqual(engine.isSourceRepo(), false);
    assert.strictEqual(engine.getKernelStatus().found, false);
    assert.deepEqual(engine.getSkills(), []);

    // Case 2: Source Repo Detection (Mock package.json)
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ name: 'ai-context-os' }));
    assert.strictEqual(engine.isSourceRepo(), true);

    // Case 3: Local OS with Skills and Indicators
    const localOs = path.join(projectDir, '.local-os');
    fs.mkdirSync(localOs, { recursive: true });
    fs.mkdirSync(path.join(localOs, 'skills'), { recursive: true });
    fs.writeFileSync(path.join(localOs, 'PROJECT_OS.md'), '# Kernel');
    fs.writeFileSync(path.join(localOs, 'skills/js.md'), '# JS');

    engine = new ScoutEngine(projectDir);
    assert.strictEqual(engine.detectActiveOsDir(), '.local-os');
    assert.strictEqual(engine.getKernelStatus('.local-os').found, true);
    assert.ok(engine.getSkills('.local-os').includes('js'));
});

test('InstallerEngine: Edge Cases & Dogfooding', () => {
    const sourceDir = path.join(tempRoot, 'src-exhaustive');
    const targetDir = path.join(tempRoot, 'target-exhaustive');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(targetDir, { recursive: true });

    fs.writeFileSync(path.join(sourceDir, 'PROJECT_OS.md'), '# K');
    fs.mkdirSync(path.join(sourceDir, 'skills'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'adapter-cursor.md'), 'c');
    fs.writeFileSync(path.join(sourceDir, 'adapter-claude.md'), 'cl');
    fs.writeFileSync(path.join(sourceDir, 'adapter-gemini.md'), 'g');

    const engine = new InstallerEngine(sourceDir);

    // Test isSelfInstall
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify({ name: 'ai-context-os' }));
    assert.strictEqual(engine.isSelfInstall(targetDir), true);

    // Run install in dogfooding mode
    engine.install(targetDir);
    assert.ok(!fs.existsSync(path.join(targetDir, '.cursorrules'))); // Should NOT generate in dogfooding

    // Normal Mode
    const normalTarget = path.join(tempRoot, 'normal-target');
    fs.mkdirSync(normalTarget, { recursive: true });
    engine.install(normalTarget);
    assert.ok(fs.existsSync(path.join(normalTarget, '.cursorrules')));
});
