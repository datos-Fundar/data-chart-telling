import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	type ProvinceSexCell
} from '../../../../stories/plots/heatmap/data';
import { waitForSvg } from '../_helpers/svg';

const DATA_PROPS = {
	data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	x: 'province' as const,
	y: 'sex' as const,
	color: 'value' as const
};

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('HeatmapPlot – tooltip', () => {
	test('no floating tooltip appears without a tooltip config', async () => {
		const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			tooltip: {
				facetId: '',
				sync: false,
				format: (row) => {
					const { province, sex, value } = row as ProvinceSexCell;
					return `${province} - ${sex}: ${value.toFixed(1)} yr`;
				}
			}
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('renders with a data/x/y/color tooltip config', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			tooltip: {
				facetId: '',
				sync: false,
				format: (row) => {
					const { province, sex, value } = row as ProvinceSexCell;
					return `${province} - ${sex}: ${value.toFixed(1)} yr`;
				}
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with an explicit series-form tooltip config', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			series: [
				{
					name: 'life_expectancy',
					x: 'province',
					y: 'sex',
					color: 'value',
					data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
				} satisfies Series<ProvinceSexCell>
			],
			tooltip: {
				facetId: '',
				sync: false,
				format: (row) => {
					const { province, value } = row as ProvinceSexCell;
					return `${province}: ${Math.round(value)} yr`;
				}
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
