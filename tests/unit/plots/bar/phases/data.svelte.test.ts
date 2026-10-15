import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildBarDefaults } from '$lib/plots/bar/defaults';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { Series } from '$lib/types/plots/data/common';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';

const buildData = stageOf(buildBarDefaults<Row>(), 'data');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number | null };

const PALETTE = ['red', 'green', 'blue'];
const FAKE_CFG = { palette: PALETTE } as PlotStylesConfig;

function series(name: string, data: Row[]): Series<Row> {
	return { name, x: 'category', y: 'value', data };
}

function legendDisabling(...names: string[]): LegendState {
	const legend = new LegendState();
	for (const name of names) legend.turnOff(name, { mode: 'omit' });
	return legend;
}

type ResolvedData = Required<
	Pick<
		BarPlotState<Row>,
		'resolvedSeries' | 'groupedSeries' | 'gapFillMaps' | 'flat' | 'scopedGroups' | 'colorForSeries'
	>
>;

function build(
	overrides: Partial<BarPlotState<Row>> = {},
	legendInteraction?: LegendState
): ResolvedData {
	const state: BarPlotState<Row> = {
		series: [series('a', [{ category: 'X', value: 10 }])],
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
	const ctx: BarPlotCtx = {
		cfg: FAKE_CFG,
		interaction: new PlotInteraction(() => FAKE_CFG, { legend: legendInteraction })
	};
	return buildData(state, ctx) as ResolvedData;
}

// ── Series resolution ─────────────────────────────────────────────────────────

describe('buildData - series resolution', () => {
	test('passes through an explicit series array', () => {
		const result = build({ series: [series('a', []), series('b', [])] });
		expect(result.resolvedSeries.map((s) => s.name)).toEqual(['a', 'b']);
	});

	test('builds series from flat data/x/y/color when series is not given', () => {
		type GroupedRow = Row & { group: string };
		const data: GroupedRow[] = [
			{ category: 'X', value: 1, group: 'g1' },
			{ category: 'Y', value: 2, group: 'g2' }
		];
		const state: BarPlotState<GroupedRow> = {
			data,
			x: 'category',
			y: 'value',
			color: 'group',
			segments: {},
			gaps: {},
			scales: {},
			width: 400,
			height: 300
		};
		const result = stageOf(buildBarDefaults<GroupedRow>(), 'data')(state, {
			cfg: FAKE_CFG
		});
		expect(result.resolvedSeries!.map((s) => s.name).sort()).toEqual(['g1', 'g2']);
	});

	test('flattens every resolved series own rows', () => {
		const result = build({
			series: [
				series('a', [{ category: 'X', value: 1 }]),
				series('b', [{ category: 'Y', value: 2 }])
			]
		});
		expect(result.flat).toEqual([
			{ category: 'X', value: 1 },
			{ category: 'Y', value: 2 }
		]);
	});
});

// ── Legend filtering ──────────────────────────────────────────────────────────

describe('buildData - legend filtering', () => {
	test('drops a series disabled with mode: omit', () => {
		const result = build({ series: [series('a', []), series('b', [])] }, legendDisabling('b'));
		expect(result.resolvedSeries.map((s) => s.name)).toEqual(['a']);
	});

	test('color index is stable by the full (pre-filter) series list, not the filtered one', () => {
		const withoutFilter = build({ series: [series('a', []), series('b', [])] });
		const withFilter = build({ series: [series('a', []), series('b', [])] }, legendDisabling('a'));
		// "b" is index 1 in the full list either way - omitting "a" must not
		// renumber "b" down to index 0 and shift its color.
		expect(withFilter.colorForSeries('b')).toBe(withoutFilter.colorForSeries('b'));
	});
});

// ── Color ─────────────────────────────────────────────────────────────────────

describe('buildData - colorForSeries', () => {
	test('assigns palette colors by series declaration order', () => {
		const result = build({ series: [series('a', []), series('b', []), series('c', [])] });
		expect(result.colorForSeries('a')).toBe(PALETTE[0]);
		expect(result.colorForSeries('b')).toBe(PALETTE[1]);
		expect(result.colorForSeries('c')).toBe(PALETTE[2]);
	});
});

// ── Grouped series (segments) ─────────────────────────────────────────────────

describe('buildData - groupedSeries', () => {
	test('one group per resolved series, covering all of its data by default', () => {
		const data = [
			{ category: 'X', value: 1 },
			{ category: 'Y', value: 2 }
		];
		const result = build({ series: [series('a', data)] });
		expect(result.groupedSeries).toHaveLength(1);
		expect(result.groupedSeries[0].series.name).toBe('a');
		expect(result.groupedSeries[0].visualSegments.flatMap((seg) => seg.data)).toEqual(data);
	});
});

// ── Gap fills ─────────────────────────────────────────────────────────────────

describe('buildData - gapFillMaps', () => {
	test('has no entries when no gap zones are configured', () => {
		const result = build({
			series: [series('a', [{ category: 'X', value: null }])],
			gaps: {}
		});
		expect(result.gapFillMaps.get('a')?.size ?? 0).toBe(0);
	});

	test('interpolates a middle gap row between its two real neighbors', () => {
		const data: Row[] = [
			{ category: 'X', value: 0 },
			{ category: 'Y', value: null },
			{ category: 'Z', value: 10 }
		];
		const result = build({
			series: [series('a', data)],
			gaps: { default: { middle: {} } }
		});
		const fill = result.gapFillMaps.get('a')?.get(data[1]);
		expect(fill?.kind).toBe('middle');
		expect(fill?.value).toBeCloseTo(5, 5);
	});
});

// ── Scoped groups ─────────────────────────────────────────────────────────────

describe('buildData - scopedGroups', () => {
	test('one scoped group per resolved series, carrying its own name/color/data', () => {
		const result = build({ series: [series('a', [{ category: 'X', value: 1 }])] });
		expect(result.scopedGroups).toHaveLength(1);
		expect(result.scopedGroups[0].name).toBe('a');
		expect(result.scopedGroups[0].color).toBe(result.colorForSeries('a'));
		expect(result.scopedGroups[0].data).toEqual([{ category: 'X', value: 1 }]);
	});
});
