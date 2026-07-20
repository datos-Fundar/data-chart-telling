import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

const DATA_PROPS = { data: LIFE_EXPECTANCY_BY_PROVINCE_SEX, x: 'province' as const, y: 'sex' as const, z: 'value' as const };

function styleAttrs(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.cell rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('HeatmapPlot – segments (areas, "default" key)', () => {
  test('an area segment and the catch-all each apply their own fillOpacity', async () => {
    const xFrom = 'Buenos Aires';
    const xTo = 'Formosa';
    const yFrom = 'Female';
    const yTo = 'Female';
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        default: [
          { areas: [{ x: { from: xFrom, to: xTo }, y: { from: yFrom, to: yTo } }], style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.3 } },
        ],
      } satisfies SegmentsConfig<CellSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
    const matchedCount = LIFE_EXPECTANCY_BY_PROVINCE_SEX.filter(
      (d) => d.province >= xFrom && d.province <= xTo && d.sex >= yFrom && d.sex <= yTo,
    ).length;
    const styles = styleAttrs(svg);
    expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBe(matchedCount);
    expect(styles.filter((s) => s.includes('fill-opacity: 0.3')).length).toBe(
      LIFE_EXPECTANCY_BY_PROVINCE_SEX.length - matchedCount,
    );
  });

  test('warns when the "default" key has more than one catch-all segment', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        default: [{ style: {} }, { style: {} }], // two catch-alls → ambiguous
      } satisfies SegmentsConfig<CellSegmentStyle>,
    });
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
    }, { timeout: 1000 });
    warn.mockRestore();
  });

  test('warns when segments use a series-specific key instead of "default"', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: { life_expectancy: [{ style: {} }] } satisfies SegmentsConfig<CellSegmentStyle>,
    });
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('life_expectancy'));
    }, { timeout: 1000 });
    warn.mockRestore();
  });
});

describe('HeatmapPlot – segments (catch-all + area merging)', () => {
  test('an area segment inherits fill color from the catch-all', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        default: [
          { style: { fill: '#e11d48' } },
          { areas: [{ x: { from: 'Buenos Aires', to: 'Formosa' } }], style: { fillOpacity: 0.5 } },
        ],
      } satisfies SegmentsConfig<CellSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = styleAttrs(svg);
    expect(styles.length).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
    styles.forEach((s) => expect(s).toContain('fill: rgb(225, 29, 72)'));
  });
});
