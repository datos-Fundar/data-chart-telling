import { getContext, setContext } from 'svelte';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPoint, HoverStore, HoverStrategy } from '$lib/types/layout/hover';

const HOVER_KEY = Symbol('dct-hover');
const HOVER_SCOPE_KEY = Symbol('dct-hover-scope');

/**
 * What the pointer is over, shared by every plot under one figure: the
 * hovered x, y and series, where the cursor sits, which plot (hover scope)
 * owns the hover, and the series a value label isolates. The single source
 * every consumer reads the hover from.
 */
export class HoverState implements HoverStore {
	activeX = $state<AxisValue | null>(null);
	activeY = $state<AxisValue | null>(null);
	activeSeries = $state<string | null>(null);
	cursorFrac = $state<{ x: number; y: number } | null>(null);
	source = $state<string | null>(null);
	strategy = $state<HoverStrategy>('x');
	sync = $state(false);
	#isolated = $state<{ series: string; scope: string } | null>(null);

	/** The enclosing figure's hover, or `null` outside one. Call during component init. */
	static current(): HoverState | null {
		return getContext<HoverState | undefined>(HOVER_KEY) ?? null;
	}

	/** A new hover, shared with every plot below. Call during component init. */
	static provide(): HoverState {
		const hover = new HoverState();
		setContext(HOVER_KEY, hover);
		return hover;
	}

	/** The hover scope of the plots below: which one owns the hover, one per facet panel or composer cell. Call during component init. */
	static provideScope(id: () => string): void {
		setContext(HOVER_SCOPE_KEY, id);
	}

	/** The enclosing hover scope's id, or `''` outside any. Call during component init. */
	static scope(): () => string {
		return getContext<(() => string) | undefined>(HOVER_SCOPE_KEY) ?? (() => '');
	}

	/** Whether two axis values are the same - dates by their time. */
	static same(a: AxisValue, b: AxisValue): boolean {
		if (a instanceof Date && b instanceof Date) return +a === +b;
		return a === b;
	}

	/** Whether the strategy draws a crosshair rule across x by default. */
	get crosshairX(): boolean {
		return this.strategy === 'x' || this.strategy === 'punctual';
	}

	/** Whether the strategy draws a crosshair rule across y by default. */
	get crosshairY(): boolean {
		return this.strategy === 'y' || this.strategy === 'punctual';
	}

	/** The `points` the current hover highlights, by its strategy. */
	match<T>(points: HoverPoint<T>[]): HoverPoint<T>[] {
		const { strategy, activeX, activeY, activeSeries } = this;
		if (strategy === 'x') {
			return activeX == null ? [] : points.filter((p) => HoverState.same(p.x, activeX));
		}
		if (strategy === 'y') {
			return activeY == null ? [] : points.filter((p) => HoverState.same(p.y, activeY));
		}
		if (strategy === 'series') {
			return activeSeries == null ? [] : points.filter((p) => p.series === activeSeries);
		}
		// 'punctual': the exact x and y, of the same series when both sides tag one.
		if (activeX == null || activeY == null) return [];
		return points.filter(
			(p) =>
				HoverState.same(p.x, activeX) &&
				HoverState.same(p.y, activeY) &&
				(activeSeries == null || p.series == null || p.series === activeSeries)
		);
	}

	/** Takes the hover from scope `source`: at `x`/`y`, on `series`. */
	enter(source: string, x: AxisValue, y: AxisValue, series: string | null): void {
		this.activeX = x;
		this.activeY = y;
		this.activeSeries = series;
		this.source = source;
	}

	/** Ends the hover, if scope `source` owns it - keeping where the cursor is, unless `cursor` is `false`. */
	leave(source: string, { cursor = false } = {}): void {
		if (this.source !== source) return;
		this.activeX = null;
		this.activeY = null;
		this.activeSeries = null;
		this.source = null;
		if (!cursor) this.cursorFrac = null;
	}

	/** Isolates `series` from the plot in hover `scope` (a hovered value label), or ends it with `null`. */
	isolate(series: string | null, scope: string): void {
		this.#isolated = series === null ? null : { series, scope };
	}

	/** The series isolated in `scope` - or in any, when the hover is synced. */
	isolatedIn(scope: string): string | null {
		const isolated = this.#isolated;
		if (!isolated) return null;
		return isolated.scope === scope || this.sync ? isolated.series : null;
	}
}
