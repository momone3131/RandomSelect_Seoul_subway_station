import { RandomSeoulController } from './application/random-seoul-controller';
import { AppStore } from './state/app-state';
import { GoogleWebPlaceSearchService } from './services/places/google-web';
import {
  PlaceSearchUnavailableError,
  type PlaceSearchService,
} from './services/places/place-search';
import { StationLocationService } from './services/places/station-location';
import {
  loadPersistedInitialState,
  saveHistory,
  savePreferences,
} from './services/storage/app-persistence';
import { WebStorageService } from './services/storage/web-storage';
import { googleMapsSearchUrl, naverMapSearchUrl } from './services/maps/web-map-links';
import { renderDrawView } from './ui/draw-view';
import { renderHistory } from './ui/history-view';
import {
  renderRestaurantError,
  renderRestaurantLoading,
  renderRestaurants,
  resetRestaurantView,
  type RestaurantViewContext,
} from './ui/restaurant-view';
import { SettingsModalView } from './ui/settings-view';
import { byId } from './ui/dom';
import { BrowserSmokePlaceSearchService } from './testing/browser-smoke-place-search';
import {
  legacyBody,
  legacyGoogleMapsApiKey,
  legacyStyles,
} from './generated/legacy-shell';

class UnavailablePlaceSearchService implements PlaceSearchService {
  async searchText(): Promise<never[]> {
    throw new PlaceSearchUnavailableError('Google Maps API key is not configured.');
  }
}

const appRoot = document.getElementById('app');
if (!appRoot) throw new Error('Missing #app root.');

const style = document.createElement('style');
style.textContent = legacyStyles;
document.head.appendChild(style);
appRoot.innerHTML = legacyBody;
document.title = 'Random Seoul';

const brandTitle = document.querySelector<HTMLElement>('.brand-title');
if (brandTitle) brandTitle.textContent = 'RANDOM SEOUL';
const brandSub = document.querySelector<HTMLElement>('.brand-sub');
if (brandSub) brandSub.textContent = '서울 랜덤 외출 코스';
const startupNotice = document.getElementById('startup_notice');
if (startupNotice) startupNotice.hidden = true;
const runtimeState = document.getElementById('runtime_state');
if (runtimeState) runtimeState.textContent = '브라우저 실행 중';

type InteractiveTarget = HTMLElement & { isContentEditable?: boolean };

const selfTestMode = new URLSearchParams(window.location.search).get('selftest') === '1';
const storage = new WebStorageService();
const store = new AppStore(loadPersistedInitialState(storage));
const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || legacyGoogleMapsApiKey || '').trim();
const places: PlaceSearchService = selfTestMode
  ? new BrowserSmokePlaceSearchService()
  : apiKey
    ? new GoogleWebPlaceSearchService(apiKey)
    : new UnavailablePlaceSearchService();
const stationLocations = new StationLocationService(
  places,
  storage,
  selfTestMode ? () => 1_000_000 : Date.now,
);
const controller = new RandomSeoulController(
  store,
  places,
  stationLocations,
  selfTestMode ? () => 0 : Math.random,
  selfTestMode ? () => 1_000_000 : Date.now,
);
const settingsView = new SettingsModalView();

let busy = false;
let toastTimer: number | undefined;

function notify(message: string): void {
  const toast = byId<HTMLElement>('toast');
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer !== undefined) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function announce(message: string): void {
  const node = byId<HTMLElement>('announcer');
  node.textContent = '';
  window.setTimeout(() => { node.textContent = message; }, 10);
}

function currentRestaurantContext(): RestaurantViewContext | undefined {
  const state = store.getSnapshot();
  if (!state.currentStation || !state.currentFood) return undefined;
  const query = `${state.currentStation.name}역 ${state.currentFood.searchQuery ?? state.currentFood.name}`;
  return {
    stationName: state.currentStation.name,
    foodName: state.currentFood.name,
    query,
  };
}

function updateStatusCopy(): void {
  const state = store.getSnapshot();
  const progress = byId<HTMLElement>('progress_note');
  const helper = byId<HTMLElement>('helper');

  if (busy) {
    helper.textContent = '두근두근, 결과를 정하는 중이에요.';
    return;
  }
  if (!state.currentLine) {
    progress.textContent = '출발 준비 완료';
    helper.textContent = '버튼을 눌러 오늘의 노선을 정해보세요.';
    return;
  }
  if (!state.currentStation) {
    progress.textContent = '노선 확정 · 다음은 역';
    helper.textContent = `${state.currentLine.name} 선택 완료! 이제 한 번 더 눌러 역을 뽑으세요.`;
    return;
  }
  if (!state.currentFood) {
    progress.textContent = '역 확정 · 다음은 음식';
    helper.textContent = `목적지는 ${state.currentStation.name}! 마지막으로 음식 종목을 뽑으세요.`;
    return;
  }
  progress.textContent = '오늘의 외출 코스 완성';
  helper.textContent = '오늘의 외출 코스 완성! 새 코스를 뽑거나 아래 버튼으로 일부만 다시 뽑을 수 있어요.';
}

function renderState(): void {
  const state = store.getSnapshot();
  renderDrawView(state, { busy, modalOpen: settingsView.isOpen });
  renderHistory(state.history);
  updateStatusCopy();
  savePreferences(storage, state.preferences);
  saveHistory(storage, state.history);
  if (!state.currentFood) resetRestaurantView();
}

store.subscribe(renderState);

function restaurantErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return `Google Places: ${error.message}`;
  return 'Google Places API 연결 또는 사용 설정을 확인해주세요.';
}

async function performDraw(action: () => Promise<unknown> | unknown, loadsRestaurants: boolean): Promise<void> {
  if (busy || settingsView.isOpen) return;
  busy = true;
  renderState();

  try {
    const pending = Promise.resolve(action());
    if (loadsRestaurants) {
      const context = currentRestaurantContext();
      if (context) renderRestaurantLoading(context);
    }
    await pending;
    const context = currentRestaurantContext();
    if (context && loadsRestaurants) renderRestaurants(context, store.getSnapshot().recommendations);
  } catch (error) {
    const context = currentRestaurantContext();
    if (context) renderRestaurantError(context, restaurantErrorMessage(error));
    notify('추천 정보를 불러오지 못했어요.');
    console.error(error);
  } finally {
    busy = false;
    renderState();
  }
}

async function runMainDraw(): Promise<void> {
  const stage = controller.getStage();
  await performDraw(() => controller.drawNext(), stage === 'food');
  const state = store.getSnapshot();
  if (stage === 'line' && state.currentLine) announce(`${state.currentLine.name}이 뽑혔습니다.`);
  if (stage === 'station' && state.currentStation) announce(`${state.currentStation.name}역이 뽑혔습니다.`);
  if (stage === 'food' && state.currentFood) announce(`오늘의 음식은 ${state.currentFood.name}입니다.`);
}

function stationMapQuery(): string | undefined {
  const state = store.getSnapshot();
  if (!state.currentLine || !state.currentStation) return undefined;
  return `${state.currentStation.name}역 ${state.currentLine.name}`;
}

function openNewTab(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) {
    try { opened.opener = null; } catch { /* noop */ }
  } else {
    notify('새 창 열기가 차단됐어요. 브라우저 팝업 설정을 확인해주세요.');
  }
}

function resultMessage(): string {
  const state = store.getSnapshot();
  if (!state.currentLine || !state.currentStation) return '';
  let text = `${state.currentLine.name} · 목록의 ${state.currentStation.ordinal}번째 역: ${state.currentStation.name}`;
  if (state.currentFood) text += `\n음식: ${state.currentFood.name}\n예시: ${state.currentFood.examples}`;
  text += `\n(총 ${state.currentLine.stations.length}개 역, 본선→지선 목록 순번 기준)`;
  return text;
}

async function copyResult(): Promise<void> {
  const message = resultMessage();
  if (!message) return;
  try {
    await navigator.clipboard.writeText(message);
    notify('결과를 복사했어요.');
    return;
  } catch { /* fallback below */ }

  const textarea = byId<HTMLTextAreaElement>('copy_fallback');
  textarea.value = message;
  textarea.hidden = false;
  textarea.focus();
  textarea.select();
  try { textarea.setSelectionRange(0, message.length); } catch { /* noop */ }
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* noop */ }
  if (copied) {
    textarea.hidden = true;
    notify('결과를 복사했어요.');
  } else {
    notify('표시된 결과를 길게 눌러 복사해주세요.');
  }
}

byId<HTMLButtonElement>('draw_btn').addEventListener('click', () => { void runMainDraw(); });
byId<HTMLButtonElement>('restart_btn').addEventListener('click', () => {
  void performDraw(() => controller.redrawLine(), false);
});
byId<HTMLButtonElement>('station_redraw_btn').addEventListener('click', () => {
  void performDraw(() => controller.redrawStation(), false);
});
byId<HTMLButtonElement>('food_redraw_btn').addEventListener('click', () => {
  void performDraw(() => controller.redrawFood(), true);
});
byId<HTMLButtonElement>('copy_btn').addEventListener('click', () => { void copyResult(); });
byId<HTMLInputElement>('instant').addEventListener('change', (event) => {
  controller.setInstantDraw((event.currentTarget as HTMLInputElement).checked);
});

byId<HTMLButtonElement>('naver_map_btn').addEventListener('click', () => {
  const query = stationMapQuery();
  if (query) openNewTab(naverMapSearchUrl(query));
});
byId<HTMLButtonElement>('google_map_btn').addEventListener('click', () => {
  const query = stationMapQuery();
  if (query) openNewTab(googleMapsSearchUrl(query));
});

byId<HTMLButtonElement>('settings_btn').addEventListener('click', () => {
  settingsView.open('line', store.getSnapshot().preferences.selectedLineIds);
  renderState();
});
byId<HTMLButtonElement>('food_settings_btn').addEventListener('click', () => {
  settingsView.open('food', store.getSnapshot().preferences.selectedFoodIds);
  renderState();
});
byId<HTMLButtonElement>('close_settings').addEventListener('click', () => {
  settingsView.close();
  renderState();
});
byId<HTMLButtonElement>('cancel_settings').addEventListener('click', () => {
  settingsView.close();
  renderState();
});
byId<HTMLButtonElement>('preset_all').addEventListener('click', () => settingsView.selectAll());
byId<HTMLButtonElement>('preset_none').addEventListener('click', () => settingsView.selectNone());
byId<HTMLButtonElement>('preset_metro').addEventListener('click', () => settingsView.selectMetroOnly());
byId<HTMLButtonElement>('apply_settings').addEventListener('click', () => {
  const mode = settingsView.currentMode;
  const draft = settingsView.getDraftIds();
  if (!mode || !draft.length) return;
  if (mode === 'line') controller.setSelectedLines(draft);
  else controller.setSelectedFoods(draft);
  settingsView.close();
  renderState();
  notify(mode === 'line' ? `${draft.length}개 노선으로 추첨 범위를 바꿨어요.` : `${draft.length}종 음식으로 추첨 범위를 바꿨어요.`);
});
byId<HTMLElement>('settings_overlay').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    settingsView.close();
    renderState();
  }
});

byId<HTMLButtonElement>('clear_history').addEventListener('click', () => {
  controller.clearHistory();
  notify('추첨 기록을 지웠어요.');
});

document.addEventListener('keydown', (event) => {
  if (settingsView.isOpen) {
    if (event.key === 'Escape') {
      event.preventDefault();
      settingsView.close();
      renderState();
    }
    return;
  }
  if (event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key !== ' ' && event.key !== 'Enter') return;
  let node = event.target as InteractiveTarget | null;
  while (node && node !== document.body) {
    if (/^(BUTTON|INPUT|SELECT|TEXTAREA|A|SUMMARY)$/.test(node.tagName) || node.isContentEditable) return;
    node = node.parentElement as InteractiveTarget | null;
  }
  event.preventDefault();
  void runMainDraw();
});

async function runBrowserSelfTest(): Promise<void> {
  try {
    await runMainDraw();
    await runMainDraw();
    await runMainDraw();

    const complete = store.getSnapshot();
    const cardCount = document.querySelectorAll('.restaurant-card').length;
    document.body.dataset.selftestRecommendations = String(complete.recommendations.length);
    document.body.dataset.selftestCards = String(cardCount);
    document.body.dataset.selftestFood = complete.currentFood?.id ?? '';

    if (!complete.currentLine || !complete.currentStation || !complete.currentFood) {
      throw new Error('Self-test did not complete line/station/food draw.');
    }
    if (complete.recommendations.length !== 3 || cardCount !== 3) {
      throw new Error('Self-test did not render exactly three recommendations.');
    }
    if (complete.recommendations.some((restaurant) => restaurant.id === 'selftest-far')) {
      throw new Error('Self-test 2 km filter failed.');
    }

    await runMainDraw();
    const restarted = store.getSnapshot();
    if (!restarted.currentLine || restarted.currentStation || restarted.currentFood) {
      throw new Error('Self-test full restart did not return to the line-complete stage.');
    }

    document.body.dataset.selftestCycleReset = 'true';
    document.body.dataset.selftest = 'passed';
  } catch (error) {
    document.body.dataset.selftest = 'failed';
    document.body.dataset.selftestError = error instanceof Error ? error.message : String(error);
    console.error(error);
  }
}

renderState();
document.body.setAttribute('data-app-ready', 'true');
if (selfTestMode) void runBrowserSelfTest();
