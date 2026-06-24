import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { PyramidSeries } from '$lib/types/plots/pyramid';

// ── Fixtures ──────────────────────────────────────────────────────────────────

type AgeRow = { age: string; pct: number };

const WOMEN: AgeRow[] = [
  { age: '0-4', pct: 4 },
  { age: '5-9', pct: 4.5 },
  { age: '10-14', pct: 5 },
];

const MEN: AgeRow[] = [
  { age: '0-4', pct: 4.2 },
  { age: '5-9', pct: 4.6 },
  { age: '10-14', pct: 4.9 },
];

const SERIES: PyramidSeries<AgeRow>[] = [
  { name: 'Mujeres', side: 'left', x: 'age', y: 'pct', data: WOMEN },
  { name: 'Varones', side: 'right', x: 'age', y: 'pct', data: MEN },
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

// Bars are <rect> elements; the underlying <Plot> also draws a background
// rect first — skip it like the bar/line plot tests do.
function barRects(svg: SVGElement): SVGRectElement[] {
  const all = svg.querySelectorAll('g:not(.axis-x):not(.axis-y) rect');
  return Array.from(all).slice(1) as SVGRectElement[];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PyramidPlot', () => {
  test('renders an SVG', async () => {
    const { container } = await render(PyramidPlot, { width: 500, height: 400, series: SERIES });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one bar per data point across both sides', async () => {
    const { container } = await render(PyramidPlot, { width: 500, height: 400, series: SERIES });
    const svg = await waitForSvg(container);
    expect(barRects(svg).length).toBe(WOMEN.length + MEN.length);
  });

  test('does not crash with an empty series array', async () => {
    const { container } = await render(PyramidPlot, { width: 500, height: 400, series: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('left and right series default to different colours', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: SERIES,
      colorLeft: '#ff0000',
      colorRight: '#0000ff',
    });
    const svg = await waitForSvg(container);
    const fills = new Set(barRects(svg).map((r) => getComputedStyle(r).fill));
    expect(fills.size).toBe(2);
  });

  test('segments dim categories left out of a highlight', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: SERIES,
      segments: {
        Mujeres: [
          { from: '0-4', to: '0-4', style: { fillOpacity: 1 } },
          { from: '5-9', to: '5-9', style: { fillOpacity: 0.25 } },
        ],
      },
    });
    const svg = await waitForSvg(container);
    const opacities = barRects(svg).map((r) => Number(getComputedStyle(r).fillOpacity));
    expect(opacities).toContain(0.25);
    expect(opacities).toContain(1);
  });

  test('showValues renders a formatted label next to each bar', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: SERIES,
      showValues: true,
      formatValue: (v: number) => `${v.toFixed(1)}%`,
    });
    const svg = await waitForSvg(container);
    const texts = Array.from(svg.querySelectorAll('text')).map((t) => t.textContent);
    expect(texts).toContain('4.0%');
    expect(texts).toContain('4.2%');
  });

  test('showValues defaults to false (no per-bar value labels)', async () => {
    const withLabels = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: SERIES,
      showValues: true,
    });
    const withoutLabels = await render(PyramidPlot, { width: 500, height: 400, series: SERIES });
    const svgWith = await waitForSvg(withLabels.container);
    const svgWithout = await waitForSvg(withoutLabels.container);
    // Axis tick labels still use <text> in both cases — only the per-bar
    // value labels (one per data point) should account for the difference.
    const diff = svgWith.querySelectorAll('text').length - svgWithout.querySelectorAll('text').length;
    expect(diff).toBe(WOMEN.length + MEN.length);
  });
});
