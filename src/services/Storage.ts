import { StorageError } from '../utils/errors';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export class Storage {
  private readonly storage: StorageLike;

  constructor(
    private readonly key = 'library-data',
    storage?: StorageLike,
  ) {
    this.storage = storage ?? window.localStorage;
  }

  save<T>(value: T): void {
    try {
      this.storage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      throw new StorageError('Не вдалося зберегти дані бібліотеки.', error);
    }
  }

  load<T>(fallback: T): T {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      if (error instanceof SyntaxError) return fallback;
      throw new StorageError('Не вдалося прочитати дані бібліотеки.', error);
    }
  }

  remove(): void {
    this.storage.removeItem(this.key);
  }

  clear(): void {
    this.storage.clear();
  }
}
