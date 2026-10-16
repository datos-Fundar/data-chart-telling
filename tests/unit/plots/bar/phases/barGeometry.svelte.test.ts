import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildBarDefaults } from '$lib/plots/bar/defaults';
import { buildBarGeometry } from '$lib/plots/bar/markers';
import type { BarPlotState } from '$lib/types/plots/bar/state';

type Row = Record<string, unknown>;

const DATA = [
	{ c: 'A', v: 10, g: 'a' },
	{ c: 'A', v: 20, g: 'b' },
	{ c: 'B', v: -5, g: 'a' }
];

function geometry(props: Row = {}, seriesPadding = 0) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, {});
	const state = Pipeline.ofAxisKind(buildBarDefaults<Row>()).run(
		{
			data: DATA,
			x: 'c',
			y: 'v',
			color: 'g',
			width: 400,
			height: 300,
			scales: {},
			segments: {},
			markers: [],
			...props
		},
		{ cfg: DEFAULT_CONFIG, interaction }
	) as BarPlotState<Row>;
	return { state, ...buildBarGeometry(state, seriesPadding) };
}

describe('buildBarGeometry', () => {
	test('series sit side by side with no stack, each in its own half of the band', () => {
		const { stacked, sliceOf } = geometry();
		expect(stacked).toBe(false);
		expect(sliceOf('a')).toEqual({ start: 0, end: 0.5 });
		expect(sliceOf('b')).toEqual({ start: 0.5, end: 0 });
	});

	test('a series gap leaves room between slices', () => {
		const { sliceOf } = geometry({}, 0.2);
		expect(sliceOf('a')!.start).toBeGreaterThan(0);
		expect(sliceOf('a')!.end).toBeGreaterThan(0.5);
	});

	test('a plot-level stackY stacks them, each filling its whole band', () => {
		const { stacked, sliceOf } = geometry({ transforms: [{ type: 'stackY' }] });
		expect(stacked).toBe(true);
		expect(sliceOf('a')).toBeUndefined();
	});

	test('a lone series fills its band', () => {
		const { sliceOf } = geometry({ data: DATA.filter((d) => d.g === 'a'), color: undefined });
		expect(sliceOf('a')).toBeUndefined();
	});

	test('a bar spans from the baseline to its value, and a missing value has no span', () => {
		const { state, spanOf, categoryOf } = geometry();
		const rows = state.processedData!.data;
		const first = rows.find((d) => categoryOf(d) === 'A' && d.v === 10)!;
		const third = rows.find((d) => categoryOf(d) === 'B')!;
		expect(spanOf(first)).toEqual([0, 10]);
		expect(spanOf(third)).toEqual([0, -5]);
		expect(categoryOf(first)).toBe('A');
		const none = geometry({ data: [{ c: 'A', v: null, g: 'a' }] });
		expect(none.spanOf(none.state.processedData!.data[0])).toBeUndefined();
	});
});
