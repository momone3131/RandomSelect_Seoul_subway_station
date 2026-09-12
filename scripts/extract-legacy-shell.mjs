import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../index.html', import.meta.url);
const outputDir = new URL('../src/generated/', import.meta.url);
const outputPath = new URL('../src/generated/legacy-shell.ts', import.meta.url);
const html = await readFile(sourcePath, 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
if (!styleMatch) throw new Error('Could not extract legacy <style> block.');

const bodyStart = html.search(/<body[^>]*>/i);
const bodyStartEnd = html.indexOf('>', bodyStart) + 1;
const dataMarker = html.search(/<script\s+id=["']food_data["']/i);
if (bodyStart < 0 || bodyStartEnd <= 0 || dataMarker < 0) {
  throw new Error('Could not find the legacy body shell boundaries.');
}

let body = html.slice(bodyStartEnd, dataMarker).trim();
// Branding change is intentionally applied only to the modular app while main remains stable.
body = body.replace(/NEXT STOP/g, 'RANDOM SEOUL');

const keyMatch = html.match(/(?:var|const|let)\s+GOOGLE_MAPS_API_KEY\s*=\s*['"]([^'"]+)['"]/);
const legacyGoogleMapsApiKey = keyMatch?.[1] ?? '';

await mkdir(outputDir, { recursive: true });
await writeFile(
  outputPath,
  [
    '// Generated from the stable single-file Web app. Do not edit by hand.',
    `export const legacyStyles = ${JSON.stringify(styleMatch[1])};`,
    `export const legacyBody = ${JSON.stringify(body)};`,
    `export const legacyGoogleMapsApiKey = ${JSON.stringify(legacyGoogleMapsApiKey)};`,
    '',
  ].join('\n'),
  'utf8',
);

console.log('Generated src/generated/legacy-shell.ts from stable index.html');
