import { describe, test, expect } from 'vitest';
import { Pipeline } from '$lib/phases/Pipeline';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildFacetPanels } from '$lib/layout/facet/config';
import type { FacetConfig } from '$lib/types/layout/facet';

type Row = { anio: number; region: string; valor: number };

// Norte tops out at 10, Sur at 100.
const ROWS: Row[] = ['Norte', 'Sur'].flatMap((region, r) =>
	[2021, 2022, 2023].map((anio, a) => ({ anio, region, valor: (a + 1) * (r ? 33 : 3) }))
);

const run = (facet: FacetConfig<Row>, holdFree?: ('x' | 'y')[]) => {
	const props = { x: 'anio', y: 'valor', color: 'region', data: ROWS, width: 400, height: 300 };
	const { sharedScales } = Pipeline.ofAxisKind(buildLineDefaults<Row>()).runData(
		props,
		ROWS,
		facet as never,
		null,
		DEFAULT_CONFIG,
		holdFree
	) as { sharedScales: Record<string, { y?: { domain: number[] } }> };
	return sharedScales;
};

describe('holdFree on a wrapped facet', () => {
	const facet: FacetConfig<Row> = { by: 'region', scales: 'free-y' };
	const keys = buildFacetPanels(facet, ROWS).map((p) => p.key);

	test('a free y has no shared domain unless held', () => {
		for (const key of keys) expect(run(facet)[key]?.y).toBeUndefined();
	});

	test('a held free y gives each panel its own extent over every row', () => {
		const shared = run(facet, ['y']);
		const tops = keys.map((key) => shared[key]?.y?.domain.at(-1) ?? 0);
		expect(tops[0]).toBeGreaterThanOrEqual(9);
		expect(tops[0]).toBeLessThan(tops[1]);
		expect(tops[1]).toBeGreaterThanOrEqual(99);
	});

	test('an axis that is not free stays shared by every panel', () => {
		const shared = run({ by: 'region' }, ['y']);
		expect(shared[keys[0]]?.y?.domain).toEqual(shared[keys[1]]?.y?.domain);
	});
});
