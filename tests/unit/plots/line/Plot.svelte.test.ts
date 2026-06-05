import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { LineSeries } from '$lib/types/plots/lines';
import type { Marker } from '$lib/types/plots/markers';

// ── Fixtures ──────────────────────────────────────────────────────────────────

type P = { x: number; y: number };

const DATA: P[] = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 15 },
  { x: 4, y: 25 },
  { x: 5, y: 18 },
];

const SERIES: LineSeries<P>[] = [
  { name: 'a', x: 'x', y: 'y', data: DATA },
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

// Count <path> elements inside the SVG that belong to line marks
// (exclude the axis-x and axis-y groups which only use <line> elements).
function countLinePaths(svg: SVGElement): number {
  return svg.querySelectorAll('g:not(.axis-x):not(.axis-y) path').length;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LinePlot', () => {
  test('renders an SVG', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one path for a single unsegmented series', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(1);
  });

  test('renders one path per visual segment', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      segments: {
        a: [
          { to:   3, style: { stroke: '#4f46e5' } },
          { from: 3, style: { stroke: '#4f46e5', strokeDasharray: '6 4' } },
        ],
      },
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('renders one path per series when no segments are provided', async () => {
    const twoSeries: LineSeries<P>[] = [
      { name: 'a', x: 'x', y: 'y', data: DATA },
      { name: 'b', x: 'x', y: 'y', data: DATA },
    ];
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: twoSeries,
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('does not crash with an empty series array', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('warns via console when segments have structural problems', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      segments: {
        a: [{ to: 2 }, { to: 4 }], // two open-start ranges → should warn
      },
    });
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("no 'from'"));
    }, { timeout: 1000 });
    warn.mockRestore();
  });

  test('renders ruleX markers', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [
        { type: 'ruleX', x: 2 } satisfies Marker,
        { type: 'ruleX', x: 4 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    const initialPaths = countLinePaths(svg);
    expect(initialPaths).toBeGreaterThan(0);
  });

  test('renders ruleY markers', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [
        { type: 'ruleY', y: 10 } satisfies Marker,
        { type: 'ruleY', y: 20 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders mixed ruleX and ruleY markers', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [
        { type: 'ruleX', x: 2 } satisfies Marker,
        { type: 'ruleY', y: 15 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with empty markers array', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with html markers', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [
        {
          type: 'html',
          series: 'a',
          html: '<circle cx="50%" cy="50%" r="5" fill="red" />',
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with global html markers', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: SERIES,
      markers: [
        {
          type: 'html',
          html: '<rect width="10" height="10" fill="blue" />',
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
