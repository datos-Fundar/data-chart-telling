import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { YearPoint } from '../../../../../stories/plots/evolution/line/data';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY,
	LIFE_EXPECTANCY
} from '../../../../../stories/plots/evolution/line/data';
import { waitForSvg } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY
};
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

/** Hovers the center of the rendered plot and returns the cursor's local x/y plus the tooltip's resolved `left`/`top`, once visible. */
async function hoverCenterAndReadTooltip(
	container: Element
): Promise<{ cursorX: number; cursorY: number; left: number; top: number }> {
	const svg = await waitForSvg(container);
	const plotEl = container.querySelector('.dct-plot')!;
	const rect = plotEl.getBoundingClientRect();
	const clientX = rect.left + rect.width / 2;
	const clientY = rect.top + rect.height / 2;
	svg.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }));
	await vi.waitFor(() => {
		expect(container.querySelector('.dct-tooltip')).toBeTruthy();
	});
	const tooltip = container.querySelector('.dct-tooltip') as HTMLElement;
	return {
		cursorX: clientX - rect.left,
		cursorY: clientY - rect.top,
		left: parseFloat(tooltip.style.left),
		top: parseFloat(tooltip.style.top)
	};
}

describe('LinePlot - tooltip', () => {
	test('lists the hovered series from the highest value to the lowest', async () => {
		// Male comes first in the data and sits below female every year.
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [MALE, FEMALE],
			tooltip: { strategy: 'x', format: (row) => String((row as YearPoint).value) }
		});
		await hoverCenterAndReadTooltip(container);
		const lines = container.querySelector('.dct-tooltip')!.textContent!.trim().split('\n');
		const values = lines.map(Number);
		expect(values).toHaveLength(2);
		expect(values[0]).toBeGreaterThan(values[1]);
	});

	test('no floating tooltip appears without a tooltip config', async () => {
		const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			tooltip: {
				sync: false,
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value} yr`
			}
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('renders with a two-series tooltip config', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a series-filtered tooltip config', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				series: ['female'],
				format: (row) => `Female: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a grouped-data (data/x/y/color) tooltip config', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			color: 'sex',
			tooltip: {
				sync: false,
				format: (row) => `${row.sex} (${row.year}): ${row.value} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('LinePlot - tooltip anchor placement', () => {
	test('by default, the tooltip sits to the right of and below the cursor (system default anchorX: "right", anchorY: "bottom")', async () => {
		const { container } = await render(LinePlot, {
			width: 900,
			height: 500,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const { cursorX, cursorY, left, top } = await hoverCenterAndReadTooltip(container);
		expect(left).toBeGreaterThan(cursorX);
		expect(top).toBeGreaterThan(cursorY);
	});

	test('anchorX: "left" flips the tooltip to the left of the cursor', async () => {
		const { container } = await render(LinePlot, {
			width: 900,
			height: 500,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				anchorX: 'left',
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const { cursorX, left } = await hoverCenterAndReadTooltip(container);
		expect(left).toBeLessThan(cursorX);
	});

	test('anchorY: "top" places the tooltip above the cursor', async () => {
		const { container } = await render(LinePlot, {
			width: 900,
			height: 500,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				anchorY: 'top',
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const { cursorY, top } = await hoverCenterAndReadTooltip(container);
		expect(top).toBeLessThan(cursorY);
	});

	test('anchorY: "bottom" places the tooltip below the cursor', async () => {
		const { container } = await render(LinePlot, {
			width: 900,
			height: 500,
			series: [FEMALE, MALE],
			tooltip: {
				sync: false,
				anchorY: 'bottom',
				format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`
			}
		});
		const { cursorY, top } = await hoverCenterAndReadTooltip(container);
		expect(top).toBeGreaterThan(cursorY);
	});
});
