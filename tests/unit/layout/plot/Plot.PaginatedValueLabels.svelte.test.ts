import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PlotPaginatedValuesProbe from './PlotPaginatedValuesProbe.svelte';

// A paginated facet remounts its plot on every page; the value labels must stay inside the plot box on each.

type Row = { region: string; sex: 'male' | 'female'; year: number; value: number };

function regionRows(region: string, femaleBase: number, maleBase: number): Row[] {
  const rows: Row[] = [];
  for (let year = 2000; year <= 2020; year += 2) {
    const t = (year - 2000) / 20;
    rows.push({ region, sex: 'female', year, value: femaleBase + t * 10 });
    rows.push({ region, sex: 'male', year, value: maleBase + t * 8 });
  }
  return rows;
}

const DATA: Row[] = [
  ...regionRows('Catamarca', 60, 55),
  ...regionRows('Chaco', 65, 50),
  ...regionRows('Chubut', 70, 58),
];

async function waitForLaidOutSvg(container: Element): Promise<SVGSVGElement> {
  const start = Date.now();
  for (;;) {
    const svg = container.querySelector<SVGSVGElement>('.dct-plot svg');
    if (svg && svg.getBoundingClientRect().width > 0) return svg;
    if (Date.now() - start > 5000) throw new Error('svg never laid out with nonzero width');
    await new Promise((r) => setTimeout(r, 20));
  }
}

function rightOverflow(svg: SVGSVGElement): number {
  const svgBox = svg.getBoundingClientRect();
  const g = svg.querySelector('g.text');
  if (!g) return 0;
  return Math.max(0, g.getBoundingClientRect().right - svgBox.right);
}

describe('LinePlot - paginated facet + line value labels', () => {
  test('end-point labels stay within the plot box on every page, not just the first', async () => {
    const { container } = await render(PlotPaginatedValuesProbe, { data: DATA, width: 400, height: 320 });

    await waitForLaidOutSvg(container);
    await new Promise((r) => setTimeout(r, 500)); // let the overflow watcher's grow+remount cycle settle
    expect(rightOverflow(await waitForLaidOutSvg(container))).toBeLessThanOrEqual(1);

    const nextBtn = container.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();

    nextBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    expect(rightOverflow(await waitForLaidOutSvg(container))).toBeLessThanOrEqual(1);

    nextBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    expect(rightOverflow(await waitForLaidOutSvg(container))).toBeLessThanOrEqual(1);
  });
});
