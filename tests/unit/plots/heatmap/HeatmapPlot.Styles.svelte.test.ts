import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { PlotStyles } from '$lib/types/plots/styles';
import { EMPLOYMENT_BY_AGE_PROVINCE } from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells, countTextLabels } from '../_helpers/svg';

const DATA_PROPS = { data: EMPLOYMENT_BY_AGE_PROVINCE, x: 'ageGroup' as const, y: 'province' as const, z: 'pct' as const };

function cellFills(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.cell rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('HeatmapPlot – styles.values', () => {
  test('value labels render by default, one per cell, showing the raw value', async () => {
    const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    expect(labels).toEqual(
      expect.arrayContaining(EMPLOYMENT_BY_AGE_PROVINCE.map((d) => String(d.pct))),
    );
  });

  test('values.show: false hides the value labels', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      styles: { values: { show: false } } satisfies PlotStyles,
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(0);
    expect(countCells(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
  });

  test('a custom format callback overrides the default label text', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } } satisfies PlotStyles,
    });
    const svg = await waitForSvg(container);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    expect(labels).toEqual(
      expect.arrayContaining(EMPLOYMENT_BY_AGE_PROVINCE.map((d) => `${(d.pct * 100).toFixed(0)}%`)),
    );
  });
});

describe('HeatmapPlot – styles.colors', () => {
  test('a custom color ramp changes the rendered cell fill colors', async () => {
    const defaultRender = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
    const defaultSvg = await waitForSvg(defaultRender.container);
    const defaultFills = cellFills(defaultSvg);

    const customRender = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      styles: { colors: { min: '#ff6b6b', max: '#51cf66' } } satisfies PlotStyles,
    });
    const customSvg = await waitForSvg(customRender.container);
    const customFills = cellFills(customSvg);

    expect(defaultFills.length).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
    expect(customFills.length).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
    expect(customFills).not.toEqual(defaultFills);
  });
});
