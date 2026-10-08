import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildPyramidKind } from '$lib/plots/pyramid/kind';
import type { PyramidPlotState, PyramidPlotCtx } from '$lib/types/plots/pyramid/state';
import type { Series } from '$lib/types/plots/data/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

const buildData = stageOf(buildPyramidKind<Row>(), 'data');

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Series.x/.y hold the category/magnitude accessors respectively - see
// phases/data.ts's own comment on why they're swapped from the top-level
// x (magnitude)/y (category) prop names.
type Row = { ageGroup: string; pct: number | null };

const CTX: PyramidPlotCtx = {
	cfg: { palette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] } as PlotStylesConfig,
	formatValue: (v) => `${v}`,
	legendInteraction: null
};

function series(name: string, data: Row[]): Series<Row> {
	return { name, x: 'ageGroup', y: 'pct', data };
}

function build(overrides: Partial<PyramidPlotState<Row>> = {}) {
	const state: PyramidPlotState<Row> = {
		series: [series('Female', [{ ageGroup: '0-4', pct: 10 }])],
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
	return buildData(state, CTX);
}

// ── Side assignment ───────────────────────────────────────────────────────────

describe('buildData - side assignment', () => {
	test('assigns sides by alphabetical order: first left, second right', () => {
		const result = build({
			series: [series('Male', []), series('Female', [])]
		});
		expect(result.resolvedSeries!.find((s) => s.name === 'Female')!.side).toBe('left');
		expect(result.resolvedSeries!.find((s) => s.name === 'Male')!.side).toBe('right');
	});

	test('scales.grouping.reverse flips the assignment', () => {
		const result = build({
			series: [series('Male', []), series('Female', [])],
			scales: { grouping: { reverse: true } }
		});
		expect(result.resolvedSeries!.find((s) => s.name === 'Female')!.side).toBe('right');
		expect(result.resolvedSeries!.find((s) => s.name === 'Male')!.side).toBe('left');
	});
});

// ── Series resolution ─────────────────────────────────────────────────────────

describe('buildData - series resolution', () => {
	test('builds series from flat data/x/y/color when series is not given', () => {
		type GroupedRow = { ageGroup: string; pct: number; sex: string };
		const data: GroupedRow[] = [
			{ ageGroup: '0-4', pct: 10, sex: 'Female' },
			{ ageGroup: '0-4', pct: 12, sex: 'Male' }
		];
		const state: PyramidPlotState<GroupedRow> = {
			data,
			x: (d) => d.pct,
			y: (d) => d.ageGroup,
			color: (d) => d.sex,
			segments: {},
			gaps: {},
			scales: {},
			width: 400,
			height: 300
		};
		const result = stageOf(buildPyramidKind<GroupedRow>(), 'data')(state, CTX);
		expect(result.resolvedSeries!.map((s) => s.name).sort()).toEqual(['Female', 'Male']);
	});
});

// ── Grouped series ────────────────────────────────────────────────────────────

describe('buildData - groupedSeries', () => {
	test('one group per resolved series, covering all of its data by default', () => {
		const data = [
			{ ageGroup: '0-4', pct: 10 },
			{ ageGroup: '5-9', pct: 8 }
		];
		const result = build({ series: [series('Female', data)] });
		expect(result.groupedSeries).toHaveLength(1);
		expect(result.groupedSeries![0].visualSegments.flatMap((seg) => seg.data)).toEqual(data);
	});
});

// ── Gap fills ─────────────────────────────────────────────────────────────────

describe('buildData - gapFillMaps', () => {
	test('has no entries when no gap zones are configured', () => {
		const result = build({
			series: [series('Female', [{ ageGroup: '0-4', pct: null }])],
			gaps: {}
		});
		expect(result.gapFillMaps!.get('Female')?.size ?? 0).toBe(0);
	});

	test('interpolates a middle gap row between its two real neighbors', () => {
		const data: Row[] = [
			{ ageGroup: '0-4', pct: 0 },
			{ ageGroup: '5-9', pct: null },
			{ ageGroup: '10-14', pct: 10 }
		];
		const result = build({
			series: [series('Female', data)],
			gaps: { default: { middle: {} } }
		});
		const fill = result.gapFillMaps!.get('Female')?.get(data[1]);
		expect(fill?.kind).toBe('middle');
		expect(fill?.value).toBeCloseTo(5, 5);
	});
});

// ── Scoped groups ─────────────────────────────────────────────────────────────

describe('buildData - scopedGroups', () => {
	test('one scoped group per resolved series, colored by default palette', () => {
		const result = build({
			series: [series('Male', []), series('Female', [])]
		});
		const female = result.scopedGroups!.find((g) => g.name === 'Female')!;
		const male = result.scopedGroups!.find((g) => g.name === 'Male')!;
		// Both should have a color assigned (from the default palette per name)
		expect(female.color).toBeTruthy();
		expect(male.color).toBeTruthy();
		expect(female.color).not.toBe(male.color);
	});
});
