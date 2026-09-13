import type { RandomSeoulController } from './random-seoul-controller';
import type { AppState, AppStore } from '../state/app-state';
import { renderAttractionLoading, renderAttractions, resetAttractionView } from '../ui/attraction-view';

function stationKey(state: Readonly<AppState>): string {
  if (!state.currentLine || !state.currentStation) return '';
  return `${state.currentLine.id}:${state.currentStation.ordinal}:${state.currentStation.name}`;
}

export function initializeAttractionFeature(controller: RandomSeoulController, store: AppStore): () => void {
  let activeKey = '';
  let requestId = 0;

  const sync = (state: Readonly<AppState>): void => {
    const key = stationKey(state);
    if (!key) {
      activeKey = '';
      requestId += 1;
      resetAttractionView();
      return;
    }
    if (key === activeKey) return;

    activeKey = key;
    const currentRequest = ++requestId;
    const stationName = state.currentStation?.name ?? '';
    renderAttractionLoading(stationName);

    void controller.loadAttractions().then((attractions) => {
      if (currentRequest !== requestId || stationKey(store.getSnapshot()) !== key) return;
      renderAttractions(stationName, attractions);
    }).catch(() => {
      if (currentRequest !== requestId || stationKey(store.getSnapshot()) !== key) return;
      resetAttractionView();
    });
  };

  const unsubscribe = store.subscribe(sync);
  sync(store.getSnapshot());
  return unsubscribe;
}
