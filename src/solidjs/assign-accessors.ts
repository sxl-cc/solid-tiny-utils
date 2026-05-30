import type { Accessor } from "solid-js";

type AccessorRecord = Record<PropertyKey, Accessor<unknown>>;

type AccessorValues<T extends AccessorRecord> = {
  readonly [K in keyof T]: ReturnType<T[K]>;
};

/**
 * Assigns accessor-backed getters to an object.
 *
 * `append` keys must not already exist on `base`.
 */
export function assignAccessors<
  Base extends object,
  Append extends AccessorRecord,
>(
  base: Base,
  append: Append & { [K in keyof Base]?: never }
): Readonly<Base & AccessorValues<Append>> {
  for (const key in append) {
    if (Object.hasOwn(append, key) && !Object.hasOwn(base, key)) {
      Object.defineProperty(base, key, {
        enumerable: true,
        get: append[key],
      });
    }
  }

  return base as Readonly<Base & AccessorValues<Append>>;
}
