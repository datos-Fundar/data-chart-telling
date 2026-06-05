import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { BarSeries } from '$lib/types/plots/bars';

// ── Fixtures ──────────────────────────────────────────────────────────────────

type Region = { region: string; value: number };

const REGIONS: Region[] = [
  { region: 'Norte',  value: 42 },
  { region: 'Centro', value: 67 },
  { region: 'Sur',    value: 55 },
  { region: 'Este',   value: 38 },
  { region: 'Oeste',  value: 71 },
];

const SERIES: BarSeries<Region>[] = [
  { name: 'regions', x: 'region', y: 'value', data: REGIONS, fill: '#4f46e5' },
];

// Waits until at least one <svg> is present in the container.
async function waitForSvg(container: Element): Promise<SVGElement> {
  let svg: SVGElement | null = null;
  await vi.waitFor(
    () => {
      svg = container.querySelector('svg');
      if (!svg) throw new Error('SVG not yet rendered');
    },
    { timeout: 3000, interval: 50 },
  );
  return svg!;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BarPlot', () => {
  test('renders an SVG', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one <rect> per data point', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    // Each bar is a <rect>; axis ticks also use <rect> in some renderers
    // — target only rects inside a non-axis group, skip the first (background).
    const allRects = svg.querySelectorAll('g:not(.axis-x):not(.axis-y) rect');
    const rects = Array.from(allRects).slice(1);
    expect(rects.length).toBe(REGIONS.length);
  });

  test('does not crash with an empty series array', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one rect group per series when multiple series are provided', async () => {
    type YV = { year: string; value: number };
    const GDP: YV[]        = [{ year: '2020', value: 31 }, { year: '2021', value: 55 }];
    const EMPLOYMENT: YV[] = [{ year: '2020', value: 60 }, { year: '2021', value: 68 }];

    const twoSeries: BarSeries<YV>[] = [
      { name: 'gdp',        x: 'year', y: 'value', data: GDP,        fill: '#4f46e5' },
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT, fill: '#e6580d' },
    ];

    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: twoSeries,
    });
    const svg = await waitForSvg(container);
    const allRects = svg.querySelectorAll('g:not(.axis-x):not(.axis-y) rect');
    const rects = Array.from(allRects).slice(1);
    // 2 bars per year × 2 years = 4 rects (bars overlap by default)
    expect(rects.length).toBe(GDP.length + EMPLOYMENT.length);
  });
});
