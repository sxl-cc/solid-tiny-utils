/** biome-ignore-all lint/suspicious/noExplicitAny: need any */
import { isServer } from "solid-js/web";

export const isSymbol = (value: any): value is symbol =>
  !!value && value.constructor === Symbol;

export const isArray = Array.isArray;

export const isObject = (value: any): value is object =>
  !!value && value.constructor === Object;

/**
 * Checks if the given value is primitive.
 *
 * Primitive Types: number , string , boolean , symbol, bigint, undefined, null
 *
 * @param {*} value value to check
 * @returns {boolean} result
 */
export const isPrimitive = (value: any): boolean =>
  value === undefined ||
  value === null ||
  (typeof value !== "object" && typeof value !== "function");

// biome-ignore lint/complexity/noBannedTypes: I need this
export const isFn = (value: any): value is Function =>
  typeof value === "function";

export const isString = (value: any): value is string =>
  typeof value === "string" || value instanceof String;

export const isInt = (value: any): value is number =>
  isNumber(value) && value % 1 === 0;

export const isFloat = (value: any): value is number =>
  isNumber(value) && value % 1 !== 0;

export const isNumber = (value: any): value is number => {
  try {
    return Number(value) === value;
  } catch {
    return false;
  }
};

export const isDate = (value: any): value is Date =>
  Object.prototype.toString.call(value) === "[object Date]";

/**
 * This is really a _best guess_ promise checking. You
 * should probably use Promise.resolve(value) to be 100%
 * sure you're handling it correctly.
 */
export const isPromise = (value: any): value is Promise<any> => {
  if (!value) {
    return false;
  }
  if (!value.then) {
    return false;
  }
  if (!isFn(value.then)) {
    return false;
  }
  return true;
};

export const isEmpty = (value: any) => {
  if (value === true || value === false) {
    return true;
  }
  if (value === null || value === undefined) {
    return true;
  }
  if (isNumber(value)) {
    return value === 0;
  }
  if (isDate(value)) {
    // biome-ignore lint/suspicious/noGlobalIsNan: is safe
    return isNaN(value.getTime());
  }
  if (isFn(value)) {
    return false;
  }
  if (isSymbol(value)) {
    return false;
  }
  const length = (value as any).length;
  if (isNumber(length)) {
    return length === 0;
  }
  const size = (value as any).size;
  if (isNumber(size)) {
    return size === 0;
  }
  const keys = Object.keys(value).length;
  return keys === 0;
};

export const isClient = !isServer;

export function isUndefined(value: any): value is undefined {
  return typeof value === "undefined";
}

export function isDefined<T>(value: T | undefined): value is T {
  return !isUndefined(value);
}
