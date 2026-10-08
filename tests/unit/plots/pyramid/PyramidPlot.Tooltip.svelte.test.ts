import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	AGE_GROUPS,
	POPULATION_PYRAMID,
	type PopulationRow
} from '../../../../stories/data/population-pyramid';
import { waitForSvg } from '../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = {
	data: DATA_2022,
	x: 'pct' as const,
	y: 'ageGroup' as const,
	color: 'sex' as const
};

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('PyramidPlot - tooltip', () => {
	test('no floating tooltip appears without a tooltip config', async () => {
		const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			tooltip: {
				sync: false,
				format: (row) => {
					const { ageGroup, sex, pct } = row as PopulationRow;
					return `${sex} - ${ageGroup}: ${pct}%`;
				}
			}
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('renders with a two-series (data/x/y/color) tooltip config', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: { y: { domain: AGE_GROUPS } },
			tooltip: {
				sync: false,
				format: (row) => {
					const { ageGroup, sex, pct } = row as PopulationRow;
					return `${sex} - ${ageGroup}: ${pct.toFixed(1)}%`;
				}
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a series-filtered tooltip config', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			...DATA_PROPS,
			scales: { y: { domain: AGE_GROUPS } },
			tooltip: {
				sync: false,
				series: ['Female'],
				format: (row) => `Female: ${(row as PopulationRow).pct.toFixed(1)}%`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with an explicit-series tooltip config', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			series: [
				{
					name: 'Female',
					x: 'ageGroup',
					y: 'pct',
					data: DATA_2022.filter((d) => d.sex === 'Female')
				} satisfies Series<PopulationRow>,
				{
					name: 'Male',
					x: 'ageGroup',
					y: 'pct',
					data: DATA_2022.filter((d) => d.sex === 'Male')
				} satisfies Series<PopulationRow>
			],
			scales: { y: { domain: AGE_GROUPS } },
			tooltip: {
				sync: false,
				format: (row) => `${(row as PopulationRow).ageGroup}: ${(row as PopulationRow).pct}%`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('PyramidPlot - hover matches by row (y), not by bar magnitude (x)', () => {
	test('hovering near the zero baseline at a long-bar row still matches that row', async () => {
		const { container } = await render(PyramidPlot, {
			width: 940,
			height: 520,
			...DATA_PROPS,
			scales: { y: { domain: AGE_GROUPS } },
			tooltip: {
				sync: false,
				format: (row) => {
					const { ageGroup, sex, pct } = row as PopulationRow;
					return `${sex} - ${ageGroup}: ${pct}%`;
				}
			}
		});
		const svg = await waitForSvg(container);

		// "25-29" is a long-bar row (~5.2/5.3%): its bar tips sit far from the
		// zero baseline. A pointer's nearest-neighbor search that (incorrectly)
		// includes the x axis would instead match whichever row's bar magnitude
		// happens to be closest to x=0 - a short-bar row like "80-84" - since
		// pyramid's default hover strategy is `'y'` and should ignore x entirely.
		const tick = Array.from(svg.querySelectorAll('g.axis-y g.tick')).find(
			(t) => t.querySelector('text')?.textContent === '25-29'
		);
		expect(tick).toBeTruthy();
		const tickY = Number(/,([-\d.]+)\)/.exec(tick!.getAttribute('transform') ?? '')?.[1]);

		const rect = svg.getBoundingClientRect();
		const svgWidth = Number(svg.getAttribute('width'));
		const scaleX = rect.width / svgWidth;
		const scaleY = rect.height / Number(svg.getAttribute('height'));
		const clientX = rect.left + (svgWidth / 2) * scaleX + 3;
		const clientY = rect.top + tickY * scaleY;

		svg.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }));
		await vi.waitFor(() => {
			expect(container.querySelector('.dct-tooltip')?.textContent).toContain('25-29');
		});
	});
});
