import { clamp, max } from "~/utils";

export interface RGB {
  b: number;
  g: number;
  r: number;
}

export interface OKLCH {
  c: number;
  h: number;
  l: number;
}

// Optimized constants for better precision
const PI_180 = Math.PI / 180;
const INV_PI_180 = 180 / Math.PI;

// ---------- gamma correction ----------
const linearToSRGB = (x: number) =>
  x <= 0.003_130_8 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;

const sRGBToLinear = (x: number) =>
  x <= 0.040_45 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;

/**
 * Normalizes hue to 0-360 degree range
 */
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

// ---------- OKLCH -> RGB ----------
/**
 * Converts OKLCH color to RGB color space.
 *
 * OKLCH is a perceptually uniform color space based on OKLab.
 * Input values are automatically clamped to valid ranges.
 *
 * @param oklch - The OKLCH color to convert
 * @param oklch.l - Lightness (0-1, will be clamped)
 * @param oklch.c - Chroma (≥0, will be clamped)
 * @param oklch.h - Hue in degrees (will be normalized to 0-360)
 * @returns RGB color with values 0-255
 *
 * @example
 * ```typescript
 * const rgb = oklchToRgb({ l: 0.7, c: 0.1, h: 200 });
 * // => { r: 64, g: 177, b: 183 }
 * ```
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  const { l, c, h } = oklch;

  // Clamp inputs to valid ranges
  const clampedL = clamp(l, 0, 1);
  const clampedC = max(0, c);
  const normalizedH = normalizeHue(h);

  // OKLCH → OKLab
  const a_ = clampedC * Math.cos(normalizedH * PI_180);
  const b_ = clampedC * Math.sin(normalizedH * PI_180);

  // OKLab → LMS (non-linear)
  const L = clampedL;
  const A = a_;
  const B = b_;

  const l_ = L + 0.396_337_777_4 * A + 0.215_803_757_3 * B;
  const m_ = L - 0.105_561_345_8 * A - 0.063_854_172_8 * B;
  const s_ = L - 0.089_484_177_5 * A - 1.291_485_548 * B;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  // LMS → linear sRGB
  let r = +4.076_741_662_1 * l3 - 3.307_711_591_3 * m3 + 0.230_969_929_2 * s3;
  let g = -1.268_438_004_6 * l3 + 2.609_757_401_1 * m3 - 0.341_319_396_5 * s3;
  let b = -0.004_196_086_3 * l3 - 0.703_418_614_7 * m3 + 1.707_614_701 * s3;

  // linear → gamma-corrected
  r = linearToSRGB(r);
  g = linearToSRGB(g);
  b = linearToSRGB(b);

  return {
    r: Math.round(clamp(r) * 255),
    g: Math.round(clamp(g) * 255),
    b: Math.round(clamp(b) * 255),
  };
}

// ---------- RGB -> OKLCH ----------
/**
 * Converts RGB color to OKLCH color space.
 *
 * RGB values are automatically clamped to 0-255 range.
 *
 * @param rgb - The RGB color to convert
 * @param rgb.r - Red component (0-255, will be clamped)
 * @param rgb.g - Green component (0-255, will be clamped)
 * @param rgb.b - Blue component (0-255, will be clamped)
 * @returns OKLCH color with l∈[0,1], c≥0, h∈[0,360)
 *
 * @example
 * ```typescript
 * const oklch = rgbToOklch({ r: 64, g: 177, b: 183 });
 * // => { l: 0.7, c: 0.1, h: 200 }
 * ```
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  // Clamp RGB values to valid range
  const r = clamp(rgb.r, 0, 255);
  const g = clamp(rgb.g, 0, 255);
  const b = clamp(rgb.b, 0, 255);

  // gamma → linear
  const rLinear = sRGBToLinear(r / 255);
  const gLinear = sRGBToLinear(g / 255);
  const bLinear = sRGBToLinear(b / 255);

  // linear → LMS cube root space
  const l_ = Math.cbrt(
    0.412_221_470_8 * rLinear +
      0.536_332_536_3 * gLinear +
      0.051_445_992_9 * bLinear
  );
  const m_ = Math.cbrt(
    0.211_903_498_2 * rLinear +
      0.680_699_545_1 * gLinear +
      0.107_396_956_6 * bLinear
  );
  const s_ = Math.cbrt(
    0.088_302_461_9 * rLinear +
      0.281_718_837_6 * gLinear +
      0.629_978_700_5 * bLinear
  );

  // LMS → OKLab
  const L = 0.210_454_255_3 * l_ + 0.793_617_785 * m_ - 0.004_072_046_8 * s_;
  const A = 1.977_998_495_1 * l_ - 2.428_592_205 * m_ + 0.450_593_709_9 * s_;
  const B = 0.025_904_037_1 * l_ + 0.782_771_766_2 * m_ - 0.808_675_766 * s_;

  // OKLab → OKLCH
  const c = Math.sqrt(A * A + B * B);
  let h = Math.atan2(B, A) * INV_PI_180;
  if (h < 0) {
    h += 360;
  }

  return { l: L, c, h };
}
