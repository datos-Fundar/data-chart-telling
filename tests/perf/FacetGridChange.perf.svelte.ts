import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import Probe from './FacetGridChangeProbe.svelte';
import { waitForSvg } from '../unit/plots/_helpers/svg';

/**
 * Local timing check, not part of `pnpm test` or CI: run it with `pnpm test:perf`. A faceted bar plot's grid
 * (columns and the panels it shows) changes from a handler, and a change settles within `BUDGET`.
 *
 * The same change made from an `$effect` is not run here: Svelte walks every path of the deriveds a written
 * state reaches whenever the write happens inside a running reaction (`mark_reactions` loses its `WAS_MARKED`
 * flags there, and `schedule_possible_effect_self_invalidation` never had a visited set), so the walk is
 * exponential on a plot's diamond-shaped graph. Measured on this probe (2x3 -> 1x4, four panels):
 *
 *   from a handler       ~100 ms        (about 160 thousand visits to deriveds)
 *   from an `$effect`    30 s and more  (about 430 million visits; 24 regions x 8 years takes minutes)
 *
 * With a visited set in both walks the `$effect` write takes as long as the handler's. Until Svelte does,
 * a consumer derives the panels from the grid (`$derived`) or writes them in the handler that changes the
 * grid, and never from an `$effect`. See docs/facets.md.
 */

/** Milliseconds a grid change may take to settle, on an idle machine. */
const BUDGET = 1500;

const macrotask = () => new Promise((resolve) => setTimeout(resolve, 0));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const PRODUCTS = ['Laptops', 'Phones', 'Tablets', 'Monitors', 'Cameras', 'Printers'];
const REGIONS = 24;
const YEARS = 8;
const SUBS = ['a', 'b', 'c'];
const DATA = PRODUCTS.flatMap((product, l) =>
	Array.from({ length: REGIONS }, (_, r) =>
		Array.from({ length: YEARS }, (_, y) =>
			SUBS.map((sub, s) => ({
				product,
				region: `R${r}`,
				year: 2000 + y,
				sub,
				value: 10 + ((l * 7 + r * 5 + y * 3 + s * 11) % 40)
			}))
		).flat()
	).flat()
);

async function gridChange(mode: 'handler' | 'effect', rows: number, cols: number): Promise<number> {
	let api!: { setGrid: (rows: number, cols: number) => void };
	const { container, unmount } = await render(
		Probe as never,
		{
			data: DATA,
			products: PRODUCTS,
			mode,
			onReady: (a: typeof api) => (api = a)
		} as never
	);
	await waitForSvg(container);
	await frame();
	const start = performance.now();
	api.setGrid(rows, cols);
	await macrotask();
	const ms = performance.now() - start;
	unmount();
	return ms;
}

describe('Facet grid - a grid change settles fast', () => {
	for (const [rows, cols] of [
		[1, 4],
		[1, 3],
		[2, 2]
	]) {
		test(`2x3 -> ${rows}x${cols}, written from the handler`, async () => {
			const ms = await gridChange('handler', rows, cols);
			console.log(`2x3 -> ${rows}x${cols} from a handler: ${ms.toFixed(0)} ms`);
			expect(ms).toBeLessThan(BUDGET);
		}, 60_000);
	}

	// Minutes, and the tab is frozen meanwhile: run it by hand to measure Svelte's walk.
	test.skip('2x3 -> 1x4, written from an $effect', async () => {
		const ms = await gridChange('effect', 1, 4);
		console.log(`2x3 -> 1x4 from an $effect: ${ms.toFixed(0)} ms`);
	}, 600_000);
});
