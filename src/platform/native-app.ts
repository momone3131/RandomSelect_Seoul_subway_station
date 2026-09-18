import { App } from '@capacitor/app';
import { registerPlugin } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { getRuntimePlatform, isNativeRuntime } from './runtime';

interface RandomSeoulPlatformPlugin {
  openUrl(options: { url: string }): Promise<void>;
  openMap(options: { provider: 'google' | 'naver'; query: string }): Promise<void>;
}

const NativePlatform = registerPlugin<RandomSeoulPlatformPlugin>('RandomSeoulPlatform');

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

async function waitForAppReady(): Promise<void> {
  if (document.body.dataset.appReady === 'true') return;
  await new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.body.dataset.appReady === 'true') {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-app-ready'] });
  });
}

function updateRuntimeState(): void {
  const runtimeState = byId<HTMLElement>('runtime_state');
  if (!runtimeState) return;
  const platform = getRuntimePlatform() === 'android' ? 'Android 앱' : 'iPhone 앱';
  runtimeState.textContent = `${platform} · ${navigator.onLine ? '온라인' : '오프라인'}`;
}

function setCopyButtonToShare(): void {
  const button = byId<HTMLButtonElement>('copy_btn');
  if (!button) return;
  button.setAttribute('aria-label', '결과 공유');
  for (const node of Array.from(button.childNodes).reverse()) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = '결과 공유';
      break;
    }
  }
}

function currentResultText(): string {
  const line = byId<HTMLElement>('line_title')?.textContent?.trim();
  const ordinal = byId<HTMLElement>('ordinal_number')?.textContent?.trim();
  const station = byId<HTMLElement>('station_name')?.textContent?.trim();
  const food = byId<HTMLElement>('food_name')?.textContent?.trim();
  const examples = byId<HTMLElement>('food_examples')?.textContent?.trim();

  if (!line || !station || !ordinal || line.includes('어떤 노선') || station.includes('기다리는 중')) return '';

  const lines = [`${line} · ${ordinal}번째 역: ${station}`];
  if (food && !food.includes('무엇을 먹을까요')) lines.push(`음식: ${food}`);
  if (examples?.startsWith('예:')) lines.push(examples);
  lines.push('Random Seoul');
  return lines.join('\n');
}

function currentStationQuery(): string {
  const line = byId<HTMLElement>('line_title')?.textContent?.trim() ?? '';
  const station = byId<HTMLElement>('station_name')?.textContent?.trim() ?? '';
  if (!line || !station || line.includes('어떤 노선') || station.includes('기다리는 중')) return '';
  return `${station}역 ${line}`;
}

async function shareCurrentResult(): Promise<void> {
  const text = currentResultText();
  if (!text) return;
  try {
    await Share.share({
      title: 'Random Seoul',
      text,
      dialogTitle: '오늘의 Random Seoul 코스 공유',
    });
  } catch (error) {
    console.warn('Native share was unavailable.', error);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Native sharing is optional; the app remains usable without it.
    }
  }
}

function bindNativeShare(): void {
  setCopyButtonToShare();
  const button = byId<HTMLButtonElement>('copy_btn');
  button?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    void shareCurrentResult();
  }, true);
}

function bindNativeMaps(): void {
  const bindStationButton = (id: string, provider: 'google' | 'naver') => {
    byId<HTMLButtonElement>(id)?.addEventListener('click', (event) => {
      const query = currentStationQuery();
      if (!query) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void NativePlatform.openMap({ provider, query }).catch((error) => console.warn('Map launch failed.', error));
    }, true);
  };

  bindStationButton('google_map_btn', 'google');
  bindStationButton('naver_map_btn', 'naver');

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>('a.restaurant-map-link');
    if (!anchor?.href) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void NativePlatform.openUrl({ url: anchor.href }).catch((error) => console.warn('External map link failed.', error));
  }, true);
}

function bindResultHaptics(): void {
  window.addEventListener('randomseoul:draw-revealed', () => {
    void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined);
  });
}

async function bindAndroidBackButton(): Promise<void> {
  if (getRuntimePlatform() !== 'android') return;
  await App.addListener('backButton', ({ canGoBack }) => {
    const statisticsOverlay = byId<HTMLElement>('visit_statistics_overlay');
    if (statisticsOverlay && !statisticsOverlay.hidden) {
      byId<HTMLButtonElement>('close_visit_statistics')?.click();
      return;
    }

    const footprintOverlay = byId<HTMLElement>('footprint_overlay');
    if (footprintOverlay && !footprintOverlay.hidden) {
      byId<HTMLButtonElement>('close_footprint')?.click();
      return;
    }

    const visitOverlay = byId<HTMLElement>('visit_overlay');
    if (visitOverlay && !visitOverlay.hidden) {
      byId<HTMLButtonElement>('close_visit')?.click();
      return;
    }

    const overlay = byId<HTMLElement>('settings_overlay');
    if (overlay && !overlay.hidden) {
      byId<HTMLButtonElement>('close_settings')?.click();
      return;
    }

    if (canGoBack) {
      window.history.back();
      return;
    }

    void App.exitApp();
  });
}

async function initializeNativeAppEnhancements(): Promise<void> {
  if (!isNativeRuntime()) return;
  await waitForAppReady();
  updateRuntimeState();
  window.addEventListener('online', updateRuntimeState);
  window.addEventListener('offline', updateRuntimeState);
  bindNativeShare();
  bindNativeMaps();
  bindResultHaptics();
  await bindAndroidBackButton();
}

void initializeNativeAppEnhancements();
