import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildClevelandDefaults } from '$lib/plots/cleveland/defaults';
import type {
	DotMarkerConfig,
	RuleMarkerConfig,
	TextMarkerConfig,
	ArrowMarkerConfig
} from '$lib/types/markers/common';

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
		dots: markers.filter((m): m is DotMarkerConfig => m.type === 'dot'),
		texts: markers.filter((m): m is TextMarkerConfig => m.type === 'text'),
		arrows: markers.filter((m): m is ArrowMarkerConfig => m.type === 'arrow')
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
	/** The rows the plot's one connector marker draws, by category. */
	const connectors = (props: Row, legend: LegendState | null = null) =>
		Object.fromEntries(
			(marksOf(props, legend).rules.flatMap((r) => r.data) as Row[]).map((row) => [
				row.category,
				row
			])
		);

	test('one connector per category, from its lowest to its highest value, in one marker', () => {
		const { rules } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(rules).toHaveLength(1);
		const rowsOf = connectors({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(rowsOf.a).toMatchObject({ from: 1, to: 9, mid: 5 });
		expect(rowsOf.b).toMatchObject({ from: 4, to: 6 });
		// Several dots, so the connector is neutral and as thick as the configuration says.
		expect(rowsOf.a.stroke).toBe(DEFAULT_CONFIG.cleveland.connectorColor);
		expect(rowsOf.a.strokeWidth).toBe(DEFAULT_CONFIG.cleveland.stemWidth);
	});

	test('a category with one dot gets a stem in its series color, with no range to span', () => {
		const { dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		const lone = connectors({ data: rows, x: 'c', y: 'v', color: 'g' }).c;
		expect(lone).toMatchObject({ from: 3, to: 3 });
		expect(lone.stroke).toBe(dots.find((d) => d.series === 'lo')!.styles?.dotFill);
	});

	test('one dot marker per series, in the series color, at the configured radius', () => {
		const { dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(dots.map((d) => d.series)).toEqual(['lo', 'mid', 'hi']);
		expect(new Set(dots.map((d) => d.styles?.dotFill)).size).toBe(3);
		expect(dots.every((d) => d.styles?.dotRadius === DEFAULT_CONFIG.cleveland.dotRadius)).toBe(
			true
		);
	});

	test("the legend draws the series as dots, not as the connector's line", () => {
		const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
		const state = Pipeline.ofAxisKind(buildClevelandDefaults<Row>()).run(
			{
				width: 400,
				height: 300,
				scales: {},
				segments: {},
				markers: [],
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g'
			},
			{ cfg: DEFAULT_CONFIG, interaction }
		) as unknown as Parameters<typeof LegendState.entriesOf>[0];
		const series = LegendState.entriesOf(state).filter((entry) => entry.type === 'series') as {
			mark?: string;
		}[];
		expect(series).toHaveLength(3);
		expect(series.every((entry) => entry.mark === 'dot')).toBe(true);
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
		const { dots } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }, legend);
		expect(dots.map((d) => d.series)).toEqual(['lo', 'mid']);
		expect(connectors({ data: rows, x: 'c', y: 'v', color: 'g' }, legend).a).toMatchObject({
			from: 1,
			to: 5
		});
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

	describe('value labels', () => {
		/** The values written, per label marker, in the order the markers draw. */
		const written = (values: Row) => {
			const { texts } = marksOf({ data: rows, x: 'c', y: 'v', color: 'g', styles: { values } });
			return texts.map((t) =>
				(t.data as Row[]).map((row) => (t.text as (d: Row) => string)(row)).sort()
			);
		};

		test('write every dot unless `of` picks some', () => {
			// Past the top end (a lone dot is its own top), past the bottom end, and beside the dots between.
			expect(written({ show: true })).toEqual([['3', '6', '9'], ['1', '4'], ['5']]);
		});

		test('`select` writes only the picked dots of each category: its ends, one end, its first or last', () => {
			expect(written({ show: true, select: ['min', 'max'] })).toEqual([
				['3', '6', '9'],
				['1', '4']
			]);
			expect(written({ show: true, select: 'max' })).toEqual([['3', '6', '9']]);
			// A lone dot is the lowest of its category too, and the top of its range.
			expect(written({ show: true, select: 'min' })).toEqual([['3'], ['1', '4']]);
			// The first or last row of each category, in series order; a lone dot is both.
			expect(written({ show: true, select: 'first' })).toEqual([['3'], ['1', '4']]);
			expect(written({ show: true, select: 'last' })).toEqual([['3', '6', '9']]);
		});

		test('`series` writes only the dots of those series, before `select` picks among them', () => {
			expect(written({ show: true, series: 'mid' })).toEqual([['5']]);
			expect(written({ show: true, series: ['lo', 'mid'], select: 'min' })).toEqual([
				['3'],
				['1', '4']
			]);
		});

		test('format gets the value, the series and the row of each label', () => {
			const { texts } = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: {
					values: {
						show: true,
						select: 'last',
						format: (v: number, name: string, row?: Row) => `${row?.c}/${name}: ${v}`
					}
				}
			});
			const text = texts[0].text as (d: Row) => string;
			expect((texts[0].data as Row[]).map((row) => text(row)).sort()).toEqual([
				'a/hi: 9',
				'b/hi: 6',
				'c/lo: 3'
			]);
		});

		test('color writes them in their series color, or in one color', () => {
			const fills = (color: string) =>
				marksOf({
					data: rows,
					x: 'c',
					y: 'v',
					color: 'g',
					styles: { values: { show: true, select: ['min', 'max'], color } }
				}).texts.map((t) => t.styles?.fill);
			// `hi` writes the top ends, `lo` the bottom ones: one marker per series and role.
			expect(new Set(fills('series')).size).toBe(2);
			expect(fills('crimson').every((fill) => fill === 'crimson')).toBe(true);
		});
	});

	describe('styles.connector', () => {
		const withConnector = (connector: Row, extra: Row = {}) =>
			connectors({ data: rows, x: 'c', y: 'v', color: 'g', styles: { connector }, ...extra });

		test('width is a number, as thick as the dots are wide, or a function of the connector', () => {
			expect(withConnector({ width: 9 }).a.strokeWidth).toBe(9);
			expect(withConnector({ width: 'dots' }).a.strokeWidth).toBe(
				DEFAULT_CONFIG.cleveland.dotRadius * 2
			);
			expect(
				withConnector({ width: (range: { length: number }) => range.length }).a.strokeWidth
			).toBe(8);
		});

		test('color is one color, or a function of what the connector measures', () => {
			expect(withConnector({ color: 'tomato' }).b.stroke).toBe('tomato');
			expect(
				withConnector({ color: (range: { category: unknown }) => `c-${range.category}` }).a.stroke
			).toBe('c-a');
		});

		test('color by sign follows the difference between the first and the last series', () => {
			// `a`: lo 1 -> hi 9 rises; `b`: lo 4 -> hi 6 rises; a falling one has the other color.
			const sign = { by: 'sign', positive: 'green', negative: 'red' };
			expect(withConnector({ color: sign }).a.stroke).toBe('green');
			const falling = connectors({
				data: [
					{ c: 'a', v: 9, g: 'lo' },
					{ c: 'a', v: 1, g: 'hi' }
				],
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { color: sign } }
			});
			expect(falling.a.stroke).toBe('red');
		});

		test("without colors of its own, a sign takes the configuration's, and a length or a difference its ramps", () => {
			const { sign, outsideOpacity, labelFontSize } = DEFAULT_CONFIG.connector;
			const rising = withConnector({ color: { by: 'sign' } });
			expect(rising.a.stroke).toBe(sign.positive);
			const falling = connectors({
				data: [
					{ c: 'a', v: 9, g: 'lo' },
					{ c: 'a', v: 1, g: 'hi' }
				],
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { color: { by: 'sign' } } }
			});
			expect(falling.a.stroke).toBe(sign.negative);
			// The ramps come from the configuration too: the longest connector ends the length ramp.
			expect(withConnector({ color: { by: 'length' } }).a.stroke).toMatch(/^rgb\(/);
			expect(withConnector({ color: { by: 'difference' } }).a.stroke).toMatch(/^rgb\(/);
			// So do the outside part's opacity and the label's size.
			const outside = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { from: 'lo', to: 'mid', label: true } }
			});
			const beyond = (outside.rules.flatMap((r) => r.data) as Row[]).find((r) => r.from === 5)!;
			expect(beyond.strokeOpacity).toBe(outsideOpacity);
			const label = outside.texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!;
			expect(label.styles?.fontSize).toBe(labelFontSize);
		});

		test('from and to name the series a difference runs between', () => {
			const sign = { by: 'sign', positive: 'green', negative: 'red' };
			expect(withConnector({ color: sign, from: 'hi', to: 'lo' }).a.stroke).toBe('red');
		});

		test('color by length draws the longest connector in the last color of the ramp', () => {
			const scheme = ['#ffffff', '#000000'];
			const rowsOf = withConnector({ color: { by: 'length', scheme } });
			expect(rowsOf.a.stroke).not.toBe(rowsOf.b.stroke);
			expect(rowsOf.a.stroke).toBe('rgb(0, 0, 0)');
		});

		test('the connector is split where the from and to dots are: the stretch between them in its look, the rest apart', () => {
			// `a`: lo 1, mid 5, hi 9. From lo to mid, the stretch 1-5 is the connector's, 5-9 lies outside it.
			const { rules } = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { from: 'lo', to: 'mid', color: 'tomato' } }
			});
			const parts = (rules.flatMap((r) => r.data) as Row[]).filter((row) => row.category === 'a');
			expect(parts.map((p) => [p.from, p.to, p.stroke])).toEqual([
				[1, 5, 'tomato'],
				[5, 9, DEFAULT_CONFIG.cleveland.connectorColor]
			]);
			// Outside, the neutral color at a lower opacity: `a`'s stretch itself is at full opacity.
			expect(parts[0].strokeOpacity).toBe(1);
			expect(parts[1].strokeOpacity).toBeLessThan(1);
		});

		test("`from: 'min'` and `to: 'max'` make the stretch the whole connector: no outside, the label in its middle", () => {
			// `a`: lo 1, mid 5, hi 9; first to last is already 1-9, so reverse the series: hi 9 first.
			const reversed = [
				{ c: 'a', v: 4, g: 'lo' },
				{ c: 'a', v: 1, g: 'mid' },
				{ c: 'a', v: 9, g: 'hi' }
			];
			const { rules, texts } = marksOf({
				data: reversed,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { from: 'min', to: 'max', label: true } }
			});
			const parts = rules.flatMap((r) => r.data) as Row[];
			expect(parts).toHaveLength(1);
			expect(parts[0]).toMatchObject({ from: 1, to: 9, mid: 5 });
			const label = texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!;
			expect((label.data as Row[])[0]).toMatchObject({ mid: 5, text: '+8' });
			// By default the stretch runs from the first series' dot to the last's, 4 to 9, and 1-4 lies outside it.
			const dflt = (
				marksOf({ data: reversed, x: 'c', y: 'v', color: 'g' }).rules.flatMap(
					(r) => r.data
				) as Row[]
			).map((p) => [p.from, p.to]);
			expect(dflt).toEqual([
				[4, 9],
				[1, 4]
			]);
		});

		test('outside restyles what lies past the from and to dots', () => {
			const parts = (
				marksOf({
					data: rows,
					x: 'c',
					y: 'v',
					color: 'g',
					styles: {
						connector: { from: 'lo', to: 'mid', outside: { color: '#ddd', opacity: 0.2 } }
					}
				}).rules.flatMap((r) => r.data) as Row[]
			).filter((row) => row.category === 'a');
			expect(parts[1]).toMatchObject({ from: 5, to: 9, stroke: '#ddd', strokeOpacity: 0.2 });
		});

		test('a category with nothing past its from and to dots is a single stretch', () => {
			const parts = (
				marksOf({ data: rows, x: 'c', y: 'v', color: 'g' }).rules.flatMap((r) => r.data) as Row[]
			).filter((row) => row.category === 'b');
			expect(parts).toHaveLength(1);
		});

		test('a label is centered on the stretch between the from and to dots, not on the whole connector', () => {
			const { texts } = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { from: 'lo', to: 'mid', label: true } }
			});
			const label = texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!;
			expect((label.data as Row[]).find((d) => d.category === 'a')).toMatchObject({
				mid: 3,
				text: '+4'
			});
		});

		test('opacity applies to the connectors, a stem keeps its own segment style', () => {
			expect(withConnector({ opacity: 0.4 }).a.strokeOpacity).toBe(0.4);
			expect(connectors({ data: rows, x: 'c', y: 'v', color: 'g' }).a.strokeOpacity).toBe(1);
		});

		test('arrow draws the from-to stretch as an arrow pointing the way the value moved, the rest as lines', () => {
			const { rules, arrows } = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { arrow: true, from: 'lo', to: 'mid' } }
			});
			expect(arrows).toHaveLength(1);
			const [{ data, headLength, headAngle, insetStart, insetEnd }] = arrows;
			// `a`: lo 1 to mid 5 - the arrow - and 5-9 beyond it, a line; `b` has no mid, so no arrow.
			expect(data).toEqual([
				expect.objectContaining({
					category: 'a',
					start: 1,
					end: 5,
					strokeWidth: DEFAULT_CONFIG.connector.arrow.width
				})
			]);
			expect(headLength).toBe(DEFAULT_CONFIG.connector.arrow.headLength);
			expect(headAngle).toBe(DEFAULT_CONFIG.connector.arrow.headAngle);
			// The shaft stops at the edge of the dots.
			expect([insetStart, insetEnd]).toEqual([
				DEFAULT_CONFIG.cleveland.dotRadius,
				DEFAULT_CONFIG.cleveland.dotRadius
			]);
			const lines = (rules.flatMap((r) => r.data) as Row[]).filter((r) => r.category === 'a');
			expect(lines.map((r) => [r.from, r.to])).toEqual([[5, 9]]);
		});

		test('an arrow follows the direction of the change, and takes the head and width it is given', () => {
			const falling = [
				{ c: 'a', v: 9, g: 'lo' },
				{ c: 'a', v: 1, g: 'hi' }
			];
			const { arrows, rules } = marksOf({
				data: falling,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { arrow: { headLength: 12, headAngle: 40 }, width: 3 } }
			});
			expect(arrows[0].data).toEqual([
				expect.objectContaining({ start: 9, end: 1, strokeWidth: 3 })
			]);
			expect([arrows[0].headLength, arrows[0].headAngle]).toEqual([12, 40]);
			// The whole connector is the arrow: no line is left.
			expect(rules.flatMap((r) => r.data)).toHaveLength(0);
		});

		test('a label is one text marker, on the middle of each connector that has a difference (`c` has one dot, so none)', () => {
			const { texts } = marksOf({
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { connector: { label: true } }
			});
			const label = texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!;
			expect((label.data as Row[]).map((d) => [d.category, d.text])).toEqual([
				['a', '+8'],
				['b', '+2']
			]);
		});

		test('a label says the length, or what a function makes of the connector', () => {
			const labelOf = (label: Row) =>
				(
					marksOf({
						data: rows,
						x: 'c',
						y: 'v',
						color: 'g',
						styles: { connector: { label } }
					}).texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!.data as Row[]
				).map((d) => d.text);
			expect(labelOf({ text: 'length' })).toEqual(['8', '2', '0']);
			expect(labelOf({ format: (v: number) => `${v} pts` })).toEqual(['8 pts', '2 pts']);
			expect(labelOf({ text: (r: { category: unknown }) => `<${r.category}>` })).toEqual([
				'<a>',
				'<b>',
				'<c>'
			]);
		});

		test('a label goes beside the connector, or on it with `anchor: middle`', () => {
			const styleOf = (label: Row) =>
				marksOf({
					data: rows,
					x: 'c',
					y: 'v',
					color: 'g',
					styles: { connector: { label } }
				}).texts.find((t) => (t.data as Row[]).some((d) => 'text' in d))!.styles;
			expect(styleOf({})?.dx).toBeGreaterThan(0);
			expect(styleOf({})?.dy).toBe(0);
			expect(styleOf({ anchor: 'middle' })).toMatchObject({
				dx: 0,
				dy: 0,
				textAnchor: 'middle',
				lineAnchor: 'middle'
			});
		});
	});
});
