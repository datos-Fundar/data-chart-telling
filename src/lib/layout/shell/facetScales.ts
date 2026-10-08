import { runStages } from '$lib/layout/phases/stages';
import { processedValues } from '$lib/layout/phases/scales';
import { markerAxisValues } from '$lib/utils/markerAxisValues';
import { groupBy } from '$lib/utils/grouping';
import { buildFacetGridGroups, isFacetWrap } from '$lib/layout/facet/config';
import type { FacetConfig, FacetEdges } from '$lib/types/layout/facet';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { PhaseStage, PlotPhase, ProcessedData } from '$lib/types/layout/phases';
import type { FacetAxisValues } from '$lib/types/plots/presentation';

/** Natural ascending order, as svelteplot sorts a band domain. */
function ascending(a: unknown, b: unknown): number {
	return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
}

/** The phases that place a facet's rows - everything before its scales. */
const PLACING_PHASES: ReadonlySet<PlotPhase> = new Set([
	'data',
	'mapping',
	'transforms',
	'statistics'
]);

/** A plot kind's `facetAxisValues`: every x/y value one facet's rows and derived markers sit at, after the transforms. */
export function buildFacetAxisValues<
	TRow,
	TState extends { processedData?: ProcessedData; markers?: object[] },
	TCtx
>(args: {
	stages: PhaseStage<TState, TCtx>[];
	state: (rows: TRow[]) => TState;
	ctx: TCtx;
	/** The axes laid out as bands (categories) for this state. */
	band?: (state: TState) => AxisChannelName[];
	/** The axes whose domain must include zero (a bar's value axis) for this state. */
	zero?: (state: TState) => AxisChannelName[];
}): (rows: TRow[]) => FacetAxisValues {
	const stages = args.stages.filter((stage) => PLACING_PHASES.has(stage.phase));
	return (rows) => {
		const state = runStages(stages, args.state(rows), args.ctx);
		const values = (axis: AxisChannelName) => [
			...processedValues(state.processedData, axis),
			...markerAxisValues(state.markers ?? [], axis)
		];
		return {
			x: values('x'),
			y: values('y'),
			band: args.band?.(state) ?? [],
			zero: args.zero?.(state) ?? []
		};
	};
}

/** One axis' domain over every facet: sorted values on a band axis, `[min, max]` otherwise, or `undefined`. */
export function buildSharedAxisScale(
	facets: FacetAxisValues[],
	axis: AxisChannelName
): { domain: unknown[]; nice?: boolean } | undefined {
	const values = facets
		.flatMap((facet) => facet[axis])
		.filter((v) => v != null && v !== '' && !(typeof v === 'number' && !Number.isFinite(v)));
	if (!values.length) return undefined;
	if (facets.some((facet) => facet.band.includes(axis))) {
		return { domain: [...new Set(values)].sort(ascending) };
	}
	if (values.every((v) => typeof v === 'number')) {
		const numbers = facets.some((facet) => facet.zero.includes(axis))
			? [...(values as number[]), 0]
			: (values as number[]);
		return { domain: [Math.min(...numbers), Math.max(...numbers)], nice: true };
	}
	if (values.every((v) => v instanceof Date)) {
		const times = (values as Date[]).map((d) => +d);
		return { domain: [new Date(Math.min(...times)), new Date(Math.max(...times))] };
	}
	return { domain: [...new Set(values)].sort(ascending) };
}

/** What a facet cell knows about where it sits - the shape both facet layouts hand their cells. */
type FacetCellPlace = { facetValue: string; row?: string; col?: string; edges: FacetEdges };

/** A cell's x/y scale overrides: a shared domain, whether its axis draws, and how its title reads. */
export type FacetCellScales = Partial<
	Record<
		AxisChannelName,
		{
			domain?: unknown[];
			nice?: boolean;
			axisDisplay?: 'none';
			labelOrientation?: 'vertical';
		}
	>
>;

/**
 * Each facet cell's x/y scale overrides from `facet.scales` and `facet.axes`:
 * shared axes get one domain over the facets that share them (over all
 * `rows`, so a timeline keeps the frame); with `axes: 'outer'`, inner shared
 * axes aren't drawn, and a drawn y axis' title runs vertically beside it,
 * centered on the facet's own height.
 */
export function buildFacetCellScales<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>,
	rows: TRow[],
	facetAxisValues: ((rows: TRow[]) => FacetAxisValues) | undefined
): (place: FacetCellPlace) => FacetCellScales | undefined {
	const mode = facet.scales ?? 'shared';
	const grid = !isFacetWrap(facet);
	const lineOf = (axis: AxisChannelName): 'all' | 'row' | 'col' | null => {
		const free = mode === 'free' || mode === `free-${axis}`;
		if (!free) return 'all';
		if (!grid) return null;
		return axis === 'x' ? 'col' : 'row';
	};
	const lines = { x: lineOf('x'), y: lineOf('y') };

	const groups = facetGroups(facet, rows);
	const values = facetAxisValues ? groups.map((group) => facetAxisValues(group.rows)) : [];
	const domains = new Map<string, ReturnType<typeof buildSharedAxisScale>>();
	const domainFor = (axis: AxisChannelName, place: FacetCellPlace) => {
		const line = lines[axis];
		if (!line || !facetAxisValues) return undefined;
		const key = line === 'all' ? '' : (place[line] ?? '');
		const cacheKey = `${axis}\u0000${key}`;
		if (!domains.has(cacheKey)) {
			const members = values.filter((_, i) => line === 'all' || groups[i][line] === key);
			domains.set(cacheKey, buildSharedAxisScale(members, axis));
		}
		return domains.get(cacheKey);
	};

	const outer = facet.axes === 'outer';
	return (place) => {
		const out: FacetCellScales = {};
		for (const axis of ['x', 'y'] as const) {
			const shared = domainFor(axis, place);
			const hidden =
				outer && lines[axis] !== null && !(axis === 'x' ? place.edges.bottom : place.edges.left);
			const vertical = outer && axis === 'y' && !hidden;
			if (!shared && !hidden && !vertical) continue;
			out[axis] = {
				...shared,
				...(hidden ? { axisDisplay: 'none' as const } : {}),
				...(vertical ? { labelOrientation: 'vertical' as const } : {})
			};
		}
		return Object.keys(out).length ? out : undefined;
	};
}

/** Every facet's rows, keyed the way the facet layouts key their cells. */
function facetGroups<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>,
	rows: TRow[]
): { rows: TRow[]; row?: string; col?: string }[] {
	if (isFacetWrap(facet)) {
		const groups = groupBy(rows, facet.by);
		const keys = facet.values ? facet.values.filter((v) => groups.has(v)) : [...groups.keys()];
		return keys.map((key) => ({ rows: groups.get(key)! }));
	}
	return [...buildFacetGridGroups(rows, facet.rows, facet.cols).values()].filter(
		(group) =>
			(!facet.rowValues || facet.rowValues.includes(group.row!)) &&
			(!facet.colValues || facet.colValues.includes(group.col!))
	);
}
