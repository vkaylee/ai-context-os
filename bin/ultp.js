// @ts-check

/**
 * AI Context OS - Ultra-Low Token Protocol (ULTP)
 * A custom dense shorthand for machine-to-machine context exchange.
 */

/**
 * @typedef {Object} ULTPState
 * @property {Object} environment
 * @property {string|null} environment.osRoot
 * @property {string} environment.status
 * @property {boolean} [environment.isDogfooding]
 * @property {Object} kernel
 * @property {boolean} kernel.found
 * @property {string|null} kernel.path
 * @property {Object[]} adapters
 * @property {string} adapters.name
 * @property {boolean} adapters.found
 * @property {string|null} adapters.pointsTo
 * @property {string[]} skills
 * @property {Object} [memory]
 * @property {boolean} memory.found
 */

export class ULTP {
    /**
     * Encodes system state into a ULTP string.
     * @param {ULTPState} state 
     * @returns {string}
     */
    static encode(state) {
        const env = state.environment.isDogfooding ? 'D' : (state.environment.status === 'ACTIVE' ? 'A' : 'N');
        const kStatus = state.kernel.found ? 'V' : 'X';
        const kPath = state.kernel.path || '';

        const adapters = state.adapters.map(a => {
            const code = a.name.includes('cursor') ? 'C' : (a.name.includes('CLAUDE') ? 'K' : 'G');
            return a.found ? code : '';
        }).filter(Boolean).sort().join(',');

        const skills = state.skills.sort().join(',');
        const mStatus = state.memory?.found ? 'V' : 'X';
        return `[OS:${env}][L0:${kStatus};P:${kPath}][L1:${adapters}][L2:${skills}][M:${mStatus}]`;
    }

    /**
     * Validates ULTP syntax using strict regex.
     * @param {string} input 
     * @returns {boolean}
     */
    static validate(input) {
        const pattern = /^\[OS:[AND]\]\[L0:[VX];P:[^\]]*\]\[L1:[CKG,]*\]\[L2:[^\]]*\]\[M:[VX]\]$/;
        return pattern.test(input);
    }

    /**
     * Decodes a ULTP string back to structured data (simplified).
     * @param {string} input 
     * @returns {Record<string, any>|null}
     */
    static decode(input) {
        if (!this.validate(input)) return null;

        /** @type {Record<string, any>} */
        const data = {};

        const osMatch = input.match(/\[OS:([AND])\]/);
        if (osMatch) data['os'] = osMatch[1];

        const kernelMatch = input.match(/\[L0:([VX]);P:([^\]]*)\]/);
        if (kernelMatch) data['kernel'] = { found: kernelMatch[1] === 'V', path: kernelMatch[2] || null };

        const adapterMatch = input.match(/\[L1:([^\]]*)\]/);
        if (adapterMatch) data['adapters'] = adapterMatch[1] ? adapterMatch[1].split(',') : [];

        const skillMatch = input.match(/\[L2:([^\]]*)\]/);
        if (skillMatch) data['skills'] = skillMatch[1] ? skillMatch[1].split(',') : [];

        const memoryMatch = input.match(/\[M:([VX])\]/);
        if (memoryMatch) data['memory'] = { found: memoryMatch[1] === 'V' };

        return data;
    }
}
