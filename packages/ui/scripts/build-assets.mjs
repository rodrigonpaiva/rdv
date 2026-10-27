import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
fs.mkdirSync(new URL('dist/fonts/', root), { recursive: true });
for (const name of ['styles.css', 'tokens.css']) fs.copyFileSync(new URL(`src/${name}`, root), new URL(`dist/${name}`, root));
const font = fileURLToPath(import.meta.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'));
fs.copyFileSync(font, new URL('dist/fonts/inter-latin-wght-normal.woff2', root));
fs.copyFileSync(new URL('../LICENSE', new URL(import.meta.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'))), new URL('dist/fonts/OFL.txt', root));
