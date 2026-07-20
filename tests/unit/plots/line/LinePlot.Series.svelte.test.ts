import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { LIFE_EXPECTANCY, FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../../../stories/plots/line/data';
import { waitForSvg, countLinePaths } from '../_helpers/svg';

// ── Explicit series[] ─────────────────────────────────────────────────────────

describe('LinePlot – series prop', () => {
  test('renders an SVG', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }] satisfies Series<
        (typeof FEMALE_LIFE_EXPECTANCY)[number]
      >[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one path for a single series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(1);
  });

  test('renders one path per series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [
        { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
        { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
      ],
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('does not crash with an empty series array', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});

// ── data / x / y / z grouping ───────────────────────────────────────────────

describe('LinePlot – grouped data (data/x/y/z)', () => {
  test('creates one series per unique z value', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      data: LIFE_EXPECTANCY,
      x: 'year',
      y: 'value',
      z: 'sex',
    });
    const svg = await waitForSvg(container);
    // LIFE_EXPECTANCY has exactly two sexes (male/female) → two lines.
    expect(countLinePaths(svg)).toBe(2);
  });
});
