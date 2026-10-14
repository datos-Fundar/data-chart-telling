import { describe, test, expect, afterEach } from 'vitest';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { LegendText } from '$lib/layout/legend/LegendText';
import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';

describe('LegendState - what the reader turned off', () => {
	test('toggle turns a series off with its action, and back on', () => {
		const legend = new LegendState();
		legend.toggle('A', { mode: 'dim' });
		expect(legend.isOff('A')).toBe(true);
		expect(legend.actionOf('A')).toEqual({ mode: 'dim' });
		legend.toggle('A', { mode: 'dim' });
		expect(legend.isOff('A')).toBe(false);
	});

	test('omits only while some series is off with `omit`', () => {
		const legend = new LegendState();
		legend.turnOff('A', { mode: 'hide' });
		expect(legend.omits).toBe(false);
		legend.turnOff('B', { mode: 'omit' });
		expect(legend.omits).toBe(true);
	});
});

describe('LegendState - a series that is off stays listed', () => {
	const series = (...names: string[]) =>
		names.map((name) => ({ type: 'series' as const, name, color: `color-${name}` }));

	test('an omitted series keeps its entry, in its place, while it is off', () => {
		const legend = new LegendState();
		legend.register('p', series('A', 'B', 'C'));
		legend.turnOff('B', { mode: 'omit' });
		legend.register('p', series('A', 'C'));
		expect(legend.entries.map((e) => (e as { name: string }).name)).toEqual(['A', 'B', 'C']);
	});

	test('it is dropped once it is back on and the plot no longer draws it', () => {
		const legend = new LegendState();
		legend.register('p', series('A', 'B'));
		legend.turnOff('B', { mode: 'omit' });
		legend.register('p', series('A'));
		legend.turnOn('B');
		legend.register('p', series('A'));
		expect(legend.entries.map((e) => (e as { name: string }).name)).toEqual(['A']);
	});

	test('a series that is not off is not kept, and a new one is added after', () => {
		const legend = new LegendState();
		legend.register('p', series('A', 'B'));
		legend.register('p', series('B', 'C'));
		expect(legend.entries.map((e) => (e as { name: string }).name)).toEqual(['B', 'C']);
	});

	test('unregistering the plot drops its kept entries too', () => {
		const legend = new LegendState();
		legend.register('p', series('A', 'B'));
		legend.turnOff('B', { mode: 'omit' });
		legend.register('p', series('A'));
		legend.unregister('p');
		expect(legend.entries).toEqual([]);
	});
});

describe('LegendState - what the plots draw', () => {
	const plot = (names: string[], type: string) => ({
		resolvedSeries: names.map((name) => ({ name })),
		colorForSeries: (name: string) => `color-${name}`,
		markers: [{ type: 'text' }, { type }]
	});

	test("entriesOf reads each series in its color, drawn as the plot's first legend mark", () => {
		expect(LegendState.entriesOf(plot(['A'], 'line'))).toEqual([
			{ type: 'series', name: 'A', color: 'color-A', mark: 'line' }
		]);
	});

	test("a series drawn by several plots is one entry; unregistering drops a plot's own", () => {
		const legend = new LegendState();
		legend.register('p1', LegendState.entriesOf(plot(['A', 'B'], 'dot')));
		legend.register('p2', LegendState.entriesOf(plot(['B', 'C'], 'dot')));
		expect(legend.entries.map((e) => e.type === 'series' && e.name)).toEqual(['A', 'B', 'C']);
		legend.unregister('p2');
		expect(legend.entries).toHaveLength(2);
	});

	test('sections reads dots as circles, lines as strokes and color scales as a ramp', () => {
		const legend = new LegendState();
		legend.register('dots', LegendState.entriesOf(plot(['A'], 'dot')));
		legend.register('lines', LegendState.entriesOf(plot(['B'], 'line')));
		legend.register('ramp', [{ type: 'scale', channel: 'color', min: 0, max: 10 }]);
		const [discrete, continuous] = legend.sections();
		expect(discrete).toEqual({
			type: 'discrete',
			title: 'Series',
			items: [
				{ name: 'A', color: 'color-A', symbol: 'circle' },
				{ name: 'B', color: 'color-B', symbol: 'line', lineStyle: 'solid' }
			]
		});
		expect(continuous).toMatchObject({ type: 'continuous', min: 0, max: 10 });
	});
});

describe('LegendState - additions', () => {
	const plot = {
		resolvedSeries: [{ name: 'A' }, { name: 'B' }],
		colorForSeries: (name: string) => `color-${name}`,
		markers: [{ type: 'area' }]
	};

	test('items join the series section; sections follow the automatic ones', () => {
		const legend = new LegendState();
		legend.register('p', LegendState.entriesOf(plot));
		const [discrete, extra] = legend.sections({
			items: [{ name: 'note', color: 'gold' }],
			sections: [{ type: 'discrete', title: 'Extra', items: [{ name: 'x' }] }]
		});
		expect(discrete).toMatchObject({ items: [{ name: 'A' }, { name: 'B' }, { name: 'note' }] });
		expect(extra).toMatchObject({ title: 'Extra' });
	});

	test('a lone series with an added item shows both', () => {
		const legend = new LegendState();
		legend.register('p', LegendState.entriesOf({ ...plot, resolvedSeries: [{ name: 'A' }] }));
		expect(legend.sections({ items: [{ name: 'note' }] })).toHaveLength(1);
		expect(legend.sections()).toHaveLength(0);
	});

	test('a segment that names itself is an entry in its own color, drawn as the plot draws', () => {
		const entries = LegendState.entriesOf({
			...plot,
			segments: {
				B: [{ legend: 'B > 165 cm', styles: { fill: 'gold' } }, { styles: { fill: 'red' } }]
			}
		});
		expect(entries.at(-1)).toEqual({
			type: 'mark',
			name: 'B > 165 cm',
			label: 'B > 165 cm',
			color: 'gold',
			mark: 'area'
		});
	});

	test("a marker that names itself: its own color, else its series'; dashed when it draws dashed", () => {
		const entries = LegendState.entriesOf({
			...plot,
			markers: [
				{ type: 'area' },
				{ type: 'rule', series: 'A', legend: { label: 'Mean', lineStyle: 'dotted' } },
				{ type: 'line', legend: 'Trend', styles: { stroke: 'black', strokeDasharray: '4 2' } }
			]
		});
		const [mean, trend] = entries.filter((e) => e.type === 'mark');
		expect(mean).toMatchObject({ color: 'color-A', mark: 'line', lineStyle: 'dotted' });
		expect(trend).toMatchObject({ color: 'black', mark: 'line', lineStyle: 'dashed' });
	});
});

describe('LegendState.colorize', () => {
	test('an item naming a series takes its color, unless it sets one; other items keep theirs', () => {
		const legend = new LegendState();
		legend.register('p', [
			{ type: 'series', name: 'female', color: 'orange' },
			{ type: 'series', name: 'male', color: 'teal' }
		]);
		const [section] = legend.colorize([
			{
				type: 'discrete',
				items: [{ name: 'female' }, { name: 'male', color: 'black' }, { name: 'other' }]
			}
		]);
		expect(section.type === 'discrete' && section.items).toEqual([
			{ name: 'female', color: 'orange' },
			{ name: 'male', color: 'black' },
			{ name: 'other' }
		]);
	});
});

describe('LegendState - dot sizes', () => {
	const rows = [{ pop: 100 }, { pop: 1600 }, { pop: 400 }];
	const sized = (styles: Record<string, unknown>[]) => ({
		channels: { r: { source: 'pop' } },
		markers: styles.map((s) => ({ type: 'dot', data: rows, r: 'pop', styles: s }))
	});

	test('a dot sized by a field is a size entry from 0 to its largest value, in its own color', () => {
		expect(LegendState.entriesOf(sized([{ dotFill: 'red' }]))).toEqual([
			{
				type: 'size',
				channel: 'r',
				title: 'pop',
				domain: [0, 1600],
				range: [0, 10],
				color: 'red',
				filled: true
			}
		]);
	});

	test('rings take their stroke; dots in several colors take none; a fixed radius is no entry', () => {
		const [rings] = LegendState.entriesOf(sized([{ dotFill: 'none', dotStroke: 'teal' }]));
		expect(rings).toMatchObject({ color: 'teal', filled: false });
		const [mixed] = LegendState.entriesOf(sized([{ dotFill: 'red' }, { dotFill: 'blue' }]));
		expect(mixed).not.toHaveProperty('color');
		expect(LegendState.entriesOf({ markers: [{ type: 'dot', r: 4 }] })).toEqual([]);
	});

	test('scales.r pins the domain and range; sections reads it as a size section', () => {
		const legend = new LegendState();
		legend.register(
			'p',
			LegendState.entriesOf({
				...sized([{}]),
				scales: { r: { domain: [0, 2000], range: [2, 20] } }
			})
		);
		expect(legend.sections()).toEqual([
			{ type: 'size', title: 'Pop', domain: [0, 2000], range: [2, 20], color: undefined, filled: true }
		]);
	});
});

describe('LegendState - dot shapes', () => {
	const rows = [{ region: 'B' }, { region: 'A' }, { region: 'B' }, { region: 'C' }];

	test("a scatter's series show in the shape its dots share, as outlines when they are rings", () => {
		const [entry] = LegendState.entriesOf({
			resolvedSeries: [{ name: 'A' }],
			colorForSeries: () => 'red',
			markers: [{ type: 'dot', styles: { dotSymbol: 'diamond', dotFill: 'none' } }]
		});
		expect(entry).toMatchObject({ type: 'series', mark: 'dot', symbol: 'diamond', filled: false });
	});

	test('a dot shaped by a field is a symbol entry: each category in order, by the scale', () => {
		const entries = LegendState.entriesOf({
			channels: { symbol: { source: 'region' } },
			markers: [
				{
					type: 'dot',
					data: rows,
					symbol: 'region',
					scales: { symbol: { range: ['star', 'cross'] } },
					styles: { dotFill: 'teal' }
				}
			]
		});
		expect(entries).toEqual([
			{
				type: 'symbol',
				channel: 'symbol',
				title: 'region',
				items: [
					{ name: 'B', symbol: 'star' },
					{ name: 'A', symbol: 'cross' },
					{ name: 'C', symbol: 'star' }
				],
				color: 'teal',
				filled: true
			}
		]);
		const legend = new LegendState();
		legend.register('p', entries);
		expect(legend.sections()).toMatchObject([{ type: 'symbol', title: 'Region', color: 'teal' }]);
	});

	test('a size entry takes the shape its dots share', () => {
		const [size] = LegendState.entriesOf({
			markers: [{ type: 'dot', data: [{ v: 4 }], r: 'v', styles: { dotSymbol: 'star' } }]
		});
		expect(size).toMatchObject({ type: 'size', symbol: 'star' });
	});
});

describe('LegendText - names as the legend shows them', () => {
	test('underscores and camel-case humps split words; lowercase but the first letter', () => {
		expect(LegendText.humanize('gdp_per_capita')).toBe('Gdp per capita');
		expect(LegendText.humanize('gdpPerCapita')).toBe('Gdp per capita');
		expect(LegendText.humanize('GDP_per_capita')).toBe('GDP per capita');
		expect(LegendText.humanize('female')).toBe('Female');
	});

	test('legend.pretty off shows names as they are', () => {
		expect(LegendText.of('gdp_per_capita', { legend: { pretty: false } } as never)).toBe(
			'gdp_per_capita'
		);
	});
});

describe('LegendState - the series section title', () => {
	const twoSeries = () => {
		const legend = new LegendState();
		legend.register('p', [
			{ type: 'series', name: 'A', color: 'red' },
			{ type: 'series', name: 'B', color: 'blue' }
		]);
		return legend;
	};
	const extra = { sections: [{ type: 'discrete' as const, title: 'Source', items: [{ name: 'x' }] }] };

	afterEach(() => resetConfiguration());

	test('alone, the series section has no title; beside other sections, `legend.seriesTitle`', () => {
		expect(twoSeries().sections()[0]).not.toHaveProperty('title');
		expect(twoSeries().sections(extra)[0]).toMatchObject({ title: 'Series' });
	});

	test('its text is configurable, and it can be turned off', () => {
		setConfiguration({ legend: { seriesTitle: { text: 'Grupos' } } });
		expect(twoSeries().sections(extra)[0]).toMatchObject({ title: 'Grupos' });
		setConfiguration({ legend: { seriesTitle: { enabled: false } } });
		expect(twoSeries().sections(extra)[0]).not.toHaveProperty('title');
	});
});
