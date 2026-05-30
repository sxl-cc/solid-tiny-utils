import { createEffect, createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createStaticStore } from "~/solidjs";

describe("createStaticStore", () => {
  it("should update static keys with a partial object", () => {
    const [store, setStore] = createStaticStore({ height: 0, width: 0 });

    setStore({ width: 100 });

    expect(store.width).toBe(100);
    expect(store.height).toBe(0);
  });

  it("should update a single key with a setter value", () => {
    const [store, setStore] = createStaticStore({ count: 1 });

    setStore("count", (count) => count + 1);

    expect(store.count).toBe(2);
  });

  it("should update with a function setter", () => {
    const [store, setStore] = createStaticStore({ count: 1, name: "a" });

    setStore((prev) => ({ count: prev.count + 1 }));

    expect(store.count).toBe(2);
    expect(store.name).toBe("a");
  });

  it("should notify effects for accessed keys", () => {
    const effect = vi.fn();
    const setStore = createRoot(() => {
      const [store, write] = createStaticStore({ count: 0, name: "a" });

      createEffect(() => {
        effect(store.count);
      });

      return write;
    });

    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenLastCalledWith(0);

    setStore({ name: "b" });
    expect(effect).toHaveBeenCalledTimes(1);

    setStore({ count: 1 });
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenLastCalledWith(1);
  });
});
