import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Segments, CellSegmentStyle } from '$lib/types/plots/styles';
import { EMPLOYMENT_BY_AGE_PROVINCE } from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

const DATA_PROPS = { data: EMPLOYMENT_BY_AGE_PROVINCE, x: 'ageGroup' as const, y: 'province' as const, z: 'pct' as const };

function styleAttrs(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.cell rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('HeatmapPlot – segments (areas, "default" key)', () => {
  test('an area segment and the catch-all each apply their own fillOpacity', async () => {
    const xFrom = '25-34';
    const xTo = '45-54';
    const yFrom = 'Buenos Aires';
    const yTo = 'Mendoza';
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        default: [
          { areas: [{ x: { from: xFrom, to: xTo }, y: { from: yFrom, to: yTo } }], style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.3 } },
        ],
      } satisfies Segments<CellSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    expect(countCells(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
    const matchedCount = EMPLOYMENT_BY_AGE_PROVINCE.filter(
      (d) => d.ageGroup >= xFrom && d.ageGroup <= xTo && d.province >= yFrom && d.province <= yTo,
    ).length;
    const styles = styleAttrs(svg);
    expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBe(matchedCount);
    expect(styles.filter((s) => s.includes('fill-opacity: 0.3')).length).toBe(
      EMPLOYMENT_BY_AGE_PROVINCE.length - matchedCount,
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
      } satisfies Segments<CellSegmentStyle>,
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
      segments: { employment_rate: [{ style: {} }] } satisfies Segments<CellSegmentStyle>,
    });
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('employment_rate'));
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
          { areas: [{ x: { from: '25-34', to: '45-54' } }], style: { fillOpacity: 0.5 } },
        ],
      } satisfies Segments<CellSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = styleAttrs(svg);
    expect(styles.length).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
    styles.forEach((s) => expect(s).toContain('fill: rgb(225, 29, 72)'));
  });
});
