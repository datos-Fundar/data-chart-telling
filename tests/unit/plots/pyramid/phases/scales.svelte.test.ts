import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildPyramidDefaults } from '$lib/plots/pyramid/defaults';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { ageGroup: string; pct: number | null; sex: string };

const ROWS: Row[] = [
	{ ageGroup: '0-4', pct: 10, sex: 'Female' },
	{ ageGroup: '5-9', pct: 8, sex: 'Female' },
	{ ageGroup: '0-4', pct: 12, sex: 'Male' },
	{ ageGroup: '5-9', pct: 9, sex: 'Male' }
];

/** The scales a pyramid's pipeline leaves for these props: horizontal, categories on `y`, unless told otherwise. */
function build(props: Record<string, unknown> = {}) {
	const state = Pipeline.ofAxisKind(buildPyramidDefaults<Row>()).run(
		{
			width: 400,
			height: 300,
			scales: {},
			segments: {},
			markers: [],
			data: ROWS,
			x: 'pct',
			y: 'ageGroup',
			color: 'sex',
			...props
		},
		{ cfg: DEFAULT_CONFIG }
	) as {
		scales: Record<
			string,
			{ domain?: unknown[]; type?: string; padding?: number; tickFormat?: (v: unknown) => string }
		>;
	};
	return state.scales;
}

describe('pyramid scales - diverging magnitude domain', () => {
	test('spans [-maxMagnitude, maxMagnitude] over every series', () => {
		expect(build().x?.domain).toEqual([-12, 12]);
	});

	test('a gap-filled row contributes its filled value instead of being skipped', () => {
		const result = build({
			data: [
				{ ageGroup: '0-4', pct: null, sex: 'Female' },
				{ ageGroup: '5-9', pct: 10, sex: 'Female' }
			],
			// The missing first row eases from 40 down to the 10 after it: halfway, 25.
			styles: { gaps: { default: { start: { y: 40 } } } }
		});
		expect(result.x?.domain).toEqual([-25, 25]);
	});

	test('defaults to [-1, 1] when there is no real or filled data', () => {
		// With no rows to tell the axes apart, the author says which holds the categories.
		expect(build({ data: [], scales: { y: { type: 'band' } } }).x?.domain).toEqual([-1, 1]);
	});

	test('both sides read as magnitudes on the axis', () => {
		expect(build().x?.tickFormat?.(-12)).toBe('12');
	});

	test('an explicit scales.x config wins over the computed domain', () => {
		expect(build({ scales: { x: { domain: [-100, 100] } } }).x?.domain).toEqual([-100, 100]);
	});

	test('the magnitude axis follows the orientation: y when the categories run along x', () => {
		const result = build({ x: 'ageGroup', y: 'pct' });
		expect(result.y?.domain).toEqual([-12, 12]);
		expect(result.y?.tickFormat?.(-12)).toBe('12');
	});
});

describe('pyramid scales - category domain', () => {
	test('is a padded band scale over every distinct category, in first-seen order', () => {
		const result = build();
		expect(result.y?.type).toBe('band');
		expect(result.y?.padding).toBe(0.2);
		expect(result.y?.domain).toEqual(['0-4', '5-9']);
	});

	test('keeps the order the data gives, where an ascending sort would not', () => {
		const result = build({
			data: [
				{ ageGroup: '5-9', pct: 8, sex: 'Female' },
				{ ageGroup: '10-14', pct: 9, sex: 'Female' }
			]
		});
		expect(result.y?.domain).toEqual(['5-9', '10-14']);
	});

	test('an explicit scales.y domain wins over the computed one', () => {
		expect(build({ scales: { y: { domain: ['5-9', '0-4'] } } }).y?.domain).toEqual(['5-9', '0-4']);
	});
});
