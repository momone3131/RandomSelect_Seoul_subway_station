import { toBlob } from 'html-to-image';

export interface VisitStatisticsImageSaveResult {
  fileName: string;
  target: 'download' | 'native-gallery';
  uri?: string;
}

interface RandomSeoulPlatformPlugin {
  saveImage(options: {
    base64: string;
    fileName: string;
    mimeType: 'image/png';
  }): Promise<{ uri?: string; fileName?: string }>;
}

type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    Plugins?: {
      RandomSeoulPlatform?: RandomSeoulPlatformPlugin;
    };
  };
};

function exportFileName(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `random-seoul-visit-statistics-${year}-${month}-${day}.png`;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

function nativePlatformPlugin(): RandomSeoulPlatformPlugin | undefined {
  const capacitor = (window as CapacitorWindow).Capacitor;
  if (!capacitor?.isNativePlatform?.()) return undefined;
  return capacitor.Plugins?.RandomSeoulPlatform;
}

async function blobBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('통계 이미지 데이터를 읽지 못했어요.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('통계 이미지 데이터 형식이 올바르지 않아요.');
  return dataUrl.slice(comma + 1);
}

export interface PreparedVisitStatisticsExport {
  host: HTMLElement;
  clone: HTMLElement;
  cleanup(): void;
}

export function prepareVisitStatisticsExport(dialog: HTMLElement): PreparedVisitStatisticsExport {
  const bounds = dialog.getBoundingClientRect();
  if (bounds.width <= 0) throw new Error('방문 통계 화면 크기를 확인하지 못했어요.');

  const exportWidth = 720;
  const host = document.createElement('div');
  host.className = 'visit-statistics-export-host';
  host.dataset.statisticsExportHost = 'true';
  host.style.width = `${exportWidth}px`;

  const clone = dialog.cloneNode(true) as HTMLElement;
  clone.classList.add('visit-statistics-export', 'visit-statistics-export-compact');
  clone.dataset.statisticsExportClone = 'true';
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('role');
  clone.removeAttribute('aria-modal');
  clone.removeAttribute('aria-labelledby');
  clone.tabIndex = -1;
  clone.style.width = `${exportWidth}px`;
  const rules = clone.querySelector<HTMLDetailsElement>('.visit-statistics-rules');
  if (rules) rules.open = false;

  host.appendChild(clone);
  document.body.appendChild(host);

  return {
    host,
    clone,
    cleanup: () => host.remove(),
  };
}

export async function renderVisitStatisticsImage(dialog: HTMLElement): Promise<Blob> {
  const prepared = prepareVisitStatisticsExport(dialog);
  try {
    await document.fonts?.ready;
    await nextFrame();
    await nextFrame();

    const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const blob = await toBlob(prepared.clone, {
      backgroundColor: '#fffdfa',
      cacheBust: true,
      pixelRatio,
    });
    if (!blob) throw new Error('방문 통계 이미지를 만들지 못했어요.');
    return blob;
  } finally {
    prepared.cleanup();
  }
}

export async function saveVisitStatisticsImage(blob: Blob): Promise<VisitStatisticsImageSaveResult> {
  const fileName = exportFileName();
  const native = nativePlatformPlugin();

  if (native?.saveImage) {
    const result = await native.saveImage({
      base64: await blobBase64(blob),
      fileName,
      mimeType: 'image/png',
    });
    return {
      fileName: result.fileName || fileName,
      target: 'native-gallery',
      uri: result.uri,
    };
  }

  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
  return { fileName, target: 'download' };
}
