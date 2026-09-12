import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const sourcePath = new URL('index.html', root);
const stylePath = new URL('src/ui/styles.css', root);
const shellPath = new URL('src/ui/shell.html', root);
const html = await readFile(sourcePath, 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
if (!styleMatch) throw new Error('Could not extract legacy <style> block.');

const bodyStart = html.search(/<body[^>]*>/i);
const bodyStartEnd = html.indexOf('>', bodyStart) + 1;
const dataMarker = html.search(/<script\s+id=["']food_data["']/i);
if (bodyStart < 0 || bodyStartEnd <= 0 || dataMarker < 0) {
  throw new Error('Could not find the legacy body shell boundaries.');
}

let shell = html.slice(bodyStartEnd, dataMarker).trim();
shell = shell.replace(/NEXT STOP/g, 'RANDOM SEOUL');

await mkdir(new URL('src/ui/', root), { recursive: true });
await writeFile(stylePath, `${styleMatch[1].trim()}\n`, 'utf8');
await writeFile(shellPath, `${shell}\n`, 'utf8');

console.log('Promoted exact stable CSS → src/ui/styles.css');
console.log('Promoted exact stable DOM shell → src/ui/shell.html');
