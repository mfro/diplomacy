import typescript from 'rollup-plugin-typescript2';
import { string } from "rollup-plugin-string";
import json from "rollup-plugin-json";

module.exports = {
    input: 'src/main.ts',
    output: {
        file: 'out/main.js',
        format: 'cjs',
        sourcemap: 'inline',
    },
    plugins: [
        typescript(),
        string({
            include: ['**/*.txt', '**/*.svg'],
        }),
        json({
            
        }),
    ],
    external: [
        'zlib',

        'fs-extra',
        'request-promise-native',
        'diplomacy-common'
    ],
};
