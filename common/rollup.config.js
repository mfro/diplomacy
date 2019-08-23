import typescript from 'rollup-plugin-typescript2';

module.exports = {
    input: 'src/main.ts',
    output: {
        file: 'out/main.js',
        format: 'cjs',
        sourcemap: 'inline',
    },
    plugins: [
        typescript(),
    ],
    external: [
        'zlib',

        'fs-extra',
        'request-promise-native',
    ],
};
