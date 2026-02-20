// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Encapsulates contextual visualization and detection logic.
 */
export class ScoutEngine {
    /** @param {string} cwd */
    constructor(cwd) { this.cwd = cwd; }

    /** @returns {string|undefined} */
    detectActiveOsDir() {
        return ['.ai-context-os', '.local-os'].find(dir => fs.existsSync(path.join(this.cwd, dir)));
    }

    /** @returns {boolean} */
    isSourceRepo() {
        try {
            const p = path.join(this.cwd, 'package.json');
            return fs.existsSync(p) && JSON.parse(fs.readFileSync(p, 'utf8')).name === 'ai-context-os';
        } catch (e) { return false; }
    }

    /**
     * @param {string|undefined} activeOsDir
     * @returns {{path: string | null, found: boolean}}
     */
    getKernelStatus(activeOsDir) {
        let k = activeOsDir ? path.join(this.cwd, activeOsDir, 'PROJECT_OS.md') : (fs.existsSync(path.join(this.cwd, 'PROJECT_OS.md')) ? path.join(this.cwd, 'PROJECT_OS.md') : null);
        return { path: (k && fs.existsSync(k)) ? path.relative(this.cwd, k) : null, found: !!(k && fs.existsSync(k)) };
    }

    /**
     * @returns {{name: string, found: boolean, pointsTo: string|null}[]}
     */
    getAdapterStatus() {
        return ['.cursorrules', 'CLAUDE.md', 'GEMINI.md'].map(a => {
            const p = path.join(this.cwd, a);
            const found = fs.existsSync(p);
            let pointsTo = null;
            if (found) {
                const c = fs.readFileSync(p, 'utf8');
                pointsTo = c.includes('.ai-context-os') ? '.ai-context-os' : (c.includes('.local-os') ? '.local-os' : 'CORE/DIRECT');
            }
            return { name: a, found, pointsTo };
        });
    }

    /**
     * @param {string|undefined} activeOsDir
     * @returns {string[]}
     */
    getSkills(activeOsDir) {
        const d = activeOsDir ? path.join(this.cwd, activeOsDir, 'skills') : (fs.existsSync(path.join(this.cwd, 'skills')) ? path.join(this.cwd, 'skills') : null);
        return (d && fs.existsSync(d)) ? fs.readdirSync(d).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => f.replace('.md', '')) : [];
    }
}
