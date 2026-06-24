import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PyramidChart from '$lib/charts/pyramid/Chart.svelte';

// ── Fixtures ──────────────────────────────────────────────────────────────────

type Row = { age: string; pct: number; sex: 'Mujeres' | 'Varones' };

const DATA: Row[] = [
  { age: '0-4', pct: 4, sex: 'Mujeres' },
  { age: '5-9', pct: 4.5, sex: 'Mujeres' },
  { age: '10-14', pct: 5, sex: 'Mujeres' },
  { age: '0-4', pct: 4.2, sex: 'Varones' },
  { age: '5-9', pct: 4.6, sex: 'Varones' },
  { age: '10-14', pct: 4.9, sex: 'Varones' },
];

const SIDE = { Mujeres: 'left' as const, Varones: 'right' as const };

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

function barRects(svg: SVGElement): SVGRectElement[] {
  const all = svg.querySelectorAll('g:not(.axis-x):not(.axis-y) rect');
  return Array.from(all).slice(1) as SVGRectElement[];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PyramidChart', () => {
  test('renders an SVG from flat rows grouped by sex', async () => {
    const { container } = await render(PyramidChart, {
      width: 600,
      height: 420,
      data: DATA,
      y: 'age',
      x: 'pct',
      side: SIDE,
      z: 'sex',
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders one bar per row', async () => {
    const { container } = await render(PyramidChart, {
      width: 600,
      height: 420,
      data: DATA,
      y: 'age',
      x: 'pct',
      side: SIDE,
      z: 'sex',
    });
    const svg = await waitForSvg(container);
    expect(barRects(svg).length).toBe(DATA.length);
  });

  test('does not crash with an empty dataset', async () => {
    const { container } = await render(PyramidChart, {
      width: 600,
      height: 420,
      data: [] as Row[],
      y: 'age',
      x: 'pct',
      side: SIDE,
      z: 'sex',
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders the title when provided', async () => {
    const { container } = await render(PyramidChart, {
      width: 600,
      height: 420,
      data: DATA,
      y: 'age',
      x: 'pct',
      side: SIDE,
      z: 'sex',
      title: 'Pirámide poblacional',
    });
    await waitForSvg(container);
    expect(container.textContent).toContain('Pirámide poblacional');
  });
});
