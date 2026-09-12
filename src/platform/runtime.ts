import { Capacitor } from '@capacitor/core';

export type RuntimePlatform = 'web' | 'android' | 'ios';

export function getRuntimePlatform(): RuntimePlatform {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') return platform;
  return 'web';
}

export function isNativeRuntime(): boolean {
  return getRuntimePlatform() !== 'web';
}
