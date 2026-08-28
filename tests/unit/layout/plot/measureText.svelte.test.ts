import { describe, test, expect } from 'vitest';
import { measureTextWidth, measureMaxLabelWidth } from '$lib/layout/plot/measureText';

describe('measureTextWidth', () => {
  test('a longer string measures wider than a shorter one in the same font', () => {
    const short = measureTextWidth('A', '14px sans-serif');
    const long = measureTextWidth('A very long label indeed', '14px sans-serif');
    expect(long).toBeGreaterThan(short);
  });

  test('a larger font size measures the same text wider', () => {
    const small = measureTextWidth('Buenos Aires', '10px sans-serif');
    const large = measureTextWidth('Buenos Aires', '30px sans-serif');
    expect(large).toBeGreaterThan(small);
  });

  test('an empty string measures 0', () => {
    expect(measureTextWidth('', '14px sans-serif')).toBe(0);
  });
});

describe('measureMaxLabelWidth', () => {
  test('returns the widest of several labels', () => {
    const labels = ['SL', 'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'La Rioja'];
    const max = measureMaxLabelWidth(labels, '14px sans-serif');
    const widest = measureTextWidth('Ciudad Autónoma de Buenos Aires', '14px sans-serif');
    expect(max).toBe(widest);
  });

  test('an empty list measures 0', () => {
    expect(measureMaxLabelWidth([], '14px sans-serif')).toBe(0);
  });
});
