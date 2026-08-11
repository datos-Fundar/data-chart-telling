import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { FEMALE_LIFE_EXPECTANCY } from '../../../../stories/plots/line/data';
import { waitForSvg, countLinePaths } from '../_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY }];

describe('LinePlot – scales', () => {
  test('renders with no scale overrides (auto domain)', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(1);
  });

  test('a custom Y domain does not break rendering', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { y: { domain: [78, 85] } } satisfies AxisBasedScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(1);
  });

  test('a custom X domain filters ticks but still renders the line', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [
        {
          name: 'female',
          x: 'year',
          y: 'value',
          data: FEMALE_LIFE_EXPECTANCY.filter((d) => d.year >= 2010 && d.year <= 2020),
        },
      ],
      scales: { x: { domain: [2010, 2020] } } satisfies AxisBasedScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(1);
  });

  test('reversed Y axis flips the pixel position of a given tick', async () => {
    async function yPositionOf(tick: string, reverse: boolean) {
      const { container } = await render(LinePlot, {
        width: 400,
        height: 300,
        series: SERIES,
        scales: { y: { reverse } } satisfies AxisBasedScalesConfig,
      });
      const svg = await waitForSvg(container);
      const label = Array.from(svg.querySelectorAll('g.axis-y text')).find((t) => t.textContent === tick);
      return label?.getAttribute('y') ?? label?.closest('[transform]')?.getAttribute('transform');
    }
    const normal = await yPositionOf('78', false);
    const reversed = await yPositionOf('78', true);
    expect(normal).toBeTruthy();
    expect(reversed).toBeTruthy();
    expect(normal).not.toBe(reversed);
  });

  test('explicit tick values pin the X axis ticks', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { x: { ticks: [2008, 2016, 2020] } } satisfies AxisBasedScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
    expect(ticks).toEqual(['2008', '2016', '2020']);
  });

  test('a custom Y tick formatter changes the rendered tick labels', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: {
        y: { ticks: [80], tickFormat: () => 'custom' },
      } satisfies AxisBasedScalesConfig,
    });
    const svg = await waitForSvg(container);
    const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
    expect(ticks).toEqual(['custom']);
  });

  test('grid: true adds gridlines on the Y axis', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      scales: { y: { grid: true } } satisfies AxisBasedScalesConfig,
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.grid-y line').length).toBeGreaterThan(0);
  });

  test('without grid, no gridlines are rendered', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.grid-y line').length).toBe(0);
  });
});
