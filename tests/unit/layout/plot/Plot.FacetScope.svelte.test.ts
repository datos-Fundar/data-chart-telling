import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PlotScopeProbe from './PlotScopeProbe.svelte';

type Row = { sex: string; age: string; year: number };

const DATA: Row[] = [
	{ sex: 'Women', age: 'old', year: 2000 },
	{ sex: 'Men', age: 'old', year: 2000 },
	{ sex: 'Women', age: 'young', year: 2010 },
	{ sex: 'Men', age: 'young', year: 2010 }
];

const MARKERS = [
	{ id: 'everywhere', type: 'rule' },
	{ id: 'women', type: 'rule', facet: 'Women' },
	{ id: 'men-and-more', type: 'rule', facet: ['Men', 'Other'] }
];

const SEGMENTS = {
	default: [{ id: 'base' }],
	old: [{ id: 'all' }, { id: 'women-only', facet: 'Women' }]
};

/** What each rendered core received, in the order its panels render. */
const cores = (container: Element) =>
	[...container.querySelectorAll<HTMLElement>('[data-testid="core"]')].map((core) => ({
		markers: core.dataset.markers,
		segments: core.dataset.segments,
		leaked: core.dataset.leaked
	}));

describe('Plot - limits markers and segments to the facets they name', () => {
	test('each panel gets the markers and the segments that apply to it', async () => {
		const { container } = await render(PlotScopeProbe, {
			data: DATA,
			facet: { by: 'sex', values: ['Women', 'Men'] },
			markers: MARKERS,
			segments: SEGMENTS
		});

		expect(cores(container)).toEqual([
			{ markers: 'everywhere,women', segments: 'default:base,old:all+women-only', leaked: 'false' },
			{ markers: 'everywhere,men-and-more', segments: 'default:base,old:all', leaked: 'false' }
		]);
	});

	test('a plot with a timeline and no facet leaves out what names a facet', async () => {
		const { container } = await render(PlotScopeProbe, {
			data: DATA,
			timeline: { accessor: 'year' },
			markers: MARKERS,
			segments: SEGMENTS
		});

		expect(cores(container)).toEqual([
			{ markers: 'everywhere', segments: 'default:base,old:all', leaked: 'false' }
		]);
	});

	test('a rows and cols grid names its panels by row and col', async () => {
		const { container } = await render(PlotScopeProbe, {
			data: DATA,
			facet: { rows: 'sex', cols: 'age', rowValues: ['Women', 'Men'], colValues: ['old', 'young'] },
			markers: [
				{ id: 'women-row', type: 'rule', facet: { row: 'Women' } },
				{ id: 'old-col', type: 'rule', facet: { col: 'old' } },
				{ id: 'men-young', type: 'rule', facet: { row: 'Men', col: 'young' } }
			],
			segments: {}
		});

		expect(cores(container).map((core) => core.markers)).toEqual([
			'women-row,old-col',
			'women-row',
			'old-col',
			'men-young'
		]);
	});
});
