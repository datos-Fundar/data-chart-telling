import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScalesProbe from '../../../layout/hover/ScalesProbe.svelte';
import { waitForSvg } from '../../_helpers/svg';

/**
 * Two panels, two steps. A panel at step `s` has two series in each of two categories; its stacked total
 * for a category is, at step 1, 33 (A) and 23 (B), at step 2, 53 (A) and 43 (B), and the second panel's are
 * 20 higher in total (each of its bars 10 more).
 */
const ROWS = ['P1', 'P2'].flatMap((panel) =>
	[1, 2].flatMap((step) =>
		['A', 'B'].flatMap((cat) =>
			['s1', 's2'].map((series) => ({
				panel,
				step,
				cat,
				series,
				value:
					10 * step + (cat === 'A' ? 5 : 0) + (series === 's1' ? 1 : 2) + (panel === 'P2' ? 10 : 0)
			}))
		)
	)
);

/** The domain each panel ends up with on the value axis. */
async function sharedDomains(filterMode: 'exact' | 'upTo') {
	const domains: number[][] = [];
	const { container } = await render(BarPlot, {
		width: 800,
		height: 400,
		data: ROWS,
		x: 'value',
		y: 'cat',
		color: 'series',
		transforms: [{ type: 'stackX' }],
		facet: { by: 'panel', scales: 'shared', columns: 2 },
		timeline: { accessor: 'step', filterMode, interpolate: false, type: 'rule', progress: 0 },
		markers: [
			{
				type: 'component',
				component: ScalesProbe,
				props: {
					onScales: (s: { x?: { domain?: number[] } }) => {
						if (s?.x?.domain) domains.push(s.x.domain);
					}
				}
			}
		]
	} as never);
	await waitForSvg(container);
	await vi.waitFor(() => expect(domains.length).toBeGreaterThan(0));
	await new Promise((resolve) => setTimeout(resolve, 300));
	// What each panel draws with once it has settled: the last of its scales.
	return domains.slice(-2).map((d) => d[1]);
}

describe('BarPlot - the shared value domain of a stacked, faceted timeline', () => {
	test('`exact`: the largest stacked total of any step in any panel, not every step stacked together', async () => {
		const highs = await sharedDomains('exact');
		// The panel with the most reaches 73 at step 2; every step stacked together would reach 160.
		for (const high of highs) {
			expect(high).toBeGreaterThanOrEqual(73);
			expect(high).toBeLessThanOrEqual(80);
		}
	});

	test('`upTo`: what the last step stacks, since a step shows every row up to it', async () => {
		const highs = await sharedDomains('upTo');
		// The last step stacks all four rows of a category: 126 in the panel with the most.
		for (const high of highs) {
			expect(high).toBeGreaterThanOrEqual(126);
			expect(high).toBeLessThanOrEqual(140);
		}
	});
});
