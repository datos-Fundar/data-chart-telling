import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildLineKind } from '$lib/plots/line/kind';
import type { LinePlotState } from '$lib/types/plots/line/state';
import type { Series } from '$lib/types/plots/data/common';

const buildMapping = stageOf(buildLineKind<Row>(), 'mapping');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number };

const SERIES: Series<Row>[] = [{ name: 'a', x: 'x', y: 'y', data: [{ x: 1, y: 10 }] }];

function build(overrides: Partial<LinePlotState<Row>> = {}) {
	const state: LinePlotState<Row> = {
		segments: {},
		gaps: {},
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

	test('falls back to identity accessors when resolvedSeries is empty', () => {
		const result = build({ resolvedSeries: [] });
		const row = { x: 5, y: 6 };
		expect(result.channels!.x.accessor(row)).toBe(row);
		expect(result.channels!.y.accessor(row)).toBe(row);
	});
});
