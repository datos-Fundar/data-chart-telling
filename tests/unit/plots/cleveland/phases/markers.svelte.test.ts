import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildClevelandDefaults } from '$lib/plots/cleveland/defaults';
import type { DotMarkerConfig, RuleMarkerConfig } from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The plot's own `rule` connectors and `dot` markers, from running its whole pipeline over `props`. */
function marksOf(props: Row, legend: LegendState | null = null) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	const { markers } = Pipeline.ofAxisKind(buildClevelandDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { markers: { type: string }[] };
	return {
		rules: markers.filter((m): m is RuleMarkerConfig => m.type === 'rule'),
		dots: markers.filter((m): m is DotMarkerConfig => m.type === 'dot')
	};
}

const rows = [
	{ c: 'a', v: 1, g: 'lo' },
	{ c: 'a', v: 5, g: 'mid' },
	{ c: 'a', v: 9, g: 'hi' },
	{ c: 'b', v: 4, g: 'lo' },
	{ c: 'b', v: 6, g: 'hi' },
	{ c: 'c', v: 3, g: 'lo' }
];

describe('ClevelandPlot markers', () => {
	test('one connector per category with several dots, from its lowest to its highest value', () => {
		const { rules } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		const shared = rules.find((r) => r.series === undefined)!;
		expect(shared.data).toEqual([
			{ category: 'a', from: 1, to: 9 },
			{ category: 'b', from: 4, to: 6 }
		]);
		expect(shared.styles?.stroke).toBe(DEFAULT_CONFIG.cleveland.connectorColor);
		expect(shared.styles?.strokeWidth).toBe(DEFAULT_CONFIG.cleveland.stemWidth);
	});

	test('a category with one dot gets a stem in its series color, with no range to span', () => {
		const { rules } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		const lone = rules.find((r) => r.series !== undefined)!;
		expect(lone.series).toBe('lo');
		expect(lone.data).toEqual([{ category: 'c', from: 3, to: 3 }]);
	});

	test('one dot marker per series, in the series color, at the configured radius', () => {
		const { dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(dots.map((d) => d.series)).toEqual(['lo', 'mid', 'hi']);
		expect(new Set(dots.map((d) => d.styles?.dotFill)).size).toBe(3);
		expect(dots.every((d) => d.styles?.dotRadius === DEFAULT_CONFIG.cleveland.dotRadius)).toBe(
			true
		);
	});

	test('an r channel sizes every dot by its row, a number is a fixed radius', () => {
		const sized = marksOf({ data: rows, x: 'c', y: 'v', color: 'g', r: 'v' });
		expect(sized.dots.every((d) => typeof d.r === 'function')).toBe(true);
		const fixed = marksOf({ data: rows, x: 'c', y: 'v', color: 'g', r: 8 });
		expect(fixed.dots.every((d) => d.r === 8)).toBe(true);
		expect(marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }).dots[0].r).toBeUndefined();
	});

	test('a series the legend omits leaves the ranges', () => {
		const legend = new LegendState();
		legend.turnOff('hi', { mode: 'omit' });
		const { rules, dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }, legend);
		expect(dots.map((d) => d.series)).toEqual(['lo', 'mid']);
		const shared = rules.find((r) => r.series === undefined)!;
		expect(shared.data).toEqual([{ category: 'a', from: 1, to: 5 }]);
	});

	test('a series the legend dims takes the disabled dots', () => {
		const legend = new LegendState();
		legend.turnOff('hi', { mode: 'dim' });
		const { dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }, legend);
		expect(dots[2].styles?.dotFillOpacity).toBe(DEFAULT_CONFIG.legend.disabledOpacity);
		expect(dots[0].styles?.dotFillOpacity).toBeUndefined();
	});

	test('a segment restyles the dots of the categories it covers', () => {
		const { dots } = marksOf({
			data: rows,
			x: 'c',
			y: 'v',
			segments: {
				default: [{ areas: [{ x: { from: 'b', to: 'b' } }], styles: { dots: { dotFill: 'red' } } }]
			}
		});
		const red = dots.filter((d) => d.styles?.dotFill === 'red');
		expect(red.flatMap((d) => (d.data as Row[]).map((r) => r.c))).toEqual(['b', 'b']);
	});
});
