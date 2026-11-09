import { FacetPhase } from '$lib/phases/facet/FacetPhase';
import { DataPhase } from '$lib/phases/data/DataPhase';
import { MappingPhase } from '$lib/phases/mapping/MappingPhase';
import { TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import { ContextPhase } from '$lib/phases/context/ContextPhase';
import { StatisticsPhase } from '$lib/phases/statistics/StatisticsPhase';
import { ScalesPhase } from '$lib/phases/scales/ScalesPhase';
import { SharedScalesPhase } from '$lib/phases/sharedScales/SharedScalesPhase';
import { StylesPhase } from '$lib/phases/styles/StylesPhase';
import { MarkersPhase } from '$lib/phases/markers/MarkersPhase';
import { TooltipPhase } from '$lib/phases/tooltip/TooltipPhase';
import { HoverPhase } from '$lib/phases/hover/HoverPhase';
import { HoverSettings } from '$lib/layout/hover/HoverSettings';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type {
	AxisPlotState,
	AxisPlotEnv,
	AxisPlotKind,
	AxisPlotDefaults,
	DataRunState,
	HoverStageOptions,
	PhaseStage,
	PlotPhase,
	ProcessedData
} from '$lib/types/phases';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { LegendState } from '$lib/layout/legend/LegendState.svelte';
import type { HoverStrategy } from '$lib/types/layout/hover';
import type { Accessor } from '$lib/types/plots/data/common';
import type { ChannelName, GroupingAccessor, ResolvedChannel } from '$lib/types/layout/mapping';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisRole } from '$lib/types/phases/data/axes';

/** The core props an axis plot kind seeds its pipeline from. */
export type AxisPipelineProps<TData extends Record<string, unknown>> = {
	series?: unknown[];
	data?: TData[];
	x?: Accessor<TData, unknown>;
	y?: Accessor<TData, unknown>;
	grouping?: GroupingAccessor<TData>;
	color?: Accessor<TData, unknown>;
	opacity?: unknown;
	r?: unknown;
	symbol?: unknown;
	lower?: Accessor<TData, unknown>;
	upper?: Accessor<TData, unknown>;
	error?: Accessor<TData, unknown>;
	target?: unknown;
	ranges?: unknown[];
	value?: Accessor<TData, unknown>;
	segments?: unknown;
	styles?: { gaps?: unknown; values?: unknown };
	scales?: object;
	width?: number;
	height?: number;
	margins?: unknown;
	tooltip?: unknown;
	markers?: unknown[];
	statistics?: unknown[];
	transforms?: unknown[];
};

/** The pipeline state fields `Plot` reads. */
type AxisPlotStateLike = {
	processedData?: ProcessedData;
	markers?: object[];
	channels?: Partial<Record<ChannelName, ResolvedChannel<unknown, unknown> | number>>;
	scales?: AxisBasedScalesConfig<never>;
	[key: string]: unknown;
};

/** What a {@link Pipeline} knows besides its stages: how a run starts and its plot's defaults. */
export type PipelineOptions<TState> = {
	/** The state a run starts from, given its input. Unset, the input is the state. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seed?: (input: any, rows?: unknown[]) => TState;
	/** The plot's hover strategy when neither its `tooltip` nor a hover marker sets one. */
	hoverStrategy?: HoverStageOptions<unknown>['strategy'];
	/** How its plot steps through a timeline, unless the author says otherwise. */
	timeline?: AxisPlotDefaults<never, never>['timeline'];
};

/**
 * A plot's pipeline: its stages, one per phase, in {@link Pipeline.ORDER},
 * and what its plot needs before any of them run - its hover strategy and
 * timeline defaults. Every core of the plot runs it ({@link run}); with a
 * facet, the plot first runs its data phases once over every panel
 * ({@link runData}), and each panel's core runs only the rest.
 *
 * Stages declared out of phase order still run in it - with a warning, once,
 * since the declared order would otherwise read as the one that runs.
 */
export class Pipeline<TState, TEnv = unknown> {
	/**
	 * The phases that work on the plot's rows - everything before its scales,
	 * plus the domains its slices share - in order. They run once over every
	 * facet panel; the rest depend on each panel's own box.
	 */
	static readonly DATA_PHASES: readonly PlotPhase[] = [
		'facet',
		'data',
		'mapping',
		'transforms',
		'context',
		'statistics',
		'sharedScales'
	];

	/** Every {@link PlotPhase}, in the order they run: the data phases, then each panel's own. */
	static readonly ORDER: readonly PlotPhase[] = [
		...Pipeline.DATA_PHASES,
		'scales',
		'styles',
		'markers',
		'coordinates',
		'tooltip',
		'hover'
	];

	// Every axis kind's pipeline, built once per kind object.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static #axisKinds = new WeakMap<object, Pipeline<any, any>>();

	readonly stages: readonly PhaseStage<TState, TEnv>[];
	readonly #options: PipelineOptions<TState>;
	#data: PhaseStage<TState, TEnv>[] | undefined;
	#panel: PhaseStage<TState, TEnv>[] | undefined;

	constructor(stages: PhaseStage<TState, TEnv>[], options: PipelineOptions<TState> = {}) {
		const rank = (phase: PlotPhase) => Pipeline.ORDER.indexOf(phase);
		const ordered = [...stages].sort((a, b) => rank(a.phase) - rank(b.phase));
		if (ordered.some((stage, i) => stage !== stages[i])) {
			console.warn(
				`Pipeline: stages declared as [${stages.map((s) => s.phase).join(', ')}] run in phase order: [${ordered.map((s) => s.phase).join(', ')}].`
			);
		}
		this.stages = ordered;
		this.#options = options;
	}

	/**
	 * An axis-based plot kind's pipeline: the shared stages, each set up with
	 * the kind's own options - its marks and value labels among them - started
	 * from a core's props. Built once per kind object.
	 */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	static ofAxisKind<TState extends AxisPlotState<any, any, any, any>, TEnv extends AxisPlotEnv>(
		kind: AxisPlotKind<TState, TEnv> & Pick<AxisPlotDefaults<any, any>, 'timeline'>
	): Pipeline<TState, TEnv> {
		/* eslint-enable @typescript-eslint/no-explicit-any */
		const cached = Pipeline.#axisKinds.get(kind);
		if (cached) return cached;
		const scales = new ScalesPhase<TState, TEnv>(kind.scales);
		const pipeline = new Pipeline<TState, TEnv>(
			[
				new FacetPhase<TState>(),
				new DataPhase<TState, TEnv>(kind.data),
				new MappingPhase<TState, TEnv>(kind.mapping),
				new TransformsPhase<TState, TEnv>(kind.transforms, kind.data?.segments?.connect),
				new ContextPhase<TState, TEnv>(kind.context),
				new StatisticsPhase<TState>(kind.statistics),
				new SharedScalesPhase<TState, TEnv>(kind.sharedScales, scales),
				scales,
				new StylesPhase<TState, TEnv>(kind.styles),
				new MarkersPhase<TState, TEnv>(kind.markers),
				new TooltipPhase<TState>(),
				new HoverPhase<TState, TEnv>(kind.hover)
			],
			{
				seed: (props, rows) => Pipeline.#axisSeed(props, rows) as TState,
				hoverStrategy: kind.hover?.strategy as PipelineOptions<TState>['hoverStrategy'],
				timeline: kind.timeline
			}
		);
		Pipeline.#axisKinds.set(kind, pipeline);
		return pipeline;
	}

	/** A plot's pipeline from what its kind gives: its axis-kind defaults, or a pipeline of its own. */
	static of(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		defaults: AxisPlotDefaults<any, any> | Pipeline<any, any>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Pipeline<any, any> {
		return defaults instanceof Pipeline ? defaults : Pipeline.ofAxisKind(defaults);
	}

	/** The stage of `phase`, if the pipeline has one. */
	stage(phase: PlotPhase): PhaseStage<TState, TEnv> | undefined {
		return this.stages.find((stage) => stage.phase === phase);
	}

	/**
	 * A core's run: every stage over the state its `input` (an axis core's
	 * props) seeds - or, given `panelState` (one facet panel's part of
	 * {@link runData}), only the stages after the data phases, over that state
	 * with the input's own props (its box, margins and scales) on top.
	 */
	run = (input: unknown, env: TEnv, panelState?: object): TState => {
		const seed = this.#seed(input);
		if (!panelState) return Pipeline.#through(this.stages, seed, env);
		this.#panel ??= this.stages.filter((stage) => !Pipeline.DATA_PHASES.includes(stage.phase));
		return Pipeline.#through(this.#panel, { ...panelState, ...seed } as TState, env);
	};

	/** Whether the pipeline has data phases to run once over every facet panel ({@link runData}). */
	get facets(): boolean {
		return this.stage('facet') !== undefined;
	}

	/**
	 * The data phases over `rows`, seeded from a core's `props`, with the
	 * plot's `facet`: one run that every facet panel then reads its part of,
	 * including the domains its slices share (its "sharedScales" phase).
	 */
	runData(
		props: object,
		rows: unknown[],
		facet: FacetConfig<never> | undefined,
		legendInteraction: LegendState | null,
		cfg: PlotStylesConfig
	): DataRunState {
		this.#data ??= this.stages.filter((stage) => Pipeline.DATA_PHASES.includes(stage.phase));
		const seed = { ...this.#seed(props, rows), facet } as TState;
		return Pipeline.#through(
			this.#data,
			seed,
			Pipeline.#envFor<TEnv>(cfg, legendInteraction)
		) as DataRunState;
	}

	/**
	 * The plot's hover strategy when neither its `tooltip` nor a hover marker
	 * sets one, given its props: the kind's own, or the one its axes ask for,
	 * read after the "data" phase tells them apart.
	 */
	hoverStrategy(props: object, cfg: PlotStylesConfig = DEFAULT_CONFIG): HoverStrategy {
		const fixed = this.#options.hoverStrategy;
		if (fixed !== undefined) return fixed;
		const upToData = this.stages.filter((s) => s.phase === 'data');
		const state = Pipeline.#through(upToData, this.#seed(props), Pipeline.#envFor<TEnv>(cfg, null));
		return HoverSettings.strategyOf((state as { axes?: PlotAxes }).axes);
	}

	/** The plot's default `timeline.filterMode`. */
	get filterMode(): 'exact' | 'upTo' | undefined {
		return this.#options.timeline?.filterMode;
	}

	/**
	 * How the plot tweens its timeline unless `timeline.interpolate` says
	 * otherwise, from the channels its "mapping" phase resolves over
	 * `props.data`: rows matched by the values of whichever `key` channels are
	 * set, `value` tweened. `undefined` when its kind tweens nothing.
	 */
	interpolation<TRow extends Record<string, unknown>>(
		props: { data?: TRow[] },
		cfg: PlotStylesConfig
	): { value: Accessor<TRow, never>; key?: Accessor<TRow, unknown> } | undefined {
		const channels = this.#options.timeline?.interpolation;
		if (!channels || !props.data) return undefined;
		const upToMapping = this.stages.filter((s) => s.phase === 'data' || s.phase === 'mapping');
		// Without a legend: the channels read the same whatever it turns off.
		const state = Pipeline.#through(
			upToMapping,
			this.#seed(props),
			Pipeline.#envFor<TEnv>(cfg, null)
		) as { channels?: Record<string, unknown>; axes?: PlotAxes };
		const channel = (ref: ChannelName | AxisRole) => {
			const name = ref === 'value' || ref === 'category' ? state.axes?.[ref] : ref;
			if (name === undefined) return undefined;
			const c = state.channels?.[name];
			return typeof c === 'object' ? (c as ResolvedChannel<TRow, unknown>) : undefined;
		};
		const value = channel(channels.value)?.source;
		if (value === undefined) return undefined;
		const keys = channels.key
			.map(channel)
			.filter((c): c is ResolvedChannel<TRow, unknown> => c?.source !== undefined);
		const key: Accessor<TRow, unknown> | undefined =
			keys.length > 1
				? (row: TRow) => keys.map((c) => String(c.accessor(row))).join('::')
				: (keys[0]?.source as Accessor<TRow, unknown> | undefined);
		return { value: value as unknown as Accessor<TRow, never>, key };
	}

	/** The state a run starts from. */
	#seed(input: unknown, rows?: unknown[]): TState {
		return this.#options.seed ? this.#options.seed(input, rows) : (input as TState);
	}

	/** `stages` over `state`, in order. */
	static #through<S, C>(stages: readonly PhaseStage<S, C>[], state: S, env: C): S {
		return stages.reduce((acc, stage) => stage.run(acc, env), state);
	}

	/** The context a plot-level run reads, outside any core: the configuration and the legend. */
	static #envFor<C>(cfg: PlotStylesConfig, legendInteraction: LegendState | null): C {
		const interaction = new PlotInteraction(() => cfg, { legend: legendInteraction });
		return { cfg, interaction } as C;
	}

	/**
	 * The state an axis plot's pipeline starts from: its core props, drawing
	 * `rows`. Every kind starts from the same shape; a prop its phases don't
	 * read is simply carried along.
	 */
	static #axisSeed<TData extends Record<string, unknown>>(
		props: AxisPipelineProps<TData>,
		rows: unknown[] | undefined = props.data
	): AxisPlotStateLike {
		return {
			series: props.series,
			data: rows as TData[] | undefined,
			x: props.x,
			y: props.y,
			grouping: props.grouping,
			color: props.color,
			opacity: props.opacity,
			r: props.r,
			symbol: props.symbol,
			lower: props.lower,
			upper: props.upper,
			error: props.error,
			target: props.target,
			ranges: props.ranges,
			value: props.value,
			segments: props.segments ?? {},
			styles: props.styles,
			gaps: props.styles?.gaps,
			values: props.styles?.values,
			scales: (props.scales ?? {}) as AxisBasedScalesConfig<never>,
			width: props.width,
			height: props.height,
			margins: props.margins,
			tooltip: props.tooltip,
			authorMarkers: props.markers ?? [],
			statistics: props.statistics ?? [],
			transforms: props.transforms ?? []
		};
	}
}
