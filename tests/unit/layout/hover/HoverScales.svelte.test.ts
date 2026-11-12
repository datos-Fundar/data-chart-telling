import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import type { Component } from 'svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import ScalesProbe from './ScalesProbe.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

/**
 * Hovering must never make svelteplot work out a plot's scales again: it does so from every mark's data, so a hover
 * that adds a mark, removes one or changes one's data or options lays the whole plot out again at every move of the
 * pointer - a lag that grows with the rows. What the hover draws and restyles is drawn with the scales the plot
 * already has.
 */

const frames = async (count: number) => {
	for (let i = 0; i < count; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

/** Fifteen series of forty years each. */
const LINES = Array.from({ length: 15 }, (_, s) =>
	Array.from({ length: 40 }, (_, i) => ({
		series: `S${s}`,
		panel: `P${s % 6}`,
		year: 1990 + i,
		value: 10 + s * 3 + Math.sin(i / 3 + s) * 5
	}))
).flat();

const BRANCHES = Array.from({ length: 40 }, (_, i) => ({
	sector: ['Primary', 'Secondary', 'Tertiary'][i % 3],
	branch: `Branch ${i}`,
	value: 5 + ((i * 37) % 50)
}));

const CELLS = Array.from({ length: 12 }, (_, x) =>
	Array.from({ length: 8 }, (_, y) => ({ x: `C${x}`, y: `R${y}`, value: (x * 7 + y * 3) % 20 }))
).flat();

const BARS = Array.from({ length: 24 }, (_, i) => ({
	name: `Item ${i}`,
	value: ((i * 13) % 30) - 10
}));

const PROVINCE = (f: { properties: unknown }) => (f.properties as { nombre: string }).nombre;

type Case = { name: string; component: Component<never>; props: Record<string, unknown> };

const CASES: Case[] = [
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
		name: "a bar plot's band",
		component: BarPlot as Component<never>,
		props: {
			data: BARS,
			x: 'value',
			y: 'name',
			tooltip: true,
			markers: [{ type: 'hover', strategy: 'y' }]
		}
	},
	{
		name: "a treemap's restyled tiles",
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
		name: "a heatmap's restyled cells",
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
		name: "a scatter plot's dots",
		component: ScatterPlot as Component<never>,
		props: {
			data: LINES.filter((_, i) => i % 3 === 0),
			x: 'year',
			y: 'value',
			color: 'series',
			tooltip: true,
			markers: [{ type: 'hover', active: { fillOpacity: 1 }, others: { fillOpacity: 0.2 } }]
		}
	},
	{
		name: "a map's hovered province",
		component: GeoPlot as Component<never>,
		props: {
			data: ARGENTINA_PROVINCES,
			featureId: PROVINCE,
			tooltip: { format: PROVINCE },
			markers: [{ type: 'geo-hover' }]
		}
	}
];

/** Moves the pointer across the plot's box, in steps, the way a reader sweeps it. */
async function sweep(container: Element, steps: number) {
	const plots = Array.from(container.querySelectorAll<HTMLElement>('.dct-plot'));
	for (const plot of plots) {
		const svg = plot.querySelector('svg')!;
		const box = svg.getBoundingClientRect();
		for (let i = 0; i < steps; i++) {
			const clientX = box.left + box.width * (0.15 + (0.7 * i) / (steps - 1));
			const clientY = box.top + box.height * (0.2 + (0.6 * ((i * 7) % steps)) / steps);
			const target = document.elementFromPoint(clientX, clientY) ?? svg;
			const init = { bubbles: true, clientX, clientY };
			target.dispatchEvent(new PointerEvent('pointerover', init));
			target.dispatchEvent(new PointerEvent('pointerenter', { clientX, clientY }));
			target.dispatchEvent(new PointerEvent('pointermove', init));
			await frames(2);
		}
		plot.dispatchEvent(new PointerEvent('pointerleave'));
		await frames(2);
	}
}

describe('Hover - the scales stay as they are', () => {
	for (const c of CASES) {
		test(
			c.name,
			async () => {
				const seen: unknown[] = [];
				const onScales = (scales: unknown) => {
					if (!seen.includes(scales)) seen.push(scales);
				};
				const markers = [
					...((c.props.markers as unknown[]) ?? []),
					{ type: 'component', component: ScalesProbe, props: { onScales } }
				];
				const { container, unmount } = await render(
					c.component as never,
					{
						width: 720,
						height: 440,
						...c.props,
						markers
					} as never
				);
				await waitForSvg(container);
				await frames(10);
				const settled = seen.length;

				await sweep(container, 12);

				unmount();
				expect(seen.length - settled).toBe(0);
			},
			30_000
		);
	}
});
