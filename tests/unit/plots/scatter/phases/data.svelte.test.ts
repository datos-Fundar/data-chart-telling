import { describe, test, expect } from 'vitest';
import { SvelteMap } from 'svelte/reactivity';
import { stageOf } from '../../_helpers/stages';
import { buildScatterKind } from '$lib/plots/scatter/kind';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';
import type { Series } from '$lib/types/plots/data/common';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';

const buildData = stageOf(buildScatterKind<Row>(), 'data');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number };

const PALETTE = ['red', 'green', 'blue'];
const FAKE_CFG = { palette: PALETTE } as ChartConfig;

function series(name: string, data: Row[]): Series<Row> {
	return { name, x: 'x', y: 'y', data };
}

function legendDisabling(...names: string[]): LegendInteractionStore {
	const disabledSeries = new SvelteMap<string, { mode: 'omit' }>();
	for (const name of names) disabledSeries.set(name, { mode: 'omit' });
	return { disabledSeries } as LegendInteractionStore;
}

type ResolvedData = Required<
	Pick<
		ScatterPlotState<Row>,
		'resolvedSeries' | 'groupedSeries' | 'flat' | 'scopedGroups' | 'colorForSeries'
	>
>;

function build(
	overrides: Partial<ScatterPlotState<Row>> = {},
	legendInteraction?: LegendInteractionStore
): ResolvedData {
	const state: ScatterPlotState<Row> = {
		series: [series('a', [{ x: 1, y: 10 }])],
		segments: {},
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
	const ctx: ScatterPlotCtx = { cfg: FAKE_CFG, legendInteraction };
	return buildData(state, ctx) as ResolvedData;
}

// ── Series resolution ─────────────────────────────────────────────────────────

describe('buildData – series resolution', () => {
	test('passes through an explicit series array', () => {
		const result = build({ series: [series('a', []), series('b', [])] });
		expect(result.resolvedSeries.map((s) => s.name)).toEqual(['a', 'b']);
	});

	test('builds series from flat data/x/y/color when series is not given', () => {
		type GroupedRow = Row & { group: string };
		const data: GroupedRow[] = [
			{ x: 1, y: 1, group: 'g1' },
			{ x: 2, y: 2, group: 'g2' }
		];
		const state: ScatterPlotState<GroupedRow> = {
			data,
			x: 'x',
			y: 'y',
			color: 'group',
			segments: {},
			scales: {},
			width: 400,
			height: 300
		};
		const result = stageOf(buildScatterKind<GroupedRow>(), 'data')(state, {
			cfg: FAKE_CFG,
			legendInteraction: undefined
		});
		expect(result.resolvedSeries!.map((s) => s.name).sort()).toEqual(['g1', 'g2']);
	});

	test('flattens every resolved series own rows', () => {
		const result = build({
			series: [series('a', [{ x: 1, y: 1 }]), series('b', [{ x: 2, y: 2 }])]
		});
		expect(result.flat).toEqual([
			{ x: 1, y: 1 },
			{ x: 2, y: 2 }
		]);
	});
});

// ── Legend filtering ──────────────────────────────────────────────────────────

describe('buildData – legend filtering', () => {
	test('drops a series disabled with mode: omit', () => {
		const result = build({ series: [series('a', []), series('b', [])] }, legendDisabling('b'));
		expect(result.resolvedSeries.map((s) => s.name)).toEqual(['a']);
	});

	test('color index is stable by the full (pre-filter) series list, not the filtered one', () => {
		const withoutFilter = build({ series: [series('a', []), series('b', [])] });
		const withFilter = build({ series: [series('a', []), series('b', [])] }, legendDisabling('a'));
		expect(withFilter.colorForSeries('b')).toBe(withoutFilter.colorForSeries('b'));
	});
});

// ── Color ─────────────────────────────────────────────────────────────────────

describe('buildData – colorForSeries', () => {
	test('assigns palette colors by series declaration order', () => {
		const result = build({ series: [series('a', []), series('b', []), series('c', [])] });
		expect(result.colorForSeries('a')).toBe(PALETTE[0]);
		expect(result.colorForSeries('b')).toBe(PALETTE[1]);
		expect(result.colorForSeries('c')).toBe(PALETTE[2]);
	});
});

// ── Grouped series / scoped groups ────────────────────────────────────────────

describe('buildData – groupedSeries / scopedGroups', () => {
	test('one group per resolved series, covering all of its data by default', () => {
		const data = [
			{ x: 1, y: 1 },
			{ x: 2, y: 2 }
		];
		const result = build({ series: [series('a', data)] });
		expect(result.groupedSeries).toHaveLength(1);
		expect(result.groupedSeries[0].visualSegments.flatMap((seg) => seg.data)).toEqual(data);
	});

	test('scoped groups read color from dotFill, not fill', () => {
		const result = build({
			series: [series('a', [{ x: 1, y: 1 }])],
			segments: { default: [{ styles: { dotFill: 'purple' } }] }
		});
		expect(result.scopedGroups[0].segments[0].color).toBe('purple');
	});
});
