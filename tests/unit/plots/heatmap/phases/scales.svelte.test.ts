import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildHeatmapDefaults } from '$lib/plots/heatmap/defaults';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { row: string; col: string; value: number };

const FLAT: Row[] = [
	{ row: 'X', col: 'A', value: 10 },
	{ row: 'Y', col: 'B', value: -5 },
	{ row: 'X', col: 'B', value: 20 }
];

type Range = { min: number; max: number; mode: 'rescale' | 'filter'; disabledStyle: object };

/** What a heatmap's pipeline leaves for these props, with the legend's range if any. */
function build(props: Record<string, unknown> = {}, range?: Range) {
	return Pipeline.ofAxisKind(buildHeatmapDefaults<Row>()).run(
		{
			width: 400,
			height: 300,
			scales: {},
			segments: {},
			markers: [],
			data: FLAT,
			x: 'col',
			y: 'row',
			color: 'value',
			...props
		},
		{ cfg: DEFAULT_CONFIG, range } as never
	) as unknown as {
		scales: Record<string, { domain?: unknown[]; type?: string; labelAnchor?: string }>;
		resolveColor: (row: Row) => string;
	};
}

describe('heatmap scales - x/y band domains', () => {
	test('collects every distinct category on each axis, in first-seen order', () => {
		const { scales } = build();
		expect(scales.x?.domain).toEqual(['A', 'B']);
		expect(scales.y?.domain).toEqual(['X', 'Y']);
		expect(scales.x?.type).toBe('band');
		expect(scales.y?.type).toBe('band');
	});

	test('the x labels anchor right, the y ones as svelteplot has them', () => {
		const { scales } = build();
		expect(scales.x?.labelAnchor).toBe('right');
		expect(scales.y?.labelAnchor).toBeUndefined();
	});

	test('an explicit scales.x/.y config wins over the computed domain', () => {
		const { scales } = build({ scales: { x: { domain: ['Z'] } } });
		expect(scales.x?.domain).toEqual(['Z']);
	});
});

describe('heatmap scales - value domain', () => {
	test('spans [min(0, dataMin), dataMax] when scales.color.domain is not set', () => {
		const result = build();
		expect(result.scales.color?.domain).toEqual([-5, 20]);
		expect(result.resolveColor(FLAT[2])).not.toBe(result.resolveColor(FLAT[1]));
	});

	test('reaches zero even when every value is above it', () => {
		const result = build({ data: FLAT.map((d) => ({ ...d, value: d.value + 100 })) });
		expect(result.scales.color?.domain).toEqual([0, 120]);
	});

	test('an explicit scales.color.domain wins over the computed one', () => {
		const withExplicit = build({ scales: { color: { domain: [0, 100] } } });
		const withComputed = build();
		// A value of 20 sits near the top of the computed domain but near the
		// bottom of the explicit [0, 100] one - the resulting colors differ.
		expect(withExplicit.resolveColor(FLAT[2])).not.toBe(withComputed.resolveColor(FLAT[2]));
	});
});

describe('heatmap scales - legend range', () => {
	test("'rescale' mode reprojects the color domain onto the narrowed range", () => {
		const full = build();
		const rescaled = build({}, { min: 0, max: 10, mode: 'rescale', disabledStyle: {} });
		expect(full.resolveColor(FLAT[0])).not.toBe(rescaled.resolveColor(FLAT[0]));
	});

	test("'filter' mode leaves the color domain untouched", () => {
		const full = build();
		const filtered = build({}, { min: 0, max: 10, mode: 'filter', disabledStyle: {} });
		expect(full.resolveColor(FLAT[0])).toBe(filtered.resolveColor(FLAT[0]));
	});
});
