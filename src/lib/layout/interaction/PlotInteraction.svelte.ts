import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { HoverState } from '$lib/layout/hover/HoverState.svelte';
import { DisabledStyle } from '$lib/layout/legend/DisabledStyle';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { LegendDisabledStyle } from '$lib/types/layout/legend';
import type { DotStyle, StrokeStyle } from '$lib/types/plots/styling';

/**
 * What the reader is doing with one plot: the legend's toggles and the
 * figure's hover, read in the plot's own hover scope. Its phases ask it how
 * each series draws - dimmed when the legend turns it off, or when a value
 * label isolates another one - and its value labels tell it what they
 * isolate. A core takes the enclosing figure's ({@link PlotInteraction.current});
 * a run outside any core builds one from the legend it has.
 */
export class PlotInteraction {
	readonly legend: LegendState | null;
	readonly hover: HoverState;
	readonly #scope: () => string;
	readonly #cfg: () => PlotStylesConfig;

	constructor(
		cfg: () => PlotStylesConfig,
		parts: { legend?: LegendState | null; hover?: HoverState; scope?: () => string } = {}
	) {
		this.#cfg = cfg;
		this.legend = parts.legend ?? null;
		this.hover = parts.hover ?? new HoverState();
		this.#scope = parts.scope ?? (() => '');
	}

	/** The enclosing figure's legend and hover, in the plot's own hover scope. Call during component init. */
	static current(cfg: () => PlotStylesConfig): PlotInteraction {
		return new PlotInteraction(cfg, {
			legend: LegendState.current(),
			hover: HoverState.current() ?? undefined,
			scope: HoverState.scope()
		});
	}

	/** How `series` dims: the legend's off style, else the legend's opacity while another series is isolated. */
	dimmed(series: string): LegendDisabledStyle | undefined {
		const opacity = this.#cfg().legend.disabledOpacity;
		const off = DisabledStyle.of(this.legend?.actionOf(series), opacity);
		if (off) return off;
		const isolated = this.hover.isolatedIn(this.#scope());
		return isolated !== null && isolated !== series ? { opacity } : undefined;
	}

	/** `series`' fill while dimmed. */
	fillFor(series: string): { fill?: string; fillOpacity?: number } | undefined {
		return DisabledStyle.fill(this.dimmed(series));
	}

	/** `series`' stroke while dimmed. */
	strokeFor(series: string): StrokeStyle | undefined {
		return DisabledStyle.stroke(this.dimmed(series));
	}

	/** `series`' dots while dimmed. */
	dotsFor(series: string): DotStyle | undefined {
		return DisabledStyle.dots(this.dimmed(series));
	}

	/** Isolates `series` - every other one dims - or ends it with `null`. */
	isolate(series: string | null): void {
		this.hover.isolate(series, this.#scope());
	}
}
