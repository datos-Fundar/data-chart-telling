import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import type { HoverConfig } from '$lib/types/plots/props';
import type { BoxSummaryRow } from '$lib/types/plots/distribution/box/state';

type Row = Record<string, unknown>;

/** The box plot's resolved hover, from running its whole pipeline over `props`. */
function hoverOf(props: Row) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	const state = Pipeline.ofAxisKind(buildBoxDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], tooltip: {}, ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { hover: HoverConfig<BoxSummaryRow>; hoverRows: BoxSummaryRow[] };
	return state;
}

/** `a`: 1..9, a plain box. `b`: 1..8 and 100, one value far past the upper whisker. */
const rows = [
	...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => ({ c: 'a', v, g: 'A' })),
	...[1, 2, 3, 4, 5, 6, 7, 8, 100].map((v) => ({ c: 'b', v, g: 'B' }))
];

describe('BoxPlot hover', () => {
	test('hovers one summary per box, at its median, rather than every value', () => {
		const { hover, hoverRows } = hoverOf({ data: rows, x: 'c', y: 'v' });
		expect(hover.strategy).toBe('x');
		expect(hoverRows).toHaveLength(2);
		expect(hover.points.map((p) => [p.x, p.y, p.label])).toEqual([
			['a', 5, '5'],
			['b', 5, '5']
		]);
	});

	test('a summary holds the quartiles, the whisker ends and the outliers', () => {
		const [a, b] = hoverOf({ data: rows, x: 'c', y: 'v' }).hoverRows;
		expect(a).toMatchObject({ c: 'a', category: 'a', min: 1, p25: 3, median: 5, p75: 7, max: 9 });
		expect(a.count).toBe(9);
		expect(a.outliers).toEqual([]);
		expect(b).toMatchObject({ min: 1, max: 8, outliers: [100] });
	});

	test('one summary per series and category', () => {
		const data = rows.map((r, i) => ({ ...r, g: i % 2 ? 'X' : 'Y' }));
		const { hoverRows, hover } = hoverOf({ data, x: 'c', y: 'v', color: 'g' });
		expect(hoverRows).toHaveLength(4);
		expect(new Set(hover.points.map((p) => p.series))).toEqual(new Set(['X', 'Y']));
	});

	test('a horizontal plot hovers along y, at the median on x', () => {
		const { hover } = hoverOf({ data: rows, x: 'v', y: 'c' });
		expect(hover.strategy).toBe('y');
		expect(hover.points.map((p) => [p.x, p.y])).toEqual([
			[5, 'a'],
			[5, 'b']
		]);
	});

	test('the default tooltip reads the box: its category and five numbers', () => {
		const { hover, hoverRows } = hoverOf({ data: rows, x: 'c', y: 'v' });
		expect(hover.tooltip!.format!(hoverRows[1]).split('\n')).toEqual([
			'b',
			'max: 8',
			'p75: 7',
			'median: 5',
			'p25: 3',
			'min: 1',
			'outliers: 1'
		]);
	});
});
