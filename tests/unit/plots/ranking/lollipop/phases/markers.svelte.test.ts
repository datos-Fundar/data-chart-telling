import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
import type { DotMarkerConfig, RuleMarkerConfig } from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The plot's own `rule` stems and `dot` heads, from running its whole pipeline over `props`. */
function marksOf(props: Row, legend: LegendState | null = null) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	const { markers } = Pipeline.ofAxisKind(buildLollipopDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { markers: { type: string }[] };
	return {
		rules: markers.filter((m): m is RuleMarkerConfig => m.type === 'rule'),
		dots: markers.filter((m): m is DotMarkerConfig => m.type === 'dot')
	};
}

const rows = ['a', 'b'].flatMap((c, i) =>
	[1, 2].map((v) => ({ c: `${c}${v}`, v: v + i, g: i ? 'B' : 'A' }))
);

describe('LollipopPlot markers', () => {
	test('a stem and a dot per series, in its own color, at the configured geometry', () => {
		const { rules, dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(rules).toHaveLength(1);
		const stems = rules[0].data as Row[];
		expect(dots.map((d) => d.series)).toEqual(['A', 'B']);
		// `A` covers a1 and a2, `B` b1 and b2: a stem takes the color of its own series' dots.
		expect(stems.map((stem) => stem.stroke)).toEqual([
			dots[0].styles?.dotFill,
			dots[0].styles?.dotFill,
			dots[1].styles?.dotFill,
			dots[1].styles?.dotFill
		]);
		expect(stems[0].stroke).not.toBe(stems[2].stroke);
		expect(stems[0].strokeWidth).toBe(DEFAULT_CONFIG.lollipop.stemWidth);
		expect(dots[0].styles?.dotRadius).toBe(DEFAULT_CONFIG.lollipop.dotRadius);
	});

	test('a stem joins the baseline and the value, along the value axis', () => {
		const stem = (props: Row) => {
			const rule = marksOf(props).rules[0];
			return { axis: rule.axis, ends: [rule.y1, rule.y2, rule.x1, rule.x2], rows: rule.data };
		};
		const upright = stem({ data: rows, x: 'c', y: 'v' });
		expect([upright.axis, upright.ends]).toEqual(['x', ['from', 'to', undefined, undefined]]);
		expect(upright.rows?.[0]).toMatchObject({ category: 'a1', from: 0, to: 1 });
		const sideways = stem({ data: rows, x: 'v', y: 'c' });
		expect([sideways.axis, sideways.ends]).toEqual(['y', [undefined, undefined, 'from', 'to']]);
	});

	test('a series the legend dims takes the disabled stroke and dots', () => {
		const legend = new LegendState();
		legend.turnOff('B', { mode: 'dim' });
		const { rules, dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }, legend);
		const stems = rules[0].data as Row[];
		expect(stems.map((stem) => stem.strokeOpacity)).toEqual([
			1,
			1,
			DEFAULT_CONFIG.legend.disabledOpacity,
			DEFAULT_CONFIG.legend.disabledOpacity
		]);
		expect(dots[1].styles?.dotFillOpacity).toBe(DEFAULT_CONFIG.legend.disabledOpacity);
	});

	test('a segment restyles only the lollipops of the categories it covers', () => {
		const { rules, dots } = marksOf({
			data: rows,
			x: 'c',
			y: 'v',
			segments: {
				default: [
					{ areas: [{ x: { from: 'b1', to: 'b2' } }], styles: { dots: { dotFill: 'red' } } }
				]
			}
		});
		const red = dots.find((d) => d.styles?.dotFill === 'red')!;
		expect(new Set((red.data as Row[]).map((r) => r.c))).toEqual(new Set(['b1', 'b2']));
		// Every stem is still drawn, in one marker.
		expect(rules).toHaveLength(1);
		expect(rules[0].data).toHaveLength(4);
	});
});
