import { describe, expect, it } from "vitest";
import {
  isArray,
  isClient,
  isDate,
  isEmpty,
  isFloat,
  isFn,
  isInt,
  isNumber,
  isObject,
  isPrimitive,
  isPromise,
  isString,
  isSymbol,
} from "~/utils";

describe("Type checking utilities", () => {
  describe("isSymbol", () => {
    it("should identify symbols", () => {
      expect(isSymbol(Symbol("test"))).toBe(true);
      expect(isSymbol("test")).toBe(false);
      expect(isSymbol(null)).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should identify arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray("test")).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should identify plain objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: "value" })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject("test")).toBe(false);
    });
  });

  describe("isPrimitive", () => {
    it("should identify primitive values", () => {
      expect(isPrimitive(42)).toBe(true);
      expect(isPrimitive("string")).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      expect(isPrimitive(Symbol("test"))).toBe(true);
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
      const testFn = () => {
        // Test function
      };
      expect(isPrimitive(testFn)).toBe(false);
    });
  });

  describe("isFn", () => {
    it("should identify functions", () => {
      const testFn1 = () => "test";
      const testFn2 = function test() {
        return "test";
      };
      expect(isFn(testFn1)).toBe(true);
      expect(isFn(testFn2)).toBe(true);
      expect(isFn("test")).toBe(false);
      expect(isFn({})).toBe(false);
    });
  });

  describe("isString", () => {
    it("should identify strings", () => {
      expect(isString("test")).toBe(true);
      expect(isString(String("test"))).toBe(true);
      expect(isString(42)).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });

  describe("isInt", () => {
    it("should identify integers", () => {
      expect(isInt(42)).toBe(true);
      expect(isInt(0)).toBe(true);
      expect(isInt(-5)).toBe(true);
      expect(isInt(3.14)).toBe(false);
      expect(isInt("42")).toBe(false);
    });
  });

  describe("isFloat", () => {
    it("should identify floating point numbers", () => {
      expect(isFloat(3.14)).toBe(true);
      expect(isFloat(-2.5)).toBe(true);
      expect(isFloat(42)).toBe(false);
      expect(isFloat("3.14")).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("should identify numbers", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(-5)).toBe(true);
      expect(isNumber("42")).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe("isDate", () => {
    it("should identify Date objects", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date("2023-01-01"))).toBe(true);
      expect(isDate("2023-01-01")).toBe(false);
      expect(isDate(1_640_995_200_000)).toBe(false);
    });
  });

  describe("isPromise", () => {
    it("should identify promises", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      const testPromise = new Promise(() => {
        // Test promise
      });
      expect(isPromise(testPromise)).toBe(true);
      // Test thenable objects
      const thenMethod = () => "test";
      const thenKey = "then";
      const thenLike = {
        [thenKey]: thenMethod,
      };
      expect(isPromise(thenLike)).toBe(true);
      expect(isPromise({})).toBe(false);
      expect(isPromise(null)).toBe(false);
    });
  });

  describe("isEmpty", () => {
    it("should identify empty values", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(true)).toBe(true);
      expect(isEmpty(false)).toBe(true);
      expect(isEmpty(new Date("invalid"))).toBe(true);

      expect(isEmpty(42)).toBe(false);
      expect(isEmpty("test")).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ key: "value" })).toBe(false);
      const testFn = () => "test";
      expect(isEmpty(testFn)).toBe(false);
      expect(isEmpty(Symbol("test"))).toBe(false);
    });
  });

  describe("isClient", () => {
    it("should identify client environment", () => {
      // In test environment, this should be true (not server-side)
      expect(typeof isClient).toBe("boolean");
      expect(isClient).toBe(true);
    });
  });
});
