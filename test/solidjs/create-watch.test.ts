import { createMemo, createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, it, vi } from "vitest";
import { createWatch } from "~/solidjs";

describe("createWatch", () => {
  it("should watch a single signal and execute callback on changes", () => {
    const callback = vi.fn(() => "return");

    const setCount = createRoot(() => {
      const [count, s] = createSignal(0);
      createWatch(count, callback);

      return s;
    });

    // Should be called immediately with initial value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(0, undefined, undefined);

    setCount(1);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(1, 0, "return");

    setCount(2);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith(2, 1, "return");
  });

  it("should work with defer option set to false", () => {
    const callback = vi.fn();

    const setCount = createRoot(() => {
      const [count, s] = createSignal(0);

      createWatch(count, callback, { defer: false });
      return s;
    });
    // Should be called immediately when defer is false
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(0, undefined, undefined);

    setCount(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("should work with defer option set to true", () => {
    const callback = vi.fn();

    const setCount = createRoot(() => {
      const [count, s] = createSignal(0);

      createWatch(count, callback, { defer: true });
      return s;
    });
    // Should be called immediately when defer is false
    expect(callback).toHaveBeenCalledTimes(0);

    setCount(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(1, undefined, undefined);
  });

  it("should work with memo dependencies", () => {
    const callback = vi.fn((v) => v + 1);

    const setCount = createRoot(() => {
      const [count, s] = createSignal(1);
      const doubled = createMemo(() => count() * 2);

      createWatch(doubled, callback);

      return s;
    });

    // Should be called immediately with computed value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(2, undefined, undefined);

    setCount(2);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(4, 2, 3);
  });

  it("should handle complex object changes", () => {
    const callback = vi.fn((v) => v.age);

    const setUser = createRoot(() => {
      const [user, s] = createStore({ name: "John", age: 30 });

      createWatch(() => ({ ...user }), callback);

      return s;
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(
      { name: "John", age: 30 },
      undefined,
      undefined
    );

    setUser({ name: "Jane", age: 25 });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(
      { name: "Jane", age: 25 },
      { name: "John", age: 30 },
      30
    );
  });

  it("should stop watching when disposed", () => {
    const callback = vi.fn();

    const [dispose, setCount] = createRoot((d) => {
      const [count, s] = createSignal(0);

      createWatch(count, callback);

      return [d, s] as const;
    });

    expect(callback).toHaveBeenCalledTimes(1);

    setCount(1);
    expect(callback).toHaveBeenCalledTimes(2);

    dispose();

    // After disposal, changes should not trigger the callback
    setCount(2);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
