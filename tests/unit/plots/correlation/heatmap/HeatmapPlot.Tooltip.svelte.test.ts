import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

const DATA_PROPS = {
	data: PENGUIN_COUNTS,
	x: 'island' as const,
	y: 'species' as const,
	color: 'count' as const
};

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('HeatmapPlot - tooltip', () => {
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
				sync: false,
				format: (row) => {
					const { island, species, count } = row as PenguinSpeciesCount;
					return `${island} - ${species}: ${count} penguins`;
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
				sync: false,
				format: (row) => {
					const { island, species, count } = row as PenguinSpeciesCount;
					return `${island} - ${species}: ${count} penguins`;
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
					name: 'penguins',
					x: 'island',
					y: 'species',
					color: 'count',
					data: PENGUIN_COUNTS
				} satisfies Series<PenguinSpeciesCount>
			],
			tooltip: {
				sync: false,
				format: (row) => {
					const { island, count } = row as PenguinSpeciesCount;
					return `${island}: ${count} penguins`;
				}
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
