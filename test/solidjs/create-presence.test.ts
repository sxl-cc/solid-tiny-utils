import { createRoot, createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPresence } from "~/solidjs";

describe("createPresence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes closed when show is false", () => {
    createRoot((dispose) => {
      const [show] = createSignal(false);

      const p = createPresence(show, {
        enterDuration: 300,
        exitDuration: 500,
      });

      expect(p.isMounted()).toBe(false);
      expect(p.isAnimating()).toBe(false);
      expect(p.isExiting()).toBe(false);
      expect(p.isEntering()).toBe(false);
      expect(p.phase()).toBe("idle");
      dispose();
    });
  });

  it("initializes open when show is true", () => {
    createRoot((dispose) => {
      const [show] = createSignal(true);
      const p = createPresence(show, {
        enterDuration: 300,
        exitDuration: 500,
      });
      expect(p.isMounted()).toBe(true);
      expect(p.isAnimating()).toBe(false);
      expect(p.isExiting()).toBe(false);
      expect(p.isEntering()).toBe(false);
      expect(p.phase()).toBe("entered");
      dispose();
    });
  });

  it("initializes open when show is true with initial open", () => {
    createRoot((dispose) => {
      const [show] = createSignal(true);
      const p = createPresence(show, {
        enterDuration: 300,
        exitDuration: 500,
        initialEnter: true,
      });

      expect(p.isMounted()).toBe(true);
      expect(p.isAnimating()).toBe(true);
      expect(p.isExiting()).toBe(false);
      expect(p.isEntering()).toBe(true);
      expect(p.phase()).toBe("entering");
      dispose();
    });
  });

  it("enters when show changes from false to true", async () => {
    await createRoot(async (dispose) => {
      const [show, setShow] = createSignal(false);
      const p = createPresence(show, {
        enterDuration: 100,
        exitDuration: 100,
      });
      expect(p.isMounted()).toBe(false);
      setShow(true);
      await vi.advanceTimersByTimeAsync(50);
      expect(p.isMounted()).toBe(true);
      expect(p.isAnimating()).toBe(true);
      expect(p.isEntering()).toBe(true);
      expect(p.phase()).toBe("entering");
      await vi.advanceTimersByTimeAsync(500);
      expect(p.isMounted()).toBe(true);
      expect(p.isAnimating()).toBe(false);
      expect(p.isEntering()).toBe(false);
      expect(p.phase()).toBe("entered");

      dispose();
    });
  });

  it("exits before unmounting when show changes from true to false", async () => {
    await createRoot(async (dispose) => {
      const [show, setShow] = createSignal(true);
      const p = createPresence(show, {
        enterDuration: 100,
        exitDuration: 100,
      });

      setShow(false);
      await vi.advanceTimersByTimeAsync(0);

      expect(p.isMounted()).toBe(true);
      expect(p.isAnimating()).toBe(true);
      expect(p.isExiting()).toBe(true);
      expect(p.phase()).toBe("exiting");

      await vi.advanceTimersByTimeAsync(100);

      expect(p.isMounted()).toBe(false);
      expect(p.isAnimating()).toBe(false);
      expect(p.isExiting()).toBe(false);
      expect(p.phase()).toBe("idle");

      dispose();
    });
  });
});
