import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import {
  LIFE_EXPECTANCY_BY_PROVINCE,
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  MALE_LIFE_EXPECTANCY_BY_PROVINCE,
} from '../../../../stories/plots/bar/data';
import { waitForSvg, countBarRects } from '../_helpers/svg';

describe('BarPlot – series prop', () => {
  test('renders an SVG', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [{ name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one bar per data point for a single series', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [{ name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }],
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
  });

  test('renders bars for both series', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [
        { name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE },
        { name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE },
      ],
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(
      FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length + MALE_LIFE_EXPECTANCY_BY_PROVINCE.length,
    );
  });

  test('does not crash with an empty series array', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});

describe('BarPlot – grouped data (data/x/y/z)', () => {
  test('creates one set of bars per unique z value', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      data: LIFE_EXPECTANCY_BY_PROVINCE,
      x: 'province',
      y: 'value',
      z: 'sex',
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE.length);
  });
});
