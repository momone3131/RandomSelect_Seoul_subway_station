import type { StorageService } from './storage';

export class WebStorageService implements StorageService {
  constructor(private readonly storage: Storage = window.localStorage) {}

  read<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  write<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
      // Persistence failure must never break the draw flow.
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      // Ignore unavailable/private storage implementations.
    }
  }
}
