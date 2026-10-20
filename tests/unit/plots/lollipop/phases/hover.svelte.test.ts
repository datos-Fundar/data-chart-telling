import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildLollipopDefaults } from '$lib/plots/lollipop/defaults';
import type { HoverConfig } from '$lib/types/plots/props';

type Row = Record<string, unknown>;

/** The lollipop plot's resolved hover, from running its whole pipeline over `props`. */
function hoverOf(props: Row) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	return Pipeline.ofAxisKind(buildLollipopDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], tooltip: {}, ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { hover: HoverConfig<Row> };
}

const rows = [
	{ c: 'a', v: 4 },
	{ c: 'b', v: 9 }
];

describe('LollipopPlot hover', () => {
	test('upright lollipops hover along the category axis, one point per dot', () => {
		const { hover } = hoverOf({ data: rows, x: 'c', y: 'v' });
		expect(hover.strategy).toBe('x');
		expect(hover.points.map((p) => [p.x, p.y])).toEqual([
			['a', 4],
			['b', 9]
		]);
	});

	test('sideways lollipops hover along y', () => {
		const { hover } = hoverOf({ data: rows, x: 'v', y: 'c' });
		expect(hover.strategy).toBe('y');
		expect(hover.points.map((p) => [p.x, p.y])).toEqual([
			[4, 'a'],
			[9, 'b']
		]);
	});
});
