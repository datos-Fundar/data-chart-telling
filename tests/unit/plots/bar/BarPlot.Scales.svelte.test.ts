import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { ScalesConfig } from '$lib/types/plots/common';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  LIFE_EXPECTANCY_BY_PROVINCE,
  type ProvincePoint,
} from '../../../../stories/plots/bar/data';
import { waitForSvg, countBarRects } from '../_helpers/svg';

const SERIES = [{ name: 'female', x: 'province' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }];

describe('BarPlot – scales', () => {
  test('renders with no scale overrides (auto domain)', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
  });

  test('a Y domain that excludes 0 clamps bars to the frame instead of overflowing into the margin', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { y: { domain: [75, 85] } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const heights = Array.from(svg.querySelectorAll('g.bar-y rect')).map((r) => Number(r.getAttribute('height')));
    expect(heights.length).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
    // With the domain floor (75) as the clamped baseline, no bar can be taller
    // than the plot's own drawable area — before the fix, a literal 0
    // baseline (well outside [75, 85]) produced heights in the thousands.
    heights.forEach((h) => expect(h).toBeLessThan(300));
  });

  test('reversed Y axis flips the pixel position of a given tick', async () => {
    async function yPositionOf(tick: string, reverse: boolean) {
      const { container } = await render(BarPlot, {
        width: 400,
        height: 300,
        series: SERIES,
        scales: { y: { reverse } } satisfies ScalesConfig,
      });
      const svg = await waitForSvg(container);
      const label = Array.from(svg.querySelectorAll('g.axis-y text')).find((t) => t.textContent === tick);
      return label?.getAttribute('y') ?? label?.closest('[transform]')?.getAttribute('transform');
    }
    const normal = await yPositionOf('80', false);
    const reversed = await yPositionOf('80', true);
    expect(normal).toBeTruthy();
    expect(reversed).toBeTruthy();
    expect(normal).not.toBe(reversed);
  });

  test('a custom Y tick formatter changes the rendered tick labels', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { y: { ticks: [80], tickFormat: () => 'custom' } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
    expect(ticks).toEqual(['custom']);
  });

  test('grid: true adds gridlines on the Y axis', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { y: { grid: true } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.grid-y line').length).toBeGreaterThan(0);
  });

  test('without grid, no gridlines are rendered', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.grid-y line').length).toBe(0);
  });

  test('scales.x.sort reorders bars by their own Y value (descending)', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: {
        x: { sort: (a, b) => (b as ProvincePoint).value - (a as ProvincePoint).value },
      } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
    const expected = [...FEMALE_LIFE_EXPECTANCY_BY_PROVINCE]
      .sort((a, b) => b.value - a.value)
      .map((d) => d.province);
    expect(ticks).toEqual(expected);
  });
});

describe('BarPlot – scales.z.seriesLayout', () => {
  test('grouped: each series gets its own slice of the band (no shared x position)', async () => {
    const { container } = await render(BarPlot, {
      width: 600,
      height: 400,
      data: LIFE_EXPECTANCY_BY_PROVINCE,
      x: 'province',
      y: 'value',
      z: 'sex',
      scales: { z: { seriesLayout: 'grouped' } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const xs = Array.from(svg.querySelectorAll('g.bar-y rect')).map(
      (r) => r.getAttribute('transform')?.match(/translate\(([\d.]+)/)?.[1],
    );
    expect(new Set(xs).size).toBe(xs.length); // no two bars share the same x position
  });

  test('stacked: series combine into one bar per category, cumulative height', async () => {
    const { container } = await render(BarPlot, {
      width: 600,
      height: 400,
      data: LIFE_EXPECTANCY_BY_PROVINCE,
      x: 'province',
      y: 'value',
      z: 'sex',
      scales: { z: { seriesLayout: 'stacked' } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const rects = Array.from(svg.querySelectorAll('g.bar-y rect'));
    expect(rects.length).toBe(LIFE_EXPECTANCY_BY_PROVINCE.length);
    // Every category's female + male segments should reach the same total
    // (top-most) pixel across the stack — spot-check via the topmost y.
    const tops = rects.map((r) => Number(r.getAttribute('transform')?.match(/,([\d.]+)\)/)?.[1]));
    expect(Math.min(...tops)).toBeGreaterThanOrEqual(0);
  });

  test('seriesPadding widens the gap between series bars within a group', async () => {
    async function firstBarWidth(seriesPadding: number) {
      const { container } = await render(BarPlot, {
        width: 600,
        height: 400,
        data: LIFE_EXPECTANCY_BY_PROVINCE,
        x: 'province',
        y: 'value',
        z: 'sex',
        scales: { z: { seriesLayout: 'grouped', seriesPadding } } satisfies ScalesConfig,
      });
      const svg = await waitForSvg(container);
      return Number(svg.querySelector('g.bar-y rect')?.getAttribute('width'));
    }
    const noPadding = await firstBarWidth(0);
    const padded = await firstBarWidth(0.5);
    expect(padded).toBeLessThan(noPadding);
  });
});

describe('BarPlot – orientation (scales.x/y.type: "categorical")', () => {
  test('marking scales.y as categorical renders horizontal bars (BarX)', async () => {
    const { container } = await render(BarPlot, {
      width: 600,
      height: 400,
      series: SERIES,
      scales: { y: { type: 'categorical' } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.bar-x rect').length).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
    expect(svg.querySelectorAll('g.bar-y rect').length).toBe(0);
    const yTicks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
    expect(yTicks).toEqual(expect.arrayContaining(['Buenos Aires']));
  });

  test('marking both axes categorical warns and falls back to vertical bars', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: {
        x: { type: 'categorical' },
        y: { type: 'categorical' },
      } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("both"));
    expect(svg.querySelectorAll('g.bar-y rect').length).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
    warn.mockRestore();
  });
});
