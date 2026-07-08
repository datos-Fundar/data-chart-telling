import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, type AgeProvinceCell } from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

describe('HeatmapPlot – series prop', () => {
  test('renders an SVG', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      series: [
        { name: 'employment_rate', x: 'ageGroup', y: 'province', z: 'pct', data: EMPLOYMENT_BY_AGE_PROVINCE } satisfies Series<AgeProvinceCell>,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one cell per data row', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      series: [
        { name: 'employment_rate', x: 'ageGroup', y: 'province', z: 'pct', data: EMPLOYMENT_BY_AGE_PROVINCE } satisfies Series<AgeProvinceCell>,
      ],
    });
    const svg = await waitForSvg(container);
    expect(countCells(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
  });

  test('does not crash with an empty data array', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      data: [] as AgeProvinceCell[],
      x: 'ageGroup',
      y: 'province',
      z: 'pct',
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});

describe('HeatmapPlot – data/x/y/z shorthand', () => {
  test('renders the same cells as the explicit series form', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      data: EMPLOYMENT_BY_AGE_PROVINCE,
      x: 'ageGroup',
      y: 'province',
      z: 'pct',
    });
    const svg = await waitForSvg(container);
    expect(countCells(svg)).toBe(EMPLOYMENT_BY_AGE_PROVINCE.length);
  });
});
