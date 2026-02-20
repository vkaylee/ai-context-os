// @ts-check

/**
 * AI Context OS - Compressor Engine
 * Transforms human-readable Markdown into token-efficient instructions for AI Agents.
 */

export class CompressorEngine {
    /**
     * Compresses a markdown string into high-density directives.
     * @param {string} content The original markdown content.
     * @returns {string} The compressed, high-density instruction string.
     */
    static compress(content) {
        let lines = content.split('\n');
        /** @type {string[]} */
        const density = [];

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('<!--')) continue;

            // Strip fluff headers and meta-talk
            if (line.match(/^(the goal|this file|welcome|our objective|it is important)/i)) continue;

            // Compact Headers
            if (line.startsWith('# ')) {
                density.push(`[${line.substring(2).toUpperCase()}]`);
                continue;
            }
            if (line.startsWith('## ')) {
                density.push(`[${line.substring(3).toUpperCase()}]`);
                continue;
            }

            // High-density directives
            if (line.startsWith('- ') || line.startsWith('* ')) {
                density.push(`!${line.substring(2)}`);
                continue;
            }

            density.push(line);
        }

        return density.join(' ')
            .replace(/\b(the|a|an|please|ensure|that|you|should|make|sure|to|is|are|of|in|with)\b/gi, '')
            .replace(/\s+/g, ' ')
            .replace(/\.\s/g, ' ')
            .replace(/MUST/gi, '!')
            .replace(/MANDATORY/gi, '!!')
            .replace(/violation/gi, 'ERR')
            .replace(/requirement/gi, 'REQ')
            .trim();
    }
}
