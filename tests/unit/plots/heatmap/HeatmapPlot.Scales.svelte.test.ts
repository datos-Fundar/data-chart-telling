import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { ScalesConfig } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, AGE_GROUPS, PROVINCES } from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

const DATA_PROPS = { data: EMPLOYMENT_BY_AGE_PROVINCE, x: 'ageGroup' as const, y: 'province' as const, z: 'pct' as const };

describe('HeatmapPlot – scales', () => {
  test('renders with no scale overrides (auto domain)', async () => {
    const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(countCells(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
  });

  test('an explicit X domain pins the axis ticks to that exact order', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      scales: { x: { domain: AGE_GROUPS } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
    expect(ticks).toEqual(AGE_GROUPS);
  });

  test('an explicit Y domain pins the axis ticks to that exact order', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      scales: { y: { domain: PROVINCES } } satisfies ScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
    expect(ticks).toEqual(PROVINCES);
  });

  test('reversed Y axis flips the pixel position of a given tick', async () => {
    async function yPositionOf(tick: string, reverse: boolean) {
      const { container } = await render(HeatmapPlot, {
        width: 400,
        height: 300,
        ...DATA_PROPS,
        scales: { y: { reverse } } satisfies ScalesConfig,
      });
      const svg = await waitForSvg(container);
      const label = Array.from(svg.querySelectorAll('g.axis-y text')).find((t) => t.textContent === tick);
      return label?.getAttribute('y') ?? label?.closest('[transform]')?.getAttribute('transform');
    }
    const normal = await yPositionOf(PROVINCES[0], false);
    const reversed = await yPositionOf(PROVINCES[0], true);
    expect(normal).toBeTruthy();
    expect(reversed).toBeTruthy();
    expect(normal).not.toBe(reversed);
  });

  test('axis labels render the configured title text', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      scales: { x: { label: 'Age Group' }, y: { label: 'Province' } } satisfies ScalesConfig,
      margins: { bottom: 50, left: 100 },
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelector('.axis-x-title')?.textContent).toContain('Age Group');
    expect(svg.querySelector('.axis-y-title')?.textContent).toContain('Province');
  });
});
