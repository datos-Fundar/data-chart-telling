import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import PanelRunProbe from '../unit/layout/plot/PanelRunProbe.svelte';
import { CASES, FACETS, settled } from '../unit/layout/plot/panelCases';

/**
 * Local timing check, not part of `pnpm test` or CI (machine speed makes a time limit flaky there):
 * run it with `pnpm test:perf` before pushing a change to the layout, to catch a plot that got slow
 * to draw in a facet grid. The verbose reporter lists each plot's time (first draw plus settling);
 * a plot whose first draw passes `BUDGET` fails.
 */

/** Milliseconds a plot may take to first draw all its panels, on an idle machine. About 4x the slowest plot today. */
const BUDGET = 4000;

describe('Plot - facet panels draw fast', () => {
	for (const c of CASES) {
		for (const [facetName, facet] of FACETS) {
			const panels = facet.by ? 3 : 9;
			test(`${c.name}, ${facetName}`, async () => {
				const start = performance.now();
				const { container, unmount } = await render(PanelRunProbe, {
					Core: c.Core,
					core: c.core,
					buildDefaults: c.buildDefaults,
					facet,
					once: true
				});
				await vi.waitFor(() =>
					expect(container.querySelectorAll('.dct-plot svg').length).toBe(panels)
				);
				const firstDraw = performance.now() - start;
				await settled(container, panels);
				unmount();
				expect(firstDraw).toBeLessThan(BUDGET);
			}, 60_000);
		}
	}
});
