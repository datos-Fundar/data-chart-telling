import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

type Row = { year: number; region: string; value: number };

// North reaches 30 and South 300, both growing across the steps.
const DATA: Row[] = ['North', 'South'].flatMap((region, r) =>
	[1, 2, 3].map((year) => ({ year, region, value: year * 10 * (r ? 10 : 1) }))
);

/** The largest y tick label of every panel. */
async function topTicks(container: Element): Promise<number[]> {
	await vi.waitFor(() => {
		const svgs = container.querySelectorAll('.dct-plot svg');
		expect(svgs.length).toBe(2);
		for (const svg of svgs) expect(svg.querySelectorAll('.axis-y text').length).toBeGreaterThan(0);
	});
	return [...container.querySelectorAll('.dct-plot svg')].map((svg) =>
		Math.max(...[...svg.querySelectorAll('.axis-y text')].map((t) => Number(t.textContent)))
	);
}

const props = (timelineScales?: 'shared' | 'free-y') => ({
	width: 700,
	height: 300,
	data: DATA,
	x: 'year',
	y: 'value',
	color: 'region',
	facet: {
		by: 'region',
		columns: 2,
		scales: 'free-y' as const,
		axes: 'all' as const,
		gap: 24,
		mode: 'grid' as const,
		values: ['North', 'South']
	},
	timeline: {
		accessor: 'year',
		progress: 0,
		scales: timelineScales,
		type: 'rule' as const,
		show: false,
		filterMode: 'upTo' as const,
		interpolate: false,
		values: [1, 2, 3]
	},
	scales: { y: { grid: true, tickSize: 0, nice: true, label: false as const } }
});

describe('Plot - facet with a timeline', () => {
	test("a free-y facet holds each panel's y axis across the steps when the timeline is shared", async () => {
		const { container } = await render(LinePlot, props('shared'));
		const [north, south] = await topTicks(container);
		expect(north).toBeGreaterThanOrEqual(30);
		expect(north).toBeLessThan(100);
		expect(south).toBeGreaterThanOrEqual(300);
	});

	test("a free-y facet refits each panel to the step when the timeline's y is free", async () => {
		const { container } = await render(LinePlot, props('free-y'));
		const [north, south] = await topTicks(container);
		expect(north).toBeLessThan(30);
		expect(south).toBeLessThan(300);
	});
});
