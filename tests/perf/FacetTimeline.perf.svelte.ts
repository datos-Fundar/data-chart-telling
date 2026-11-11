import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import type { Component } from 'svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg } from '../unit/plots/_helpers/svg';

/**
 * Local timing check, not part of `pnpm test` or CI (machine speed makes a time limit flaky there): run it with
 * `pnpm test:perf` before pushing a change to the facet layout. Each case steps a timeline through a grid of
 * twenty facets and reports the milliseconds one step takes to settle; a step past `BUDGET` fails.
 *
 * Svelte walks the whole graph of deriveds a plot's signals reach each time a block's own effect writes state
 * (`schedule_possible_effect_self_invalidation`, with no visited set: exponential on a plot's diamond-shaped
 * graph). A facet layout that hands its each block new objects at every step makes it do so in every panel.
 */

/** Milliseconds one step may take to settle, on an idle machine. */
const BUDGET = 1500;

const PANELS = 20;
const STEPS = 6;

const ROWS = Array.from({ length: PANELS }, (_, p) =>
	Array.from({ length: STEPS }, (_, step) =>
		Array.from({ length: 6 }, (_, i) => ({
			panel: `P${p}`,
			year: 2000 + step,
			name: `Item ${i}`,
			value: 10 + ((p * 7 + step * 5 + i * 11) % 40)
		}))
	).flat()
).flat();

type Case = { name: string; component: Component<never>; props: Record<string, unknown> };

const CASES: Case[] = [
	{
		name: `${PANELS} stacked bar panels`,
		component: BarPlot as Component<never>,
		props: {
			x: 'value',
			y: 'name',
			color: 'name',
			transforms: [{ type: 'stackX' }]
		}
	},
	{
		name: `${PANELS} line panels`,
		component: LinePlot as Component<never>,
		props: { x: 'year', y: 'value', color: 'name' }
	}
];

const macrotask = () => new Promise((resolve) => setTimeout(resolve, 0));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('Facet grid - a timeline step settles fast', () => {
	for (const c of CASES) {
		test(
			c.name,
			async () => {
				const timeline = (progress: number) => ({
					accessor: 'year',
					filterMode: 'upTo' as const,
					interpolate: false,
					type: 'rule' as const,
					progress
				});
				const { container, rerender, unmount } = await render(
					c.component as never,
					{
						width: 1200,
						height: 900,
						data: ROWS,
						...c.props,
						facet: { by: 'panel', columns: 5 },
						timeline: timeline(0)
					} as never
				);
				await waitForSvg(container);
				await frame();
				const times: number[] = [];
				for (let step = 1; step < STEPS; step++) {
					const start = performance.now();
					await rerender({ timeline: timeline(step / (STEPS - 1)) } as never);
					await macrotask();
					times.push(performance.now() - start);
					await frame();
				}
				unmount();
				const slowest = Math.max(...times);
				const mean = times.reduce((a, b) => a + b, 0) / times.length;
				console.log(
					`${c.name}: mean ${mean.toFixed(0)} ms, slowest ${slowest.toFixed(0)} ms per step`
				);
				expect(slowest).toBeLessThan(BUDGET);
			},
			300_000
		);
	}
});
