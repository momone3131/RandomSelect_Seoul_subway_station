import { RandomSeoulController } from './application/random-seoul-controller';
import { isAlcoholFoodId } from './data/food-category-features';
import { AppStore } from './state/app-state';
import { GoogleWebPlaceSearchService } from './services/places/google-web';
import { PlaceSearchUnavailableError, type PlaceSearchService } from './services/places/place-search';
import { StationLocationService } from './services/places/station-location';
import { loadPersistedInitialState, saveHistory, savePreferences, saveVisits } from './services/storage/app-persistence';
import { WebStorageService } from './services/storage/web-storage';
import { googleMapsSearchUrl, naverMapSearchUrl } from './services/maps/web-map-links';
import { animateDrawStage, revealDrawStage, type AnimatedDrawStage } from './ui/draw-animation';
import { renderDrawView } from './ui/draw-view';
import { renderHistory } from './ui/history-view';
import { FootprintMapView } from './ui/footprint-map-view';
import { renderVisits, VisitModalView } from './ui/visit-view';
import { renderAttractions, resetAttractionView } from './ui/attraction-view';
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
import { legacyBody, legacyGoogleMapsApiKey, legacyStyles } from './generated/legacy-shell';

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
const visitModal = new VisitModalView();
const footprintMap = new FootprintMapView();

let busy = false;
let toastTimer: number | undefined;
let restaurantLookupKey: string | undefined;
let restaurantLookupBusy = false;
let restaurantLookupComplete = false;
let restaurantLookupFailed = false;

function ensureRestaurantRequestControl(): { wrap: HTMLElement; button: HTMLButtonElement } {
  let wrap = document.getElementById('restaurant_request') as HTMLElement | null;
  let button = document.getElementById('restaurant_request_btn') as HTMLButtonElement | null;
  if (wrap && button) return { wrap, button };

  wrap = document.createElement('div');
  wrap.id = 'restaurant_request';
  wrap.className = 'restaurant-request';
  wrap.hidden = true;

  button = document.createElement('button');
  button.id = 'restaurant_request_btn';
  button.className = 'restaurant-request-btn';
  button.type = 'button';
  button.textContent = '추천 식당 보기';
  wrap.appendChild(button);

  const panels = document.querySelector<HTMLElement>('.panels');
  if (!panels) throw new Error('Missing .panels.');
  panels.insertAdjacentElement('afterend', wrap);
  return { wrap, button };
}

const restaurantRequest = ensureRestaurantRequestControl();

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
    isAlcohol: isAlcoholFoodId(state.currentFood.id),
  };
}

function currentRestaurantKey(): string | undefined {
  const state = store.getSnapshot();
  if (!state.currentLine || !state.currentStation || !state.currentFood) return undefined;
  return `${state.currentLine.id}|${state.currentStation.name}|${state.currentFood.id}`;
}

function syncRestaurantDiscoveryState(): void {
  const key = currentRestaurantKey();
  if (key !== restaurantLookupKey) {
    restaurantLookupKey = key;
    restaurantLookupBusy = false;
    restaurantLookupComplete = false;
    restaurantLookupFailed = false;
    resetRestaurantView();
  }

  if (!key) {
    restaurantRequest.wrap.hidden = true;
    return;
  }

  const context = currentRestaurantContext();
  const noun = context?.isAlcohol ? '술집' : '식당';
  restaurantRequest.wrap.hidden = restaurantLookupComplete;
  restaurantRequest.button.disabled = restaurantLookupBusy;
  restaurantRequest.button.textContent = restaurantLookupBusy
    ? `추천 ${noun} 찾는 중…`
    : restaurantLookupFailed
      ? `추천 ${noun} 다시 찾기`
      : `추천 ${noun} 보기`;

  if (restaurantLookupBusy) {
    for (const id of ['draw_btn', 'restart_btn', 'station_redraw_btn', 'food_redraw_btn', 'settings_btn', 'food_settings_btn']) {
      const control = document.getElementById(id) as HTMLButtonElement | null;
      if (control) control.disabled = true;
    }
  }
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
    helper.textContent = '버튼을 눌러 노선을 정해보세요.';
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
  progress.textContent = '외출 코스 완성';
  helper.textContent = '추천 명소를 보고, 원하면 주변 추천 장소를 찾아보세요.';
}

function openVisitFromHistory(item: Parameters<typeof renderHistory>[0][number]): void {
  if (busy || restaurantLookupBusy || settingsView.isOpen || visitModal.isOpen || footprintMap.isOpen) return;
  const existing = store.getSnapshot().visits.find((visit) => visit.sourceHistoryId === item.id);
  visitModal.openFromHistory(item, existing);
  renderState();
}

function openVisitRecord(visit: Parameters<typeof renderVisits>[0][number]): void {
  if (busy || restaurantLookupBusy || settingsView.isOpen || visitModal.isOpen || footprintMap.isOpen) return;
  visitModal.openVisit(visit);
  renderState();
}

function deleteVisitRecord(visit: Parameters<typeof renderVisits>[0][number]): void {
  if (!window.confirm(`${visit.stationName}역 방문 기록을 삭제할까요?`)) return;
  controller.deleteVisit(visit.id);
  notify('방문 기록을 삭제했어요.');
}

function openFootprintMap(): void {
  if (busy || restaurantLookupBusy || settingsView.isOpen || visitModal.isOpen || footprintMap.isOpen) return;
  const visits = store.getSnapshot().visits;
  if (!visits.length) return;
  void footprintMap.open(visits).catch((error) => {
    console.error(error);
    notify('발자취 지도를 불러오지 못했어요.');
  });
  renderState();
}

function renderState(): void {
  const state = store.getSnapshot();
  renderDrawView(state, { busy, modalOpen: settingsView.isOpen || visitModal.isOpen || footprintMap.isOpen });
  renderHistory(state.history, state.visits, openVisitFromHistory);
  renderVisits(state.visits, { onEdit: openVisitRecord, onDelete: deleteVisitRecord, onOpenMap: openFootprintMap });
  if (state.currentStation) renderAttractions(state.currentStation.name, state.attractions);
  else resetAttractionView();
  updateStatusCopy();
  savePreferences(storage, state.preferences);
  saveHistory(storage, state.history);
  saveVisits(storage, state.visits);
  syncRestaurantDiscoveryState();
}

store.subscribe(renderState);

function restaurantErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return `Google Places: ${error.message}`;
  return 'Google Places API 연결 또는 사용 설정을 확인해주세요.';
}

async function performDraw(
  action: () => Promise<unknown> | unknown,
  animationStage?: AnimatedDrawStage,
): Promise<void> {
  if (busy || restaurantLookupBusy || settingsView.isOpen || visitModal.isOpen || footprintMap.isOpen) return;
  busy = true;
  renderState();

  try {
    if (animationStage) {
      await animateDrawStage(animationStage, store.getSnapshot(), {
        instant: selfTestMode || store.getSnapshot().preferences.instantDraw,
      });
    }

    await Promise.resolve(action());
    renderState();
    if (animationStage) revealDrawStage(animationStage);
  } catch (error) {
    notify('추첨 중 문제가 생겼어요.');
    console.error(error);
  } finally {
    busy = false;
    renderState();
  }
}

async function requestRestaurants(scrollToResults = true): Promise<void> {
  if (busy || restaurantLookupBusy || restaurantLookupComplete || settingsView.isOpen || visitModal.isOpen) return;
  const key = currentRestaurantKey();
  const context = currentRestaurantContext();
  if (!key || !context) return;

  restaurantLookupBusy = true;
  restaurantLookupFailed = false;
  renderState();
  renderRestaurantLoading(context);

  try {
    await controller.loadRecommendations();
    if (currentRestaurantKey() !== key) return;

    renderRestaurants(context, store.getSnapshot().recommendations);
    restaurantLookupComplete = true;
    restaurantLookupFailed = false;
    announce(context.isAlcohol ? '추천 술집을 찾았습니다.' : '추천 식당을 찾았습니다.');
  } catch (error) {
    if (currentRestaurantKey() !== key) return;
    restaurantLookupFailed = true;
    renderRestaurantError(context, restaurantErrorMessage(error));
    notify('추천 정보를 불러오지 못했어요.');
    console.error(error);
  } finally {
    if (currentRestaurantKey() === key) {
      restaurantLookupBusy = false;
      renderState();
      if (restaurantLookupComplete && scrollToResults) {
        window.requestAnimationFrame(() => {
          byId<HTMLElement>('restaurant_section').scrollIntoView({
            behavior: selfTestMode ? 'auto' : 'smooth',
            block: 'start',
          });
        });
      }
    }
  }
}

async function runMainDraw(): Promise<void> {
  const stage = controller.getStage();
  if (stage === 'done') {
    store.resetCourse();
    await performDraw(() => controller.redrawLine(), 'line');
    const restarted = store.getSnapshot();
    if (restarted.currentLine) announce(`${restarted.currentLine.name}이 뽑혔습니다.`);
    return;
  }

  await performDraw(() => controller.drawNext(), stage);
  const state = store.getSnapshot();
  if (stage === 'line' && state.currentLine) announce(`${state.currentLine.name}이 뽑혔습니다.`);
  if (stage === 'station' && state.currentStation) announce(`${state.currentStation.name}역이 뽑혔습니다.`);
  if (stage === 'food' && state.currentFood) announce(`음식은 ${state.currentFood.name}입니다.`);
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
  if (!state.currentStation) return '';
  if (state.currentFood) {
    return isAlcoholFoodId(state.currentFood.id)
      ? `${state.currentStation.name}에서 ${state.currentFood.name} 가자!`
      : `${state.currentStation.name}에서 ${state.currentFood.name} 먹자!`;
  }
  return `${state.currentStation.name} 가자!`;
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
restaurantRequest.button.addEventListener('click', () => { void requestRestaurants(); });
byId<HTMLButtonElement>('restart_btn').addEventListener('click', () => {
  store.resetCourse();
  void performDraw(() => controller.redrawLine(), 'line');
});
byId<HTMLButtonElement>('station_redraw_btn').addEventListener('click', () => {
  void performDraw(() => controller.redrawStation(), 'station');
});
byId<HTMLButtonElement>('food_redraw_btn').addEventListener('click', () => {
  void performDraw(() => controller.redrawFood(), 'food');
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
  if (restaurantLookupBusy || visitModal.isOpen || footprintMap.isOpen) return;
  settingsView.open('line', store.getSnapshot().preferences.selectedLineIds);
  renderState();
});
byId<HTMLButtonElement>('food_settings_btn').addEventListener('click', () => {
  if (restaurantLookupBusy || visitModal.isOpen || footprintMap.isOpen) return;
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

byId<HTMLButtonElement>('close_footprint').addEventListener('click', () => {
  footprintMap.close();
  renderState();
});
byId<HTMLElement>('footprint_overlay').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    footprintMap.close();
    renderState();
  }
});

byId<HTMLButtonElement>('close_visit').addEventListener('click', () => {
  visitModal.close();
  renderState();
});
byId<HTMLButtonElement>('cancel_visit').addEventListener('click', () => {
  visitModal.close();
  renderState();
});
byId<HTMLButtonElement>('save_visit').addEventListener('click', () => {
  const submission = visitModal.getSubmission();
  if (!submission) return;
  controller.saveVisit(submission);
  visitModal.close();
  renderState();
  notify('방문 기록을 저장했어요.');
});
byId<HTMLElement>('visit_overlay').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    visitModal.close();
    renderState();
  }
});

byId<HTMLButtonElement>('clear_history').addEventListener('click', () => {
  controller.clearHistory();
  notify('최근 추첨 기록만 지웠어요. 방문 기록은 유지돼요.');
});

document.addEventListener('keydown', (event) => {
  if (footprintMap.isOpen) {
    if (event.key === 'Escape') {
      event.preventDefault();
      footprintMap.close();
      renderState();
    }
    return;
  }
  if (visitModal.isOpen) {
    if (event.key === 'Escape') {
      event.preventDefault();
      visitModal.close();
      renderState();
    }
    return;
  }
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

    const beforeRestaurants = store.getSnapshot();
    if (!beforeRestaurants.currentLine || !beforeRestaurants.currentStation || !beforeRestaurants.currentFood) {
      throw new Error('Self-test did not complete line/station/food draw.');
    }
    if (beforeRestaurants.recommendations.length !== 0) {
      throw new Error('Restaurant lookup ran before the user requested it.');
    }
    document.body.dataset.selftestDeferredRestaurants = 'true';

    await requestRestaurants(false);
    const complete = store.getSnapshot();
    const cardCount = document.querySelectorAll('#restaurant_cards .restaurant-card').length;
    document.body.dataset.selftestRecommendations = String(complete.recommendations.length);
    document.body.dataset.selftestCards = String(cardCount);
    document.body.dataset.selftestFood = complete.currentFood?.id ?? '';

    if (complete.recommendations.length !== 3 || cardCount !== 3) {
      throw new Error('Self-test did not render exactly three recommendations after request.');
    }
    if (complete.recommendations.some((restaurant) => restaurant.id === 'selftest-far')) {
      throw new Error('Self-test 2 km filter failed.');
    }

    const footprintHistory = complete.history[0];
    if (!footprintHistory) throw new Error('Self-test has no draw history for footprint validation.');
    const selfTestVisit = controller.saveVisit({
      sourceHistoryId: footprintHistory.id,
      lineId: footprintHistory.lineId,
      stationName: footprintHistory.stationName,
      stationOrdinal: footprintHistory.stationOrdinal,
      drawnFoodId: footprintHistory.foodId,
      shownAttractions: footprintHistory.attractionOptions ?? [],
      includeFood: Boolean(footprintHistory.foodId),
      selectedAttractionIds: [],
      visitedAt: '2026-09-18',
    });

    await footprintMap.open(store.getSnapshot().visits);
    const footprintMarker = document.querySelector<HTMLButtonElement>('.footprint-visit-marker');
    const footprintReference = document.querySelector<HTMLImageElement>('.footprint-reference-image');
    if (!footprintMarker || !footprintReference?.src.includes('footprint-seoul-subway-reference.svg')) {
      throw new Error('Self-test footprint full-network reference did not render.');
    }
    const markerIdentity = footprintMarker;
    footprintMarker.click();
    if (document.querySelector('.footprint-visit-marker') !== markerIdentity) {
      throw new Error('Self-test footprint marker was rebuilt after selection.');
    }
    document.body.dataset.selftestFootprint = 'stable-full-network';
    footprintMap.close();
    controller.deleteVisit(selfTestVisit.id);

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
document.body.dataset.appReady = 'true';
if (selfTestMode) void runBrowserSelfTest();