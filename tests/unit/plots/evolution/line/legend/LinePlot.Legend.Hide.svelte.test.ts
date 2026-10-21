import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY
} from '../../../../../../stories/plots/evolution/line/data';
import type { LegendDisabledAction, LegendSection } from '$lib/types/layout/legend';

// `disabled: { mode: 'hide' }` makes a toggled-off series fully transparent but
// keeps it in the plot, so the axes keep their range - unlike `'omit'`.

function legend(disabled: LegendDisabledAction): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Sex',
			interactive: { enabled: true, disabled },
			items: [
				{ name: 'female', label: 'Female', symbol: 'line' },
				{ name: 'male', label: 'Male', symbol: 'line' }
			]
		}
	];
}

async function renderPlot(disabled: LegendDisabledAction) {
	const { container } = await render(LinePlot, {
		width: 950,
		height: 400,
		series: [
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY }
		],
		legend: legend(disabled)
	});
	await vi.waitFor(() => {
		if (container.querySelectorAll('g.lines path').length !== 2)
			throw new Error('plot not yet rendered');
	});
	return container;
}

const lines = (container: Element) => [
	...container.querySelectorAll<SVGPathElement>('g.lines path')
];
const yTicks = (container: Element) =>
	[...container.querySelectorAll('.axis-y text')].map((t) => t.textContent);

function toggleFemale(container: Element): void {
	const item = [...container.querySelectorAll<HTMLElement>('[role="button"]')].find((el) =>
		el.textContent?.includes('Female')
	);
	if (!item) throw new Error('legend item "Female" not found');
	item.click();
}

describe("LinePlot - legend `disabled: { mode: 'hide' }`", () => {
	test('a hidden series turns fully transparent but stays drawn, and the y-axis keeps its range', async () => {
		const container = await renderPlot({ mode: 'hide' });
		const ticksBefore = yTicks(container);

		toggleFemale(container);
		await vi.waitFor(() => {
			const hidden = lines(container).filter((p) =>
				p.getAttribute('style')?.match(/stroke-opacity: 0(;|$)/)
			);
			if (hidden.length !== 1) throw new Error('female line not yet hidden');
		});

		expect(lines(container)).toHaveLength(2);
		expect(yTicks(container)).toEqual(ticksBefore);
	});

	test("unlike 'omit', which drops the series and rescales the y-axis", async () => {
		const container = await renderPlot({ mode: 'omit' });
		const ticksBefore = yTicks(container);

		toggleFemale(container);
		await vi.waitFor(() => {
			if (lines(container).length !== 1) throw new Error('female line not yet omitted');
		});

		expect(yTicks(container)).not.toEqual(ticksBefore);
	});
});
