import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES, POPULATION_BY_AGE } from '$datasets';
import { waitForSvg } from './_helpers/svg';

/**
 * A value label that isolates its series has to be what the pointer finds over it - not a shape, or the hit area of
 * the hover, drawn after it. These ask the page what is at the middle of each label.
 */
const BAR_SERIES = [
	{ name: 'female', x: 'province' as const, y: 'value' as const, data: FEMALE_PROVINCE_VALUES },
	{ name: 'male', x: 'province' as const, y: 'value' as const, data: MALE_PROVINCE_VALUES }
];
const ROWS = [
	{ v: 1, g: 'A' },
	{ v: 4, g: 'B' },
	{ v: 12, g: 'A' },
	{ v: 15, g: 'A' },
	{ v: 18, g: 'B' }
];

const PLOTS = {
	'bar plot': {
		Plot: BarPlot,
		props: { series: BAR_SERIES, width: 600, height: 320 }
	},
	'histogram plot': {
		Plot: HistogramPlot,
		props: {
			data: ROWS,
			x: 'v',
			color: 'g',
			transforms: [{ type: 'binX', thresholds: [0, 10, 20] }],
			width: 400,
			height: 300
		}
	},
	'pyramid plot': {
		Plot: PyramidPlot,
		props: {
			data: POPULATION_BY_AGE.filter((d) => d.year === 2022),
			x: 'share',
			y: 'ageGroup',
			color: 'sex',
			width: 560,
			height: 520
		}
	}
} as const;

describe.each(Object.entries(PLOTS))(
	'%s - a label that isolates its series',
	(_name, { Plot, props }) => {
		test('is what the pointer finds at its middle', async () => {
			const { container } = await render(
				Plot as never,
				{
					...props,
					styles: { values: { show: true, hoverIsolate: true } }
				} as never
			);
			const svg = await waitForSvg(container);
			await expect.poll(() => svg.querySelectorAll('g.text text').length).toBeGreaterThan(0);
			await new Promise((resolve) => setTimeout(resolve, 200));
			// A bin with nothing in it writes an empty label, which has no middle to find.
			const labels = Array.from(svg.querySelectorAll<SVGTextElement>('g.text text')).filter((t) =>
				t.textContent?.trim()
			);
			// Labels of two series can sit on one another (a histogram's bins); what matters is that a label is on top.
			const found = labels.map((label) => {
				const box = label.getBoundingClientRect();
				const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
				return !!top?.closest('g.text');
			});
			expect(found.length).toBeGreaterThan(0);
			expect(found.every(Boolean)).toBe(true);
		});
	}
);
