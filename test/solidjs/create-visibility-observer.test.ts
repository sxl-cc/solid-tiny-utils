/** biome-ignore-all lint/suspicious/noExplicitAny: test */
import { createRoot } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVisibilityObserver } from "~/solidjs";
import {
  getAllMockedIOInstances,
  getLastMockedIOInstance,
  MockedIntersectionObserver,
} from "./mock-intersection-observer";

describe("create intersection observer", () => {
  let div!: HTMLDivElement;
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockedIntersectionObserver);
    div = document.createElement("div");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should create with element", () => {
    const previousInstanceCount = getAllMockedIOInstances().length;
    const [isVisible, dispose] = createRoot(
      (d) => [createVisibilityObserver(div), d] as const
    );
    const newInstanceCount = getAllMockedIOInstances().length;
    expect(previousInstanceCount + 1, "new instance was not created").toBe(
      newInstanceCount
    );

    expect(isVisible, "isVisible should be a accessor").toBeTypeOf("function");
    expect(isVisible(), "initial value should be false").toBe(false);

    const inst = getLastMockedIOInstance();
    const obElements = inst.elements;
    expect(obElements[0], "element was not observed").toBe(div);
    dispose();
    expect(inst.elements.length, "elements were not cleaned up").toBe(0);
  });

  it("should create without element", () => {
    const [useVisible, dispose] = createRoot(
      (d) => [createVisibilityObserver(), d] as const
    );
    const inst = getLastMockedIOInstance();
    const obElements = inst.elements;
    expect(obElements.length, "no element was observed").toBe(0);

    const isVisible = useVisible(div);
    expect(obElements[0], "element was not observed").toBe(div);
    expect(isVisible, "isVisible should be a accessor").toBeTypeOf("function");
    expect(isVisible(), "initial value should be false").toBe(false);
    dispose();
    expect(inst.elements.length, "elements were not cleaned up").toBe(0);
  });

  it("should change signal when visible", () => {
    const [useVisible] = createRoot(
      () => [createVisibilityObserver()] as const
    );
    const isVisible = useVisible(div);
    const inst = getLastMockedIOInstance();
    inst.__TEST__callback({ isIntersecting: true });
    expect(isVisible(), "isVisible should be true").toBe(true);
  });
});
