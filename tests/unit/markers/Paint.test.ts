import { describe, test, expect } from 'vitest';
import { Paint } from '$lib/markers/utils/Paint';
import { Gradient, type GradientDefStop } from '$lib/markers/utils/Gradient';

type Row = { series: string; color?: string; up?: boolean };
const ROWS: Row[] = [{ series: 'a' }, { series: 'b' }, { series: 'a' }];
const channel = (row: Row) => ({ a: 'red', b: 'blue' })[row.series];

describe('Paint.of', () => {
	test('paints a color as it is, and with no gradient draws none', () => {
		const paints = Paint.of(ROWS, 'tomato', undefined, 'p');
		expect(ROWS.map((row) => paints.at(row))).toEqual(['tomato', 'tomato', 'tomato']);
		expect(paints.defs).toEqual([]);
	});

	test("reads the rows' field a string names, and a function of the row", () => {
		const rows: Row[] = [{ series: 'a', color: 'gold' }];
		expect(Paint.of(rows, 'color', undefined, 'p').at(rows[0])).toBe('gold');
		expect(Paint.of(rows, (row: Row) => `${row.color}!`, undefined, 'p').at(rows[0])).toBe('gold!');
	});

	test("the color channel wins over the style's color", () => {
		const paints = Paint.of(ROWS, 'tomato', channel, 'p');
		expect(ROWS.map((row) => paints.at(row))).toEqual(['red', 'blue', 'red']);
	});

	test('a gradient wins over the channel, and rows with the same gradient share one', () => {
		const paints = Paint.of(ROWS, { gradient: ['white', 'black'] }, channel, 'p');
		expect(paints.defs).toHaveLength(1);
		expect(ROWS.map((row) => paints.at(row))).toEqual(['url(#p-0)', 'url(#p-0)', 'url(#p-0)']);
	});

	test("a stop with no color takes the channel's: one gradient per color", () => {
		const paints = Paint.of(ROWS, { gradient: [{ opacity: 1 }, { opacity: 0 }] }, channel, 'p');
		expect(paints.defs.map((def) => def.stops.map((stop) => stop.color))).toEqual([
			['red', 'red'],
			['blue', 'blue']
		]);
		expect(ROWS.map((row) => paints.at(row))).toEqual(['url(#p-0)', 'url(#p-1)', 'url(#p-0)']);
	});

	test('a function can paint some rows with a gradient and the others with a color', () => {
		const rows: Row[] = [{ series: 'a', up: true }, { series: 'b' }];
		const paints = Paint.of(
			rows,
			(row: Row) => (row.up ? { gradient: ['white', 'black'] } : 'gray'),
			undefined,
			'p'
		);
		expect(rows.map((row) => paints.at(row))).toEqual(['url(#p-0)', 'gray']);
	});

	test('a stop at a value spans the plot, and a share of the span stays a share', () => {
		const [byValue] = Paint.of(
			ROWS,
			{ gradient: [{ at: 0, color: 'red' }, 'blue'] },
			undefined,
			'p'
		).defs;
		expect(byValue.span).toBe('plot');
		const [byShare] = Paint.of(
			ROWS,
			{ gradient: [{ at: '25%', color: 'red' }, 'blue'] },
			undefined,
			'p'
		).defs;
		expect(byShare.span).toBe('shape');
		expect(byShare.stops[0].at).toEqual({ share: 0.25 });
	});
});

describe('Gradient.offsets', () => {
	const stop = (at?: GradientDefStop['at']): GradientDefStop => ({ color: 'red', opacity: 1, at });
	const offsets = (stops: GradientDefStop[], project = (value: unknown) => Number(value)) =>
		Gradient.offsets(stops, project).map(({ offset }) => offset);

	test('spreads stops without a place evenly between their neighbours', () => {
		expect(offsets([stop(), stop(), stop()])).toEqual([0, 0.5, 1]);
		expect(offsets([stop(), stop({ share: 0.8 }), stop(), stop()])).toEqual([0, 0.8, 0.9, 1]);
	});

	test('places a value where the scale puts it, kept within the span', () => {
		expect(offsets([stop({ value: 0.3 }), stop({ value: 2 })])).toEqual([0.3, 1]);
	});

	test('reads stops listed from the end of the span back the other way round, keeping a hard switch', () => {
		const stops = [
			{ ...stop({ value: 1 }), color: 'pink' },
			{ ...stop({ value: 0.5 }), color: 'pink' },
			{ ...stop({ value: 0.5 }), color: 'green' },
			{ ...stop({ value: 0 }), color: 'green' }
		];
		const placed = Gradient.offsets(stops, (value) => Number(value));
		expect(placed.map(({ offset, stop }) => [offset, stop.color])).toEqual([
			[0, 'green'],
			[0.5, 'green'],
			[0.5, 'pink'],
			[1, 'pink']
		]);
	});
});
