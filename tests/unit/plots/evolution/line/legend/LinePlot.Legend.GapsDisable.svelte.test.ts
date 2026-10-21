import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import {
	FEMALE_LIFE_EXPECTANCY_WITH_GAPS,
	MALE_LIFE_EXPECTANCY_WITH_GAPS
} from '../../../../../../stories/plots/evolution/line/data';
import type { LegendSection } from '$lib/types/layout/legend';

// Reproduces the reported bug: clicking a legend item to "disable" a series
// (`DiscreteSection.svelte`'s interactive toggle) must dim that series' gap
// bridge (`styles.gaps` bridge, drawn by `buildGapMarkers.ts`) the same way
// it already dims the series' real line - before the fix, the bridge stayed
// at full opacity regardless of the legend state.

const LEGEND: LegendSection[] = [
	{
		type: 'discrete',
		title: 'Sex',
		interactive: { enabled: true },
		items: [
			{ name: 'female', label: 'Female', symbol: 'line' },
			{ name: 'male', label: 'Male', symbol: 'line' }
		]
	}
];

/** The plot with both series' gap bridges and the interactive legend above. */
function renderPlot() {
	return render(LinePlot, {
		width: 950,
		height: 400,
		series: [
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY_WITH_GAPS }
		],
		styles: { gaps: { default: { middle: {} } } },
		legend: LEGEND
	});
}

// Returns the first `<svg>` that isn't one of the legend's own icons - the
// swatch (`dct-discrete__swatch`) or, since this section is
// `interactive: { enabled: true }`, the badge's eye icon
// (`dct-discrete__eye`) - both of which mount before `LinePlot`'s own `<svg>`,
// unlike every other Plot-level test that renders exactly one `<svg>`.
async function waitForPlotSvg(container: Element): Promise<SVGElement> {
	let svg: SVGElement | undefined;
	await vi.waitFor(
		() => {
			svg = Array.from(container.querySelectorAll('svg')).find(
				(s) =>
					!s.classList.contains('dct-discrete__swatch') &&
					!s.classList.contains('dct-discrete__eye')
			);
			if (!svg) throw new Error('plot SVG not yet rendered');
		},
		{ timeout: 3000, interval: 50 }
	);
	return svg!;
}

// See `LinePlot.Styles.Gaps.svelte.test.ts` for why a bridge path (25
// sampled points) is told apart from a real line path (1-2 points) by its
// `d` attribute's `L`-command count.
function bridgePaths(svg: SVGElement): SVGPathElement[] {
	return Array.from(svg.querySelectorAll<SVGPathElement>('g.lines path')).filter(
		(p) => (p.getAttribute('d')?.match(/L/g)?.length ?? 0) > 10
	);
}

describe("LinePlot - legend click dims a series' gap bridge", () => {
	test('disabling "Female" via the legend dims its bridge to the legend disabledOpacity', async () => {
		const { container } = await renderPlot();
		const svg = await waitForPlotSvg(container);

		// Baseline: neither series is disabled - both bridges sit at the plain
		// gap default opacity (0.6, cfg.line.gap.stroke.strokeOpacity).
		const before = bridgePaths(svg).map((p) => p.getAttribute('style') ?? '');
		expect(before).toHaveLength(2);
		expect(before.every((s) => s.includes('stroke-opacity: 0.6'))).toBe(true);

		const femaleItem = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]')).find(
			(el) => el.textContent?.includes('Female')
		);
		expect(femaleItem).toBeTruthy();
		femaleItem!.click();

		await vi.waitFor(() => {
			const dimmed = bridgePaths(svg).some((p) =>
				p.getAttribute('style')?.includes('stroke-opacity: 0.12')
			);
			if (!dimmed) throw new Error('bridge not yet dimmed');
		});

		const after = bridgePaths(svg).map((p) => p.getAttribute('style') ?? '');
		expect(after).toHaveLength(2);
		// female's bridge dims to the shared legend `disabledOpacity` (0.12) -
		// same value its real line already dims to.
		expect(after.some((s) => s.includes('stroke-opacity: 0.12'))).toBe(true);
		// male, left enabled, keeps its bridge at the plain gap default.
		expect(after.some((s) => s.includes('stroke-opacity: 0.6'))).toBe(true);
	});

	test('re-clicking to re-enable the series restores its bridge opacity', async () => {
		const { container } = await renderPlot();
		const svg = await waitForPlotSvg(container);
		const femaleItem = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]')).find(
			(el) => el.textContent?.includes('Female')
		)!;

		femaleItem.click();
		await vi.waitFor(() => {
			const dimmed = bridgePaths(svg).some((p) =>
				p.getAttribute('style')?.includes('stroke-opacity: 0.12')
			);
			if (!dimmed) throw new Error('bridge not yet dimmed');
		});

		femaleItem.click();
		await vi.waitFor(() => {
			const stillDimmed = bridgePaths(svg).some((p) =>
				p.getAttribute('style')?.includes('stroke-opacity: 0.12')
			);
			if (stillDimmed) throw new Error('bridge still dimmed');
		});

		const opacities = bridgePaths(svg).map((p) => p.getAttribute('style') ?? '');
		expect(opacities.every((s) => s.includes('stroke-opacity: 0.6'))).toBe(true);
	});
});
