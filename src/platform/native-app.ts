import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { getRuntimePlatform, isNativeRuntime } from './runtime';

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
      // The regular Web copy path remains available if native sharing cannot run.
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

function bindResultHaptics(): void {
  const panelIds = ['line_panel', 'station_panel', 'food_panel'];
  for (const id of panelIds) {
    const panel = byId<HTMLElement>(id);
    if (!panel) continue;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        const oldClass = record.oldValue ?? '';
        if (panel.classList.contains('bounce') && !oldClass.split(/\s+/).includes('bounce')) {
          void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined);
          break;
        }
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }
}

async function bindAndroidBackButton(): Promise<void> {
  if (getRuntimePlatform() !== 'android') return;
  await App.addListener('backButton', ({ canGoBack }) => {
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
  bindResultHaptics();
  await bindAndroidBackButton();
}

void initializeNativeAppEnhancements();
