/** biome-ignore-all lint/suspicious/noExplicitAny: any */
import {
  batch,
  createSignal,
  getListener,
  type Signal,
  untrack,
} from "solid-js";
import type { SetterParam } from "~/types";
import { isFn, isObject } from "~/utils";
import { accessWith } from "./utils";

export interface StaticStoreSetter<T extends object> {
  (setter: (prev: T) => Partial<T>): T;
  (state: Partial<T>): T;
  <K extends keyof T>(key: K, state: SetterParam<T[K]>): T;
}

/**
 * Creates a shallow reactive object with a fixed set of keys.
 *
 * Only top-level properties are tracked. Keys are defined by `init` and are not
 * added or removed later.
 *
 * @param init Initial store value.
 * @returns The store object and setter.
 *
 * @example
 * ```ts
 * const [state, setState] = createStaticStore({ count: 0 });
 *
 * setState("count", (count) => count + 1);
 * setState({ count: 10 });
 * ```
 */
export function createStaticStore<T extends object>(
  init: T
): [access: T, write: StaticStoreSetter<T>] {
  const copy = { ...init },
    store = { ...init },
    cache: Partial<Record<PropertyKey, Signal<T[keyof T]>>> = {};

  const getValue = (key: keyof T): T[keyof T] => {
    let signal = cache[key];
    if (!signal) {
      if (!getListener()) {
        return copy[key];
      }
      cache[key] = signal = createSignal(copy[key], { internal: true });
      delete copy[key];
    }
    return signal[0]();
  };

  for (const key in init) {
    if (Object.hasOwn(init, key)) {
      Object.defineProperty(store, key, {
        get: () => getValue(key),
        enumerable: true,
      });
    }
  }

  const setValue = (key: keyof T, value: SetterParam<any>): void => {
    const signal = cache[key];
    if (signal) {
      signal[1](value);
    }
    if (key in copy) {
      copy[key] = accessWith(value, copy[key]);
    }
  };

  return [
    store,
    (
      a: ((prev: T) => Partial<T>) | Partial<T> | keyof T,
      b?: SetterParam<any>
    ) => {
      if (isObject(a) || isFn(a)) {
        const entries = untrack(
          () =>
            Object.entries(accessWith(a, store) as Partial<T>) as [any, any][]
        );
        batch(() => {
          for (const [key, value] of entries) {
            setValue(key, () => value);
          }
        });
      } else {
        setValue(a, b);
      }
      return store;
    },
  ];
}
