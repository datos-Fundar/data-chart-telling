import { describe, test, expect } from 'vitest';
import { resolveRadiusPaddedDomain } from '$lib/plots/scatter/resolveRadiusPaddedDomain';

describe('resolveRadiusPaddedDomain', () => {
  test('pads both ends of the domain proportional to the pixel radius', () => {
    // domain [0, 100] over 200px → 0.5 data units per pixel; a 10px radius pads by 5 units.
    const [min, max] = resolveRadiusPaddedDomain([0, 50, 100], 10, 200)!;
    expect(min).toBeCloseTo(-5);
    expect(max).toBeCloseTo(105);
  });

  test('a larger radius pads more', () => {
    const [minSmall, maxSmall] = resolveRadiusPaddedDomain([0, 100], 5, 200)!;
    const [minLarge, maxLarge] = resolveRadiusPaddedDomain([0, 100], 20, 200)!;
    expect(minLarge).toBeLessThan(minSmall);
    expect(maxLarge).toBeGreaterThan(maxSmall);
  });

  test('a narrower inner pixel size pads more, for the same radius', () => {
    const [minWide] = resolveRadiusPaddedDomain([0, 100], 10, 400)!;
    const [minNarrow] = resolveRadiusPaddedDomain([0, 100], 10, 100)!;
    expect(minNarrow).toBeLessThan(minWide);
  });

  test('returns undefined for an empty values array', () => {
    expect(resolveRadiusPaddedDomain([], 10, 200)).toBeUndefined();
  });

  test('returns undefined when the radius is zero or negative', () => {
    expect(resolveRadiusPaddedDomain([0, 100], 0, 200)).toBeUndefined();
  });

  test('returns undefined when the inner size is zero or negative', () => {
    expect(resolveRadiusPaddedDomain([0, 100], 10, 0)).toBeUndefined();
  });

  test('ignores non-finite values (NaN from a bad accessor) when computing the extent', () => {
    const withNaN = resolveRadiusPaddedDomain([0, NaN, 100], 10, 200)!;
    const withoutNaN = resolveRadiusPaddedDomain([0, 100], 10, 200)!;
    expect(withNaN).toEqual(withoutNaN);
  });

  test('a degenerate single-value domain pads by a fixed unit instead of dividing by zero', () => {
    const [min, max] = resolveRadiusPaddedDomain([42, 42, 42], 10, 200)!;
    expect(min).toBe(41);
    expect(max).toBe(43);
  });
});
