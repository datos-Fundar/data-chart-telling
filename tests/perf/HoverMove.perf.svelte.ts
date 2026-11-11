import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import type { Component } from 'svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { waitForSvg } from '../unit/plots/_helpers/svg';

/**
 * Local timing check, not part of `pnpm test` or CI (machine speed makes a time limit flaky there): run it with
 * `pnpm test:perf` before pushing a change to the hover, to catch a plot whose hover got slow. Each case sweeps the
 * pointer across the plot and reports the milliseconds the slowest move takes to settle (the work it sets off, not
 * the paint); a move past `BUDGET` fails. `tests/unit/layout/hover/HoverScales.svelte.test.ts` guards the cause -
 * a hover that makes svelteplot work out the scales again - in every run.
 */

/** Milliseconds one move of the pointer may take to settle, on an idle machine. */
const BUDGET = 40;

const LINES = Array.from({ length: 15 }, (_, s) =>
	Array.from({ length: 40 }, (_, i) => ({
		series: `S${s}`,
		panel: `P${s % 6}`,
		year: 1990 + i,
		value: 10 + s * 3 + Math.sin(i / 3 + s) * 5
	}))
).flat();

const BRANCHES = Array.from({ length: 52 }, (_, i) => ({
	sector: ['Primary', 'Secondary', 'Tertiary'][i % 3],
	branch: `Branch ${i}`,
	value: 5 + ((i * 37) % 50)
}));

const CELLS = Array.from({ length: 20 }, (_, x) =>
	Array.from({ length: 12 }, (_, y) => ({ x: `C${x}`, y: `R${y}`, value: (x * 7 + y * 3) % 20 }))
).flat();

const PROVINCE = (f: { properties: unknown }) => (f.properties as { nombre: string }).nombre;

const CASES: { name: string; component: Component<never>; props: Record<string, unknown> }[] = [
	{
		name: 'a line plot of fifteen series',
		component: LinePlot as Component<never>,
		props: {
			data: LINES,
			x: 'year',
			y: 'value',
			color: 'series',
			tooltip: true,
			markers: [{ type: 'hover' }]
		}
	},
	{
		name: 'a line plot in six synced panels',
		component: LinePlot as Component<never>,
		props: {
			data: LINES,
			x: 'year',
			y: 'value',
			color: 'series',
			facet: { by: 'panel', columns: 3 },
			tooltip: { sync: true },
			markers: [{ type: 'hover' }]
		}
	},
	{
		name: 'a treemap of 52 tiles, restyled',
		component: TreemapPlot as Component<never>,
		props: {
			data: BRANCHES,
			value: 'value',
			grouping: 'sector.branch',
			tooltip: true,
			markers: [{ type: 'hover', active: { fillOpacity: 1 }, others: { fillOpacity: 0.3 } }]
		}
	},
	{
		name: 'a heatmap of 240 cells, restyled',
		component: HeatmapPlot as Component<never>,
		props: {
			data: CELLS,
			x: 'x',
			y: 'y',
			color: 'value',
			tooltip: true,
			markers: [{ type: 'hover', active: { stroke: 'black' }, others: { fillOpacity: 0.4 } }]
		}
	},
	{
		name: "a map's provinces, one hovered at a time",
		component: GeoPlot as Component<never>,
		props: {
			data: ARGENTINA_PROVINCES,
			featureId: PROVINCE,
			tooltip: { format: PROVINCE },
			markers: [{ type: 'geo-hover' }]
		}
	}
];

const macrotask = () => new Promise((resolve) => setTimeout(resolve, 0));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('Hover - each move settles fast', () => {
	for (const c of CASES) {
		test(
			c.name,
			async () => {
				const { container, unmount } = await render(
					c.component as never,
					{
						width: 720,
						height: 440,
						...c.props
					} as never
				);
				await waitForSvg(container);
				const plot = container.querySelector<HTMLElement>('.dct-plot')!;
				const box = plot.querySelector('svg')!.getBoundingClientRect();
				const times: number[] = [];
				for (let i = 0; i < 16; i++) {
					const clientX = box.left + box.width * (0.15 + (0.7 * i) / 15);
					const clientY = box.top + box.height * (0.25 + (0.5 * ((i * 7) % 16)) / 16);
					const target = document.elementFromPoint(clientX, clientY) ?? plot;
					const start = performance.now();
					target.dispatchEvent(new PointerEvent('pointerenter', { clientX, clientY }));
					target.dispatchEvent(
						new PointerEvent('pointermove', { bubbles: true, clientX, clientY })
					);
					await macrotask();
					times.push(performance.now() - start);
					await frame();
				}
				unmount();
				// The first move turns the hover on; the slowest of the rest is what a reader feels.
				const slowest = Math.max(...times.slice(1));
				const median = times.slice(1).sort((a, b) => a - b)[Math.floor((times.length - 1) / 2)];
				console.log(`${c.name}: median ${median.toFixed(1)} ms, slowest ${slowest.toFixed(1)} ms`);
				expect(slowest).toBeLessThan(BUDGET);
			},
			60_000
		);
	}
});
