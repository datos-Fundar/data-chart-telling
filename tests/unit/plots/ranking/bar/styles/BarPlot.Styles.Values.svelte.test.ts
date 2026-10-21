import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE
} from '../../../../../../stories/plots/ranking/bar/data';
import { waitForSvg, countTextLabels } from '../../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'province' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
};
const MALE = {
	name: 'male',
	x: 'province' as const,
	y: 'value' as const,
	data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
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
		expect(countTextLabels(svg)).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.map((d) => String(d.value)))
		);
	});

	test('a custom format callback overrides the default label text', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: {
				values: { show: true, format: (v: number, name: string) => `${name}: ${v.toFixed(1)} yr` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(
				FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.map((d) => `female: ${d.value.toFixed(1)} yr`)
			)
		);
	});

	test('two series get their own independently-formatted labels', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			styles: {
				values: { show: true, format: (v: number, name: string) => `${name} (${v})` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(
			FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length + MALE_LIFE_EXPECTANCY_BY_PROVINCE.length
		);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining([`female (${FEMALE_LIFE_EXPECTANCY_BY_PROVINCE[0].value})`])
		);
		expect(labels).toEqual(
			expect.arrayContaining([`male (${MALE_LIFE_EXPECTANCY_BY_PROVINCE[0].value})`])
		);
	});

	test("anchor changes the label's vertical position on the bar", async () => {
		async function firstLabelY(anchor: 'outside' | 'middle' | 'start' | 'end') {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				styles: { values: { show: true, anchor } } satisfies AxisBasedStylesConfig
			});
			const svg = await waitForSvg(container);
			return svg.querySelector('g.text text')?.getAttribute('transform');
		}
		const outside = await firstLabelY('outside');
		const middle = await firstLabelY('middle');
		const start = await firstLabelY('start');
		expect(outside).toBeTruthy();
		expect(middle).toBeTruthy();
		expect(start).toBeTruthy();
		expect(new Set([outside, middle, start]).size).toBe(3);
	});
});
