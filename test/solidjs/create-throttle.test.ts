import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createThrottle } from "~/solidjs";

describe("createThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should delay function execution with static delay", async () => {
    const mockFn = vi.fn();
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    // Call the throttled function
    throttledFn("test");

    // Function should not be called immediately
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timers by less than delay
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).not.toHaveBeenCalled();

    // Advance timers to complete the delay
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should cancel previous execution if called again before delay", async () => {
    const mockFn = vi.fn();
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    // First call
    throttledFn("first");
    await vi.advanceTimersByTimeAsync(50);
    // Second call before first completes
    throttledFn("second");
    expect(mockFn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("first");
  });

  it("should work with reactive delay", async () => {
    const mockFn = vi.fn();

    const { throttledFn, setDelay } = createRoot(() => {
      const [delay, s] = createSignal(100);
      const throttled = createThrottle(mockFn, delay);
      return { throttledFn: throttled, setDelay: s };
    });

    // Call with initial delay
    throttledFn("test1");
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test1");

    // Change delay and call again
    setDelay(200);
    throttledFn("test2");

    // Should not execute with old delay
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Should execute with new delay
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith("test2");
  });

  it("should handle multiple arguments", async () => {
    const mockFn = vi.fn();
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    throttledFn("arg1", "arg2", "arg3");
    await vi.advanceTimersByTimeAsync(delay);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  it("should handle zero delay", async () => {
    const mockFn = vi.fn();
    const delay = 0;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    throttledFn("test");

    // With zero delay, should execute on next tick
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should clear timeout when component is disposed", async () => {
    const mockFn = vi.fn();
    const delay = 100;
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const dispose = createRoot((d) => {
      const throttledFn = createThrottle(mockFn, delay);
      throttledFn("test");
      return d;
    });

    // Dispose before delay completes
    await vi.advanceTimersByTimeAsync(50);
    dispose();

    // Should clear the timeout
    expect(clearTimeoutSpy).toHaveBeenCalled();

    // Function should not execute after dispose
    await vi.advanceTimersByTimeAsync(100);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("should handle rapid successive calls", async () => {
    const mockFn = vi.fn();
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    // Make multiple rapid calls
    throttledFn("call1");
    throttledFn("call2");
    throttledFn("call3");
    throttledFn("call4");
    throttledFn("call5");

    // None should execute yet
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).not.toHaveBeenCalled();

    // Only the last call should execute
    await vi.advanceTimersByTimeAsync(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("call1");
  });

  it("should allow execution after delay completes", async () => {
    const mockFn = vi.fn();
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    // First execution
    throttledFn("first");
    await vi.advanceTimersByTimeAsync(delay);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("first");

    // Second execution after delay
    throttledFn("second");
    await vi.advanceTimersByTimeAsync(delay);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith("second");
  });

  it("should preserve function context and type safety", async () => {
    const mockFn = vi.fn((a: string, b: number) => `${a}-${b}`);
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockFn, delay));

    // TypeScript should enforce correct argument types
    throttledFn("test", 42);
    await vi.advanceTimersByTimeAsync(delay);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test", 42);
  });

  it("should work with async functions", async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("result");
    const delay = 100;

    const throttledFn = createRoot(() => createThrottle(mockAsyncFn, delay));

    throttledFn("test");
    await vi.advanceTimersByTimeAsync(delay);

    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    expect(mockAsyncFn).toHaveBeenCalledWith("test");
  });
});
