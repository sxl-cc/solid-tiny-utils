/**
 * Async wait
 */
export const sleep = (milliseconds: number) =>
  new Promise((res) => setTimeout(res, milliseconds));

export const runAtNextAnimationFrame = (cb: () => void) =>
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cb();
    });
  });
