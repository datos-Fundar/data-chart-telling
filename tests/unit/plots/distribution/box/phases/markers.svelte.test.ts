import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import type { BoxMarkerConfig } from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The box plot's own `box` markers, from running its whole pipeline over `props`. */
function boxesOf(props: Row, legend: LegendState | null = null): BoxMarkerConfig[] {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	const state = Pipeline.ofAxisKind(buildBoxDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { markers: { type: string }[] };
	return state.markers.filter((m): m is BoxMarkerConfig => m.type === 'box');
}

const rows = ['a', 'b'].flatMap((c, i) =>
	[1, 2, 3, 4, 5].map((v) => ({ c, v: v + i, g: i ? 'B' : 'A' }))
);

describe('BoxPlot markers', () => {
	test('one box marker per series, filled with its series color at the configured opacity', () => {
		const boxes = boxesOf({ data: rows, x: 'c', y: 'v', color: 'g' });
		expect(boxes.map((b) => b.series)).toEqual(['A', 'B']);
		expect(boxes[0].bar?.fill).not.toBe(boxes[1].bar?.fill);
		expect(boxes.every((b) => b.bar?.fillOpacity === DEFAULT_CONFIG.box.fillOpacity)).toBe(true);
	});

	test('a series the legend dims takes the disabled opacity', () => {
		const legend = new LegendState();
		legend.turnOff('B', { mode: 'dim' });
		const [a, b] = boxesOf({ data: rows, x: 'c', y: 'v', color: 'g' }, legend);
		expect(a.bar?.fillOpacity).toBe(DEFAULT_CONFIG.box.fillOpacity);
		expect(b.bar?.fillOpacity).toBe(DEFAULT_CONFIG.legend.disabledOpacity);
	});

	test('a segment restyles only the boxes of the categories it covers', () => {
		const boxes = boxesOf({
			data: rows,
			x: 'c',
			y: 'v',
			segments: { default: [{ areas: [{ x: { from: 'b', to: 'b' } }], styles: { fill: 'red' } }] }
		});
		expect(boxes).toHaveLength(2);
		const red = boxes.find((b) => b.bar?.fill === 'red')!;
		expect(new Set((red.data as Row[]).map((r) => r.c))).toEqual(new Set(['b']));
	});
});
