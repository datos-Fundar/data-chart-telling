import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { ScalesPhase } from '$lib/phases/scales/ScalesPhase';
import { Pipeline } from '$lib/phases/Pipeline';
import { PANEL_KEY, FacetPhase } from '$lib/phases/facet/FacetPhase';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import { isFacetWrap } from '$lib/layout/facet/config';
import { MarkerAxisValues } from '$lib/phases/scales/MarkerAxisValues';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type {
	FacetStageState,
	PhaseStage,
	ProcessedData,
	SharedAxisValues,
	SharedScalesOptions
} from '$lib/types/phases';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';

/** A channel slices can share a domain on. */
type SharedChannel = AxisChannelName | 'color';

/** One channel's shared scale: its domain, and whether svelteplot may still round it. */
type SharedScale = { domain: unknown[]; nice?: boolean } | undefined;

/** Natural ascending order, as svelteplot sorts a band domain. */
function ascending(a: unknown, b: unknown): number {
	return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
}

/** The state the "shared scales" step reads: a data run's output, over every panel. */
type SharedScalesState = FacetStageState & {
	axes?: PlotAxes;
	processedData?: ProcessedData;
	markers?: object[];
	scales?: Partial<Record<AxisChannelName, { niceTolerance?: number }>>;
	sharedScales?: Record<string, AxisBasedScalesConfig<never>>;
};

/**
 * The "sharedScales" phase, the last of the data phases: the figure-wide part
 * of scales - the domains every slice shares, as `sharedScales` keyed by facet panel
 * (`''` for the whole run without a facet). Each shared x/y domain spans
 * where the sharing panels' rows and markers sit (as bands, or from zero, as
 * the kind's axes and "scales" say), grouped by `facet.scales`; each `fromScalesPhase` channel
 * takes the domain the kind's own "scales" phase sets over
 * those panels. A panel's own "scales" phase only sees its rows, so this
 * can't happen there. Without options, a kind still shares its domains: it just
 * has no bands and nothing that starts from zero.
 */
export class SharedScalesPhase<TState extends SharedScalesState, TCtx> implements PhaseStage<
	TState,
	TCtx
> {
	readonly phase = 'sharedScales' as const;
	readonly #options: SharedScalesOptions | undefined;
	readonly #kindScales: Pipeline<TState, TCtx>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly #scales: ScalesPhase<any, any>;

	constructor(
		options: SharedScalesOptions | undefined,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		scales: ScalesPhase<any, any> = new ScalesPhase()
	) {
		this.#options = options;
		this.#scales = scales;
		this.#kindScales = new Pipeline<TState, TCtx>([scales as PhaseStage<TState, TCtx>]);
	}

	run = (state: TState, ctx: TCtx): TState => {
		const facet = state.facet as FacetConfig<Record<string, unknown>> | undefined;
		const panels = facet ? (state.panels ?? []) : [];
		// A symmetric axis has no domain but the one the kind's "scales" phase gives it.
		const fromPhase = new Set<SharedChannel>([
			...(this.#options?.fromScalesPhase ?? []),
			...this.#scales.symmetricAxes(state)
		]);
		const layout = {
			band: [...(state.axes?.bands ?? [])],
			zero: this.#scales.zeroAxes(state),
			dataOrder: this.#scales.keepsDataOrder
		};
		const channels: SharedChannel[] = fromPhase.has('color') ? ['x', 'y', 'color'] : ['x', 'y'];

		/** The channel's domain over `members` panels, or every row without them. */
		const domainOver = (channel: SharedChannel, members: string[] | undefined): SharedScale => {
			if (fromPhase.has(channel)) {
				const scoped = members ? FacetPhase.narrowToPanels(state, members) : state;
				const scales = (this.#kindScales.run(scoped, ctx) as { scales?: unknown }).scales as
					| Record<string, { domain?: unknown[] } | undefined>
					| undefined;
				const domain = scales?.[channel]?.domain;
				return domain === undefined ? undefined : { domain };
			}
			if (channel === 'color') return undefined;
			const values = members
				? members.map((panel) => SharedScalesPhase.buildPanelAxisValues(state, panel, layout))
				: [SharedScalesPhase.buildPanelAxisValues(state, undefined, layout)];
			return SharedScalesPhase.buildSharedAxisScale(
				values,
				channel,
				state.scales?.[channel]?.niceTolerance
			);
		};

		const cache = new Map<string, SharedScale>();
		const scalesOf = (place: { row?: string; col?: string } | undefined) => {
			const out: Record<string, SharedScale> = {};
			for (const channel of channels) {
				const line = SharedScalesPhase.#sharingLine(facet, channel);
				if (!line) continue;
				const key = line === 'all' ? '' : (place?.[line] ?? '');
				const cacheKey = `${channel}\u0000${key}`;
				if (!cache.has(cacheKey)) {
					const members = panels.length
						? panels.filter((p) => line === 'all' || p[line] === key).map((p) => p.key)
						: undefined;
					// Every panel sharing a phase-derived domain is the whole run, as it was built.
					const whole = line === 'all' && fromPhase.has(channel);
					cache.set(cacheKey, domainOver(channel, whole ? undefined : members));
				}
				const scale = cache.get(cacheKey);
				if (scale) out[channel] = scale;
			}
			return Object.keys(out).length ? (out as AxisBasedScalesConfig<never>) : undefined;
		};

		const sharedScales: Record<string, AxisBasedScalesConfig<never>> = {};
		const add = (key: string, scales: AxisBasedScalesConfig<never> | undefined) => {
			if (scales) sharedScales[key] = scales;
		};
		if (panels.length) for (const panel of panels) add(panel.key, scalesOf(panel));
		else add('', scalesOf(undefined));
		return { ...state, sharedScales };
	};

	/**
	 * One axis' domain over some slices: sorted values on a band axis, `[min, max]`
	 * otherwise, or `undefined`. A numeric extent is niced here, once, so every
	 * slice gets the exact same domain - svelteplot's own `nice` rounds by a tick
	 * count derived from each panel's height, which over-rounds short panels and
	 * can disagree between panels of different heights.
	 */
	static buildSharedAxisScale(
		slices: SharedAxisValues[],
		axis: AxisChannelName,
		niceTolerance?: number
	): SharedScale {
		const values = slices
			.flatMap((slice) => slice[axis])
			.filter((v) => v != null && v !== '' && !(typeof v === 'number' && !Number.isFinite(v)));
		if (!values.length) return undefined;
		if (slices.some((slice) => slice.band.includes(axis))) {
			const distinct = [...new Set(values)];
			return {
				domain: slices.some((slice) => slice.dataOrder) ? distinct : distinct.sort(ascending)
			};
		}
		if (values.every((v) => typeof v === 'number')) {
			const numbers = slices.some((slice) => slice.zero.includes(axis))
				? [...(values as number[]), 0]
				: (values as number[]);
			const lo = Math.min(...numbers);
			const hi = Math.max(...numbers);
			return { domain: NiceTicks.domain(lo, hi, 10, niceTolerance), nice: false };
		}
		if (values.every((v) => v instanceof Date)) {
			const times = (values as Date[]).map((d) => +d);
			return { domain: [new Date(Math.min(...times)), new Date(Math.max(...times))] };
		}
		return { domain: [...new Set(values)].sort(ascending) };
	}

	/**
	 * Where one panel's rows and markers sit on each axis, read off a pipeline
	 * run over every panel - or, without a `panel`, where all of them sit.
	 */
	static buildPanelAxisValues(
		state: { processedData?: ProcessedData; markers?: object[] },
		panel: string | undefined,
		layout: { band?: AxisChannelName[]; zero?: AxisChannelName[]; dataOrder?: boolean } = {}
	): SharedAxisValues {
		const inPanel = (tagged: unknown) => panel === undefined || tagged === panel;
		const processed = state.processedData && {
			...state.processedData,
			data: state.processedData.data.filter((row) => inPanel(row[PANEL_KEY]))
		};
		const markers = (state.markers ?? []).filter((marker) =>
			inPanel((marker as Record<string, unknown>)[PANEL_KEY])
		);
		const values = (axis: AxisChannelName) => [
			...ScalesPhase.processedValues(processed, axis),
			...MarkerAxisValues.of(markers as never[], axis)
		];
		return {
			x: values('x'),
			y: values('y'),
			band: layout.band ?? [],
			zero: layout.zero ?? [],
			dataOrder: layout.dataOrder
		};
	}

	/**
	 * Which slices share a channel's domain under `facet.scales`: every one, the
	 * panels on one column (x) or row (y) of a `rows`/`cols` grid, or none (a
	 * free axis of a wrapped facet). Color is shared by every slice.
	 */
	static #sharingLine(
		facet: FacetConfig<Record<string, unknown>> | undefined,
		channel: SharedChannel
	): 'all' | 'row' | 'col' | null {
		if (!facet || channel === 'color') return 'all';
		const mode = facet.scales ?? 'shared';
		if (mode !== 'free' && mode !== `free-${channel}`) return 'all';
		if (isFacetWrap(facet)) return null;
		return channel === 'x' ? 'col' : 'row';
	}
}
