/** biome-ignore-all lint/suspicious/noExplicitAny: mocked */
const intersectionObserverInstances: MockedIntersectionObserver[] = [];

export const getAllMockedIOInstances = () => intersectionObserverInstances;

export const getLastMockedIOInstance = () =>
  intersectionObserverInstances[
    intersectionObserverInstances.length - 1
  ] as MockedIntersectionObserver;

const createMockIOEntry = ({
  target,
  isIntersecting = Math.random() > 0.5,
  boundingClientRect = target.getBoundingClientRect(),
}: {
  target: Element;
  isIntersecting?: boolean;
  boundingClientRect?: DOMRectReadOnly;
}): IntersectionObserverEntry => ({
  target,
  time: Date.now(),
  rootBounds: {} as any,
  isIntersecting,
  intersectionRect: {} as any,
  intersectionRatio: Math.random(),
  boundingClientRect,
});

export class MockedIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;
  elements: HTMLElement[] = [];
  readonly root = document;
  readonly rootMargin = "0";
  readonly scrollMargin = "0";
  readonly thresholds = [0];
  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.options = options;
    intersectionObserverInstances.push(this);
  }
  disconnect() {
    this.elements = [];
  }
  observe(el: HTMLElement) {
    this.elements.push(el);
  }
  unobserve(el: HTMLElement) {
    let index = this.elements.indexOf(el);
    while (index !== -1) {
      this.elements.splice(index, 1);
      index = this.elements.indexOf(el);
    }
  }
  takeRecords() {
    return this.elements.map((el) => createMockIOEntry({ target: el }));
  }
  // simulates intersection change and calls callback
  __TEST__callback(
    entry: {
      isIntersecting?: boolean;
      boundingClientRect?: DOMRectReadOnly;
    } = {}
  ) {
    const entries = this.elements.map((el) =>
      createMockIOEntry({ target: el, ...entry })
    );
    this.callback(entries, this);
  }
}
