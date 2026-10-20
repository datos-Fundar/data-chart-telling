import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { HoverPoint, HoverStrategy } from '$lib/types/layout/hover';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { HoverConfig, PointMatchingStrategy, TooltipConfig } from '$lib/types/plots/props';

/**
 * A plot's hover as its `tooltip` and hover marker set it up: whether it is on,
 * how it matches points and whether it syncs across plots.
 */
export class HoverSettings<TRow extends Record<string, unknown>> {
	/** The tooltip, or `undefined` when off. */
	readonly tooltip: TooltipConfig<TRow> | undefined;
	/** Whether anything hovers: a tooltip or a hover marker. */
	readonly active: boolean;
	readonly strategy: HoverStrategy;
	readonly sync: boolean;

	constructor(
		tooltip: TooltipProp<TRow> | TooltipConfig<TRow> | undefined,
		markers: { type: string }[] | undefined,
		defaultStrategy: HoverStrategy
	) {
		this.tooltip = !tooltip
			? undefined
			: tooltip === true
				? { sync: false }
				: { ...tooltip, sync: tooltip.sync ?? false };
		const marker = markers?.find((m) => m.type === 'hover') as
			| { strategy?: HoverStrategy; sync?: boolean }
			| undefined;
		this.active =
			this.tooltip !== undefined ||
			(markers ?? []).some((m) => m.type === 'hover' || m.type === 'geo-hover');
		this.strategy = this.tooltip?.strategy ?? marker?.strategy ?? defaultStrategy;
		this.sync = this.tooltip?.sync ?? marker?.sync ?? false;
	}

	/** The strategy a plot's axes ask for: along the unmeasured axis, or `'punctual'` when both hold categories. */
	static strategyOf(axes: PlotAxes | undefined): HoverStrategy {
		if (!axes) return 'x';
		if (axes.isDiscrete('x') && axes.isDiscrete('y')) return 'punctual';
		return PlotAxes.other(PlotAxes.valueOf({ axes }));
	}

	/** A plot's `hover` config; its tooltip reads as `format` unless it sets its own. */
	static buildConfig<TRow extends Record<string, unknown>>(args: {
		tooltip: TooltipConfig<TRow> | undefined;
		format: (row: TRow) => string;
		sort?: (a: TRow, b: TRow) => number;
		markers: { type: string }[];
		points: HoverPoint<TRow>[];
		label: (row: TRow) => string;
		defaultStrategy: HoverStrategy;
		pointMatching?: PointMatchingStrategy;
	}): HoverConfig<TRow> {
		const { tooltip, format, sort, markers, points, label, defaultStrategy, pointMatching } = args;
		const settings = new HoverSettings(tooltip, markers, defaultStrategy);
		return {
			active: settings.active,
			points,
			label,
			strategy: settings.strategy,
			sync: settings.sync,
			tooltip: tooltip && {
				...tooltip,
				format: tooltip.format ?? format,
				...(sort ? { sort } : {})
			},
			...(pointMatching ? { pointMatching } : {})
		};
	}
}
