import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import {
	type ProvinceRow,
	FEMALE_PROVINCE_VALUES,
	MALE_PROVINCE_VALUES,
	PROVINCE_VALUES
} from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

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

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('BarPlot - tooltip', () => {
	test('no floating tooltip appears without a tooltip config', async () => {
		const { container } = await render(BarPlot, { width: 400, height: 300, series: [FEMALE] });
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			tooltip: {
				sync: false,
				format: (row) => `${(row as ProvinceRow).province}: ${(row as ProvinceRow).value} yr`
			}
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('renders with a two-series tooltip config', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				format: (row) =>
					`${(row as ProvinceRow).province}: ${(row as ProvinceRow).value.toFixed(1)} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a series-filtered tooltip config', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				series: ['female'],
				format: (row) => `Female: ${(row as ProvinceRow).value.toFixed(1)} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a grouped-data (data/x/y/color) tooltip config', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: PROVINCE_VALUES,
			x: 'province',
			y: 'value',
			color: 'sex',
			tooltip: {
				sync: false,
				format: (row) => `${row.sex} (${row.province}): ${row.value} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
