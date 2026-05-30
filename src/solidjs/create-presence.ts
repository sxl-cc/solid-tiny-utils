import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import type { MaybeAccessor } from "~/types";
import { isDefined, noop } from "~/utils";
import { createWatch } from "./create-watch";
import { access } from "./utils";

export interface MakePresenceOptions {
  enterDuration: MaybeAccessor<number>;
  exitDuration: MaybeAccessor<number>;
  initialEnter?: boolean;
}

export type PresencePhase = "idle" | "entering" | "entered" | "exiting";

function makeTimeout(ms: number, fn: () => void) {
  if (ms <= 0) {
    fn();
    return noop;
  }

  const timeoutId = setTimeout(() => {
    fn();
  }, ms);

  return () => clearTimeout(timeoutId);
}

const itemShouldBeMounted = <TItem>(item: TItem) =>
  item !== false && item != null;

function getInitialPhase<TItem>(
  item: TItem | undefined,
  initialEnter?: boolean
): PresencePhase {
  if (!itemShouldBeMounted(item)) {
    return "idle";
  }

  if (initialEnter) {
    return "entering";
  }

  return "entered";
}

/**
 * Keeps an item mounted while its enter and exit animations run.
 */
export function createPresence<TItem>(
  item: Accessor<TItem | undefined>,
  options: MakePresenceOptions
) {
  const initial = untrack(item);
  const [mountedItem, setMountedItem] = createSignal(initial);
  const [phase, setPhase] = createSignal<PresencePhase>(
    getInitialPhase(initial, options.initialEnter)
  );

  const isMounted = createMemo(() => phase() !== "idle");
  const isEntering = createMemo(() => phase() === "entering");
  const isExiting = createMemo(() => phase() === "exiting");
  const isAnimating = createMemo(() => isEntering() || isExiting());

  let clear = noop;
  onCleanup(clear);

  createWatch(phase, (currentPhase) => {
    clear();

    if (currentPhase === "entering") {
      clear = makeTimeout(access(options.enterDuration), () =>
        setPhase("entered")
      );
    }

    if (currentPhase === "exiting") {
      clear = makeTimeout(access(options.exitDuration), () => setPhase("idle"));
    }
  });

  createEffect(() => {
    const currentItem = item();

    if (mountedItem() !== currentItem) {
      if (isMounted()) {
        setPhase("exiting");
      } else if (itemShouldBeMounted(currentItem)) {
        setMountedItem(() => currentItem);
        setPhase("entering");
      }
      return;
    }

    if (itemShouldBeMounted(currentItem)) {
      if (!isMounted()) {
        setPhase("entering");
      }
      return;
    }

    if (isMounted()) {
      setPhase("exiting");
    }
  });

  return {
    isMounted: () => isMounted() && isDefined(mountedItem()),
    isAnimating,
    isEntering,
    isExiting,
    mountedItem,
    phase,
  };
}
