import { SUBWAY_LINES } from './subway-lines';

export interface StationReference {
  lineId: string;
  stationName: string;
}

const SAME_NAME_NON_INTERCHANGE_STATIONS = new Set(['신촌', '양평']);

const MANUAL_INTERCHANGE_GROUPS: readonly (readonly StationReference[])[] = [
  [
    { lineId: 'l4', stationName: '총신대입구(이수)' },
    { lineId: 'l7', stationName: '이수' },
  ],
];

const stationReferences = SUBWAY_LINES.flatMap((line) =>
  line.stations.map((station) => ({ lineId: line.id, stationName: station.name })),
);
const validStationKeys = new Set(stationReferences.map((station) => stationKey(station.lineId, station.stationName)));
const equivalentStationsByKey = new Map<string, readonly StationReference[]>();

function stationKey(lineId: string, stationName: string): string {
  return `${lineId}:${stationName}`;
}

function registerInterchangeGroup(group: readonly StationReference[]): void {
  for (const station of group) {
    const key = stationKey(station.lineId, station.stationName);
    if (!validStationKeys.has(key)) {
      throw new Error(`Unknown interchange station: ${key}`);
    }
  }

  for (const station of group) {
    equivalentStationsByKey.set(stationKey(station.lineId, station.stationName), group);
  }
}

const stationsByName = new Map<string, StationReference[]>();
for (const station of stationReferences) {
  const group = stationsByName.get(station.stationName) ?? [];
  group.push(station);
  stationsByName.set(station.stationName, group);
}

for (const [stationName, group] of stationsByName) {
  if (group.length > 1 && !SAME_NAME_NON_INTERCHANGE_STATIONS.has(stationName)) {
    registerInterchangeGroup(group);
  }
}

for (const group of MANUAL_INTERCHANGE_GROUPS) {
  registerInterchangeGroup(group);
}

export function getEquivalentStationReferences(lineId: string, stationName: string): readonly StationReference[] {
  return equivalentStationsByKey.get(stationKey(lineId, stationName)) ?? [{ lineId, stationName }];
}
