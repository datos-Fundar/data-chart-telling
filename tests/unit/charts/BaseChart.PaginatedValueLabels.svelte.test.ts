import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BaseChartPaginatedValuesProbe from './BaseChartPaginatedValuesProbe.svelte';

// Regression coverage: a faceted chart in `mode: 'paginated'` re-mounts its
// `<LinePlot>` (a fresh instance, via FacetLayout's keyed each block) on
// every page change. Each fresh instance re-ran the value-label overflow
// watcher, which measured overflow against `usePlot().scales.x/y.fn.range()`
// — but svelteplot's `<Plot>` computes the scale object it exposes through
// context off its own *internal* auto-detected width/height, never
// reconciled with an explicit `fixedWidth`/`fixedHeight` prop (every plot
// kind here passes one). That made `.range()` report a stale boundary
// unrelated to the plot's real pixel size, so the watcher never saw genuine
// right-edge overflow and never grew the margin to fit it — end-point labels
// rendered past the plot's true right edge with no space reserved for them,
// on every page (not only page 2+, though a real chart's page 1 often has
// short enough label text for the overflow to go unnoticed there). Fixed by
// measuring against `width`/`height`/`numericMargins` — values `Plot.svelte`
// already knows are correct — instead of svelteplot's own exposed scale.

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
    const svg = container.querySelector('svg');
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

describe('BaseChart – paginated facet + line value labels', () => {
  test('end-point labels stay within the plot box on every page, not just the first', async () => {
    const { container } = await render(BaseChartPaginatedValuesProbe, { data: DATA, width: 400, height: 320 });

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
