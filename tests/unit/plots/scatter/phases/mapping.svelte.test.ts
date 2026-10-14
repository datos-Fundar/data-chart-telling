import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildScatterDefaults } from '$lib/plots/scatter/defaults';
import type { ScatterPlotState } from '$lib/types/plots/scatter/state';
import type { Series } from '$lib/types/plots/data/common';

const buildMapping = stageOf(buildScatterDefaults<Row>(), 'mapping');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number; population: number };

const SERIES: Series<Row>[] = [
	{
		name: 'a',
		x: 'x',
		y: 'y',
		data: [{ x: 1, y: 10, population: 5_000_000 }]
	}
];

function build(overrides: Partial<ScatterPlotState<Row>> = {}) {
	const state: ScatterPlotState<Row> = {
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries: SERIES,
		...overrides
	};
	return buildMapping(state);
}

describe('buildMapping - x/y channels', () => {
	test('resolves x/y to the first series own accessors', () => {
		const result = build();
		expect(result.channels!.x.accessor(SERIES[0].data[0])).toBe(1);
		expect(result.channels!.y.accessor(SERIES[0].data[0])).toBe(10);
	});
});

describe('buildMapping - optional r channel', () => {
	test('is undefined when r is not given', () => {
		const result = build({ r: undefined });
		expect(result.channels!.r).toBeUndefined();
	});

	test('stays a literal number when r is a constant pixel radius, not wrapped in a channel', () => {
		const result = build({ r: 8 });
		expect(result.channels!.r).toBe(8);
	});

	test('resolves to a channel accessor when r is a field key', () => {
		const result = build({ r: 'population' });
		const channel = result.channels!.r;
		expect(typeof channel).toBe('object');
		expect((channel as { accessor: (d: Row) => number }).accessor(SERIES[0].data[0])).toBe(
			5_000_000
		);
	});

	test('resolves to a channel accessor when r is a function', () => {
		const result = build({ r: (d: Row) => d.population / 2 });
		const channel = result.channels!.r;
		expect((channel as { accessor: (d: Row) => number }).accessor(SERIES[0].data[0])).toBe(
			2_500_000
		);
	});
});
