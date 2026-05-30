import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPersistedStore, type PersistedStorage } from "~/solidjs";

function createMemoryStorage(data: Record<string, string> = {}) {
  const storage: PersistedStorage = {
    getItem: vi.fn((key) => data[key] ?? null),
    removeItem: vi.fn((key) => {
      delete data[key];
    }),
    setItem: vi.fn((key, value) => {
      data[key] = value;
    }),
  };

  return { data, storage };
}

describe("createPersistedStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should hydrate matching keys from storage", () => {
    const { storage } = createMemoryStorage({
      user: JSON.stringify({ count: 2, extra: true }),
    });

    const [store] = createRoot(() =>
      createPersistedStore({ count: 0, name: "a" }, { name: "user", storage })
    );

    expect(store.count).toBe(2);
    expect(store.name).toBe("a");
    expect("extra" in store).toBe(false);
  });

  it("should not mutate the init object when hydrating", () => {
    const { storage } = createMemoryStorage({
      user: JSON.stringify({ count: 2 }),
    });
    const init = { count: 0 };

    createRoot(() => createPersistedStore(init, { name: "user", storage }));

    expect(init.count).toBe(0);
  });

  it("should persist updates to storage", () => {
    const { data, storage } = createMemoryStorage();
    const [, setStore] = createRoot(() =>
      createPersistedStore({ count: 0, name: "a" }, { name: "user", storage })
    );

    setStore({ count: 1 });

    expect(data.user).toBe(JSON.stringify({ count: 1, name: "a" }));
  });

  it("should ignore invalid storage values", () => {
    const { storage } = createMemoryStorage({ user: "{" });

    const [store] = createRoot(() =>
      createPersistedStore({ count: 0 }, { name: "user", storage })
    );

    expect(store.count).toBe(0);
  });

  it("should not throw without localStorage", () => {
    vi.stubGlobal("localStorage", undefined);

    expect(() => {
      createRoot(() => createPersistedStore({ count: 0 }));
    }).not.toThrow();
  });

  it("should ignore storage write errors", () => {
    const storage: PersistedStorage = {
      getItem: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    const [, setStore] = createRoot(() =>
      createPersistedStore({ count: 0 }, { name: "user", storage })
    );

    expect(() => setStore({ count: 1 })).not.toThrow();
  });
});
