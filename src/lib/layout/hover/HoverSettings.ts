import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { HoverStrategy } from '$lib/types/layout/hover';
import type { TooltipConfig } from '$lib/types/plots/props';

/**
 * How the author set up a plot's hover, from its `tooltip` and its hover
 * marker (`'hover'`, or `'geo-hover'` on a map): whether it is on, the
 * strategy that matches points (the tooltip's, else the marker's, else the
 * plot kind's `defaultStrategy`) and whether it syncs across plots.
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
}
