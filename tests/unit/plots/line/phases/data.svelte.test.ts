import { describe, test, expect } from 'vitest';
import { stageOf } from '../../_helpers/stages';
import { buildLineDefaults } from '$lib/plots/line/defaults';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';
import type { Series } from '$lib/types/plots/data/common';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';

const buildData = stageOf(buildLineDefaults<Row>(), 'data');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { x: number; y: number | null };

const PALETTE = ['red', 'green', 'blue'];
const FAKE_CFG = { palette: PALETTE } as PlotStylesConfig;

function series(name: string, data: Row[]): Series<Row> {
	return { name, x: 'x', y: 'y', data };
}

function legendDisabling(...names: string[]): LegendState {
	const legend = new LegendState();
	for (const name of names) legend.turnOff(name, { mode: 'omit' });
	return legend;
}

function build(
	overrides: Partial<LinePlotState<Row>> = {},
	legendInteraction?: LegendState
) {
	const state: LinePlotState<Row> = {
		series: [series('a', [{ x: 1, y: 10 }])],
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		...overrides
	};
	const ctx: LinePlotCtx = { cfg: FAKE_CFG, interaction: new PlotInteraction(() => FAKE_CFG, { legend: legendInteraction }) };
	return buildData(state, ctx);
}

describe('buildData - series resolution', () => {
	test('passes through an explicit series array', () => {
		const result = build({ series: [series('a', []), series('b', [])] });
		expect(result.resolvedSeries!.map((s) => s.name)).toEqual(['a', 'b']);
	});

	test('builds series from flat data/x/y/color when series is not given', () => {
		type GroupedRow = { x: number; y: number; group: string };
		const data: GroupedRow[] = [
			{ x: 1, y: 1, group: 'g1' },
			{ x: 2, y: 2, group: 'g2' }
		];
		const state: LinePlotState<GroupedRow> = {
			data,
			x: 'x',
			y: 'y',
			color: 'group',
			segments: {},
			gaps: {},
			scales: {},
			width: 400,
			height: 300
		};
		const result = stageOf(buildLineDefaults<GroupedRow>(), 'data')(state, {
			cfg: FAKE_CFG
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

describe('buildData - legend filtering', () => {
	test('drops a series disabled with mode: omit', () => {
		const result = build({ series: [series('a', []), series('b', [])] }, legendDisabling('b'));
		expect(result.resolvedSeries!.map((s) => s.name)).toEqual(['a']);
	});

	test('color index is stable by the full (pre-filter) series list, not the filtered one', () => {
		const withoutFilter = build({ series: [series('a', []), series('b', [])] });
		const withFilter = build({ series: [series('a', []), series('b', [])] }, legendDisabling('a'));
		expect(withFilter.colorForSeries!('b')).toBe(withoutFilter.colorForSeries!('b'));
	});
});

describe('buildData - colorForSeries', () => {
	test('assigns palette colors by series declaration order', () => {
		const result = build({ series: [series('a', []), series('b', []), series('c', [])] });
		expect(result.colorForSeries!('a')).toBe(PALETTE[0]);
		expect(result.colorForSeries!('b')).toBe(PALETTE[1]);
		expect(result.colorForSeries!('c')).toBe(PALETTE[2]);
	});
});

describe('buildData - groupedSeries / scopedGroups', () => {
	test('one group per resolved series, covering all of its data by default', () => {
		const data = [
			{ x: 1, y: 1 },
			{ x: 2, y: 2 }
		];
		const result = build({ series: [series('a', data)] });
		expect(result.groupedSeries).toHaveLength(1);
		expect(result.groupedSeries![0].visualSegments.flatMap((seg) => seg.data)).toEqual(data);
	});

	test('scoped groups read color from stroke.stroke, not fill', () => {
		const result = build({
			series: [series('a', [{ x: 1, y: 1 }])],
			segments: { default: [{ styles: { stroke: { stroke: 'purple' } } }] }
		});
		expect(result.scopedGroups![0].segments[0].color).toBe('purple');
	});
});
