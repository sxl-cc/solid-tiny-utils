/** biome-ignore-all lint/suspicious/noExplicitAny: any */
import type { JSX } from "solid-js";
import type { AnyFn } from "~/types";
import type { MaybeAccessor } from "~/types/maybe";
import { isArray, isFn } from "~/utils";

export function access<T>(value: MaybeAccessor<T>): T {
  return isFn(value) ? value() : value;
}

/** If value is a function – call it with a given arguments – otherwise get the value as is */
export function accessWith<T>(
  valueOrFn: T,
  ...args: T extends AnyFn ? Parameters<T> : never
): T extends AnyFn ? ReturnType<T> : T {
  return isFn(valueOrFn) ? valueOrFn(...args) : (valueOrFn as any);
}

export function runSolidEventHandler<
  T,
  E extends Event,
  EHandler extends JSX.EventHandler<T, any> = JSX.EventHandler<T, E>,
>(event: E, handler?: EHandler | JSX.BoundEventHandler<T, E, EHandler>) {
  if (isFn(handler)) {
    handler(event);
    return;
  }

  if (isArray(handler)) {
    const h = handler[0] as any;
    const data = handler[1] as any;
    h(data, event);
  }
}

export type MaybeCallableChild<T extends unknown[] = []> =
  | JSX.Element
  | ((...args: T) => JSX.Element);
export function callMaybeCallableChild<T extends unknown[] = []>(
  children: MaybeCallableChild<T>,
  ...args: T
) {
  return isFn(children) ? children(...args) : children;
}
