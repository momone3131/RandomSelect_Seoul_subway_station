import { readFile, writeFile } from 'node:fs/promises';

const svgPath = new URL('../public/footprint-seoul-subway-reference.svg', import.meta.url);
const subwayPath = new URL('../src/data/subway-lines.ts', import.meta.url);
const outputPath = new URL('../src/data/footprint-map-anchors.ts', import.meta.url);

function normalizeText(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function transformOrigin(attributes) {
  const match = attributes.match(/transform="matrix\(([^)]*)\)"/);
  if (!match) return undefined;
  const values = match[1].trim().split(/[\s,]+/).map(Number);
  if (values.length < 6 || values.some((value) => !Number.isFinite(value))) return undefined;
  return { x: values[4], y: values[5] };
}

function parseLineDefinitions(source) {
  const marker = source.indexOf('const LINE_DEFINITIONS');
  const equals = source.indexOf('=', marker);
  const end = source.indexOf('];', equals);
  if (marker < 0 || equals < 0 || end < 0) throw new Error('Unable to locate LINE_DEFINITIONS.');
  return JSON.parse(source.slice(equals + 1, end + 1).trim());
}

function uniqueOutcomes(definitions) {
  const outcomes = definitions.flatMap((line) =>
    line.segments.flatMap((segment) =>
      segment.stations.map((stationName) => ({ lineId: line.id, stationName })),
    ),
  );
  return Array.from(new Map(
    outcomes.map((outcome) => [outcome.lineId + ':' + outcome.stationName, outcome]),
  ).values());
}

function buildReferenceLabelIndex(svg) {
  const byText = new Map();
  const regex = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  for (const match of svg.matchAll(regex)) {
    const origin = transformOrigin(match[1]);
    if (!origin) continue;
    const text = normalizeText(match[2]);
    if (!text) continue;
    const coordinates = byText.get(text) ?? new Map();
    coordinates.set(
      origin.x.toFixed(4) + ',' + origin.y.toFixed(4),
      { text, x: origin.x, y: origin.y },
    );
    byText.set(text, coordinates);
  }
  return byText;
}

const EXPLICIT_REFERENCE = {
  'l2:신촌': { label: '신촌(지하)' },
  'gc:신촌': { label: '신촌(경의선)' },
  'l5:양평': { label: '양평', near: { x: 2483.9451, y: 2786.79 } },
  'gc:양평': { label: '양평', near: { x: 5447.1284, y: 2328.2153 } },
  'l4:총신대입구(이수)': { label: '이수' },
  'l7:이수': { label: '이수' },
};

const SYNTHETIC_TERMINAL = {
  key: 'gj:차량기지 임시승강장',
  x: 4133.27,
  y: 814.39,
};

function resolveReferenceAnchor(index, outcome) {
  const key = outcome.lineId + ':' + outcome.stationName;
  if (key === SYNTHETIC_TERMINAL.key) {
    return {
      x: SYNTHETIC_TERMINAL.x,
      y: SYNTHETIC_TERMINAL.y,
      referenceLabel: outcome.stationName,
      source: 'synthetic-terminal-extension',
    };
  }

  const explicit = EXPLICIT_REFERENCE[key];
  const label = explicit?.label ?? outcome.stationName;
  const candidates = Array.from(index.get(normalizeText(label))?.values() ?? []);
  if (!candidates.length) throw new Error('Missing reference label: ' + key + ' -> ' + label);

  let picked;
  if (explicit?.near) {
    picked = candidates.slice().sort((left, right) =>
      Math.hypot(left.x - explicit.near.x, left.y - explicit.near.y)
      - Math.hypot(right.x - explicit.near.x, right.y - explicit.near.y),
    )[0];
  } else {
    if (candidates.length !== 1) {
      throw new Error('Ambiguous reference label: ' + key + ' -> ' + label + ' (' + candidates.length + ')');
    }
    picked = candidates[0];
  }

  return {
    x: picked.x,
    y: picked.y,
    referenceLabel: label,
    source: 'wikimedia-2025-reference-label',
  };
}

function serialize(anchors) {
  const lines = [
    'export interface FootprintMapAnchor {',
    '  x: number;',
    '  y: number;',
    '  referenceLabel: string;',
    "  source: 'wikimedia-2025-reference-label' | 'synthetic-terminal-extension';",
    '}',
    '',
    'export const FOOTPRINT_MAP_VIEWBOX = { width: 5724, height: 6516 } as const;',
    '',
    '// Generated from the 2025-06-29 public-domain Seoul Metropolitan Subway SVG reference.',
    '// Keys intentionally use lineId:stationName so same-name non-interchanges can have distinct anchors.',
    'export const FOOTPRINT_MAP_ANCHORS: Readonly<Record<string, FootprintMapAnchor>> = {',
  ];

  for (const key of Object.keys(anchors).sort()) {
    const anchor = anchors[key];
    lines.push(
      '  ' + JSON.stringify(key) + ': { x: ' + Number(anchor.x.toFixed(4))
      + ', y: ' + Number(anchor.y.toFixed(4))
      + ', referenceLabel: ' + JSON.stringify(anchor.referenceLabel)
      + ', source: ' + JSON.stringify(anchor.source) + ' },',
    );
  }
  lines.push(
    '};',
    '',
    'export function getFootprintMapAnchor(lineId: string, stationName: string): FootprintMapAnchor | undefined {',
    '  return FOOTPRINT_MAP_ANCHORS[lineId + ":" + stationName];',
    '}',
    '',
  );
  return lines.join('\n');
}

const [svg, subwaySource] = await Promise.all([
  readFile(svgPath, 'utf8'),
  readFile(subwayPath, 'utf8'),
]);
const definitions = parseLineDefinitions(subwaySource);
const outcomes = uniqueOutcomes(definitions);
const referenceIndex = buildReferenceLabelIndex(svg);
const anchors = Object.fromEntries(
  outcomes.map((outcome) => [
    outcome.lineId + ':' + outcome.stationName,
    resolveReferenceAnchor(referenceIndex, outcome),
  ]),
);

if (outcomes.length !== 800 || Object.keys(anchors).length !== 800) {
  throw new Error('Expected 800 anchors, got ' + Object.keys(anchors).length + '.');
}

await writeFile(outputPath, serialize(anchors), 'utf8');
console.log('Generated ' + Object.keys(anchors).length + ' full-network footprint anchors.');
