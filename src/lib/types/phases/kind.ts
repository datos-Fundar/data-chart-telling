import type { DataStageOptions } from './data/phase';
import type { MappingStageOptions } from './mapping/phase';
import type { TransformsStageOptions, TransformsStageState } from './transforms/phase';
import type { StatisticsStageOptions, StatisticsStageState } from './statistics/phase';
import type { ScalesStageOptions } from './scales/phase';
import type { HoverStageOptions } from './hover/phase';
import type { ContextStageOptions } from './context/phase';
import type { StylesStageOptions } from './styles/phase';
import type { MarkersStageOptions } from './markers/phase';
import type { AxisChannelName, ChannelName } from '$lib/types/layout/mapping';
import type { AxisRole } from '$lib/types/phases/data/axes';

/**
 * What one axis-based plot kind adds to the shared pipeline: options for each
 * shared stage - its own marks and value labels among them.
 */
export type AxisPlotKind<TState extends TransformsStageState & StatisticsStageState, TEnv> = {
	data?: DataStageOptions<TState, TEnv>;
	mapping?: MappingStageOptions<TState, TEnv>;
	transforms?: TransformsStageOptions<TState, TEnv>;
	/** What the kind works out for each of its rows, for everything that writes about a row to read - see `RowContext`. */
	context?: ContextStageOptions<TState, TEnv>;
	statistics?: StatisticsStageOptions<TState>;
	scales?: ScalesStageOptions<TState, TEnv>;
	styles?: StylesStageOptions<TState>;
	markers: MarkersStageOptions<TState, TEnv>;
	hover?: HoverStageOptions<TState, TEnv>;
	/**
	 * How the slices of a plot (facet panels, timeline steps) share their
	 * domains. Every axis kind shares them - bands from its axes, zero from its
	 * "scales" options - so this is only for what those can't say.
	 */
	sharedScales?: SharedScalesOptions;
};

/** How a plot kind shares its domains across slices, beyond what its axes and "scales" options say. */
export type SharedScalesOptions = {
	/**
	 * Channels whose shared domain is the one the kind's own "scales" phase sets
	 * over the rows that share it - for a domain nothing else can describe, like
	 * a heatmap's color ramp. A symmetric axis always takes its domain this way.
	 */
	fromScalesPhase?: (AxisChannelName | 'color')[];
};

/**
 * Everything an axis plot kind contributes, as defaults the shared machinery
 * runs with: the options for each pipeline phase (its hover among them),
 * plus how its plot tweens a timeline unless the author says otherwise.
 */
export type AxisPlotDefaults<
	TState extends TransformsStageState & StatisticsStageState,
	TEnv
> = AxisPlotKind<TState, TEnv> & {
	timeline?: {
		/** Default for `timeline.filterMode`. */
		filterMode?: 'exact' | 'upTo';
		/**
		 * The channels a tweened timeline tweens (`value`) and matches rows across
		 * steps by (`key`) - by name, or by the part an axis plays (`'value'`,
		 * `'category'`), whichever way the plot runs.
		 */
		interpolation?: { value: ChannelName | AxisRole; key: (ChannelName | AxisRole)[] };
	};
};
