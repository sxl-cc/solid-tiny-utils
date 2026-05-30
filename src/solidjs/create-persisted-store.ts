import { createUniqueId } from "solid-js";
import { isObject } from "~/utils";
import { createStaticStore } from "./create-static-store";
import { createWatch } from "./create-watch";

export interface PersistedStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface PersistedStoreOption {
  /**
   * Storage key used to read and write the store.
   */
  name?: string;
  /**
   * Storage adapter. Defaults to `localStorage` in the browser.
   */
  storage?: PersistedStorage;
}

const noopStorage: PersistedStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

function getDefaultStorage(): PersistedStorage {
  return typeof localStorage === "undefined" ? noopStorage : localStorage;
}

function getStore(storage: PersistedStorage, name: string): unknown {
  try {
    const val = storage.getItem(name);
    if (!val) {
      return {};
    }
    const obj = JSON.parse(val);
    return obj;
  } catch {
    return {};
  }
}

function strictAssignStore<T extends Record<string, unknown>>(
  init: T,
  obj: unknown
) {
  const store = { ...init };

  if (!isObject(obj)) {
    return store;
  }

  for (const key in store) {
    if (Object.hasOwn(obj, key) && Object.hasOwn(store, key)) {
      //@ts-expect-error should be safe
      store[key] = obj[key];
    }
  }

  return store;
}

/**
 * Creates a static store persisted as JSON.
 *
 * Only keys from `init` are restored. Invalid JSON and storage errors are
 * ignored.
 *
 * @param init Initial store value.
 * @param opts Persistence options.
 * @returns The store object and setter.
 *
 * @example
 * ```ts
 * const [settings, setSettings] = createPersistedStore(
 *   { theme: "system", sidebarOpen: true },
 *   { name: "app-settings" }
 * );
 *
 * setSettings("theme", "dark");
 * setSettings({ sidebarOpen: false });
 * ```
 */
export function createPersistedStore<T extends Record<string, unknown>>(
  init: T,
  opts?: PersistedStoreOption
) {
  const name = opts?.name ?? `persisted-${createUniqueId()}`;
  const storage: PersistedStorage = opts?.storage ?? getDefaultStorage();

  const [store, setStore] = createStaticStore(
    strictAssignStore(init, getStore(storage, name))
  );

  createWatch(
    () => JSON.stringify(store),
    (jsonData) => {
      try {
        storage.setItem(name, jsonData);
      } catch {
        return;
      }
    },
    { defer: true }
  );

  return [store, setStore] as const;
}
