import { mkdir, readFile, writeFile } from 'node:fs/promises';

const stylesPath = new URL('../src/ui/styles.css', import.meta.url);
const mobileOverridesPath = new URL('../src/ui/mobile-overrides.css', import.meta.url);
const subwaySignOverridesPath = new URL('../src/ui/subway-sign-overrides.css', import.meta.url);
const shellPath = new URL('../src/ui/shell.html', import.meta.url);
const outputDir = new URL('../src/generated/', import.meta.url);
const outputPath = new URL('../src/generated/legacy-shell.ts', import.meta.url);

const [styles, mobileOverrides, subwaySignOverrides, body] = await Promise.all([
  readFile(stylesPath, 'utf8'),
  readFile(mobileOverridesPath, 'utf8'),
  readFile(subwaySignOverridesPath, 'utf8'),
  readFile(shellPath, 'utf8'),
]);
const combinedStyles = `${styles.trim()}\n\n${mobileOverrides.trim()}\n\n${subwaySignOverrides.trim()}\n`;

await mkdir(outputDir, { recursive: true });
await writeFile(
  outputPath,
  [
    '// Generated from permanent modular Web assets. Do not edit by hand.',
    `export const legacyStyles = ${JSON.stringify(combinedStyles)};`,
    `export const legacyBody = ${JSON.stringify(body)};`,
    // The modular app gets its Web key through VITE_GOOGLE_MAPS_API_KEY.
    // Keeping this symbol temporarily avoids a large composition-root rewrite during parity work.
    "export const legacyGoogleMapsApiKey = '';",
    '',
  ].join('\n'),
  'utf8',
);

console.log('Generated src/generated/legacy-shell.ts from permanent modular assets');
