import type { MaybeAccessor } from "~/types";
import { makeEventListener } from "./make-event-listener";
import { access } from "./utils";

export function createClickOutside(
  target: MaybeAccessor<HTMLElement | null | undefined>,
  handler: (event: PointerEvent) => void,
  options?: {
    ignore?: MaybeAccessor<HTMLElement | null | undefined>[];
  }
) {
  let shouldListen = false;
  const shouldIgnore = (event: PointerEvent) => {
    const ignore = (options?.ignore ? options.ignore : []).map(access);
    return ignore.some(
      (el) => el && (event.target === el || event.composedPath().includes(el))
    );
  };

  const listener = (e: PointerEvent) => {
    const el = access(target);

    if (!el || el === e.target || e.composedPath().includes(el)) {
      return;
    }

    if (e.detail === 0) {
      shouldListen = !shouldIgnore(e);
    }

    if (!shouldListen) {
      shouldListen = true;
      return;
    }
    handler(e);
  };

  const cleanups = [
    makeEventListener("click", listener, { passive: true }),
    makeEventListener(
      "pointerdown",
      (e) => {
        const el = access(target);
        if (el) {
          shouldListen = !(e.composedPath().includes(el) || shouldIgnore(e));
        }
      },
      { passive: true }
    ),
  ];

  const stop = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  return stop;
}
