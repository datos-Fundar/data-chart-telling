import { render } from 'vitest-browser-svelte';
import type { PlotRowContext } from '$lib';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedStylesConfig, BarValueLabel, ValuesStyle } from '$lib/types/layout/styles';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES } from '$datasets';
import { waitForSvg, countTextLabels } from '../../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'province' as const,
	y: 'value' as const,
	data: FEMALE_PROVINCE_VALUES
};
const MALE = {
	name: 'male',
	x: 'province' as const,
	y: 'value' as const,
	data: MALE_PROVINCE_VALUES
};

describe('BarPlot - styles.values', () => {
	test('no value label by default', async () => {
		const { container } = await render(BarPlot, { width: 400, height: 300, series: [FEMALE] });
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('values.show renders one label per bar, formatted as the plain value by default', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(FEMALE_PROVINCE_VALUES.length);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(FEMALE_PROVINCE_VALUES.map((d) => String(d.value)))
		);
	});

	test('a custom format callback overrides the default label text', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: {
				values: {
					show: true,
					format: (v: number, _number: unknown, context: PlotRowContext) =>
						`${context.series}: ${v.toFixed(1)} yr`
				}
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(FEMALE_PROVINCE_VALUES.map((d) => `female: ${d.value.toFixed(1)} yr`))
		);
	});

	test('two series get their own independently-formatted labels', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			styles: {
				values: {
					show: true,
					format: (v: number, _number: unknown, context: PlotRowContext) =>
						`${context.series} (${v})`
				}
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(FEMALE_PROVINCE_VALUES.length + MALE_PROVINCE_VALUES.length);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(expect.arrayContaining([`female (${FEMALE_PROVINCE_VALUES[0].value})`]));
		expect(labels).toEqual(expect.arrayContaining([`male (${MALE_PROVINCE_VALUES[0].value})`]));
	});

	test('the layout moves the label on its bar: past its tip, in its middle, inside its tip', async () => {
		async function firstLabelY(values: ValuesStyle<BarValueLabel, 'value'>) {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				styles: { values: { show: true, ...values } }
			});
			const svg = await waitForSvg(container);
			await new Promise((resolve) => setTimeout(resolve, 100));
			// Each plot renders further down the page: the label is read against its own bar.
			const bar = svg.querySelector('g.bar-y rect')!.getBoundingClientRect();
			return Math.round(svg.querySelector('g.text text')!.getBoundingClientRect().top - bar.top);
		}
		const past = await firstLabelY({});
		const middle = await firstLabelY({ layout: 'box' });
		const inside = await firstLabelY({ layout: 'path', edge: 'tip', side: 'inside' });
		expect(past).toBeLessThan(inside);
		expect(inside).toBeLessThan(middle);
	});
});
