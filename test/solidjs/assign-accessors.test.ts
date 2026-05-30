import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { assignAccessors } from "~/solidjs";

describe("assignAccessors", () => {
  it("should assign accessor values as getters", () => {
    createRoot((dispose) => {
      const [count, setCount] = createSignal(1);
      const store = assignAccessors(
        { name: "solid" },
        {
          count,
          doubled: createMemo(() => count() * 2),
        }
      );

      expect(store.name).toBe("solid");
      expect(store.count).toBe(1);
      expect(store.doubled).toBe(2);

      setCount(2);

      expect(store.count).toBe(2);
      expect(store.doubled).toBe(4);
      dispose();
    });
  });

  it("should keep assigned accessors trackable", () => {
    const effect = vi.fn();
    const setCount = createRoot(() => {
      const [count, set] = createSignal(1);
      const store = assignAccessors(
        {},
        {
          doubled: createMemo(() => count() * 2),
        }
      );

      createEffect(() => {
        effect(store.doubled);
      });

      return set;
    });

    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenLastCalledWith(2);

    setCount(2);

    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenLastCalledWith(4);
  });
});
