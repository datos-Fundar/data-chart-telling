import {
	eq,
	matchByStrategy,
	impliesCrosshairX,
	impliesCrosshairY,
	filterBySeries
} from '$lib/layout/tooltip/utils';
import type { HoverStore, HoverPoint } from '$lib/types/layout/tooltip';
import type { AxisValue } from '$lib/types/layout/scales';

/** Return type of {@link createHoverController}. */
export type HoverController<T extends Record<string, unknown>> = ReturnType<typeof createHoverController<T>>;

/**
 * The plot-agnostic hover state machine shared by every plot. Given reactive
 * accessors for the current hover store, this facet's id, and the local points,
 * it produces everything a plot needs to render: the highlight points, the
 * crosshair rule positions, and the floating-tooltip state — plus the event
 * handlers that feed (and broadcast to) the shared store.
 *
 * Kept generic so line / bar / heatmap reuse it unchanged; only the points and
 * accessors they pass in differ.
 */
export function createHoverController<T extends Record<string, unknown>>(args: {
	hover: () => HoverStore;
	facetId: () => string;
	points: () => HoverPoint<T>[];
	getX: () => (d: T) => AxisValue;
	getY: () => (d: T) => AxisValue;
	/** Short label drawn next to the highlight dot (e.g. the value). */
	label: () => (row: T) => string;
	/** Named subset of series the tooltip text/content should be limited to. */
	seriesFilter?: () => string[] | undefined;
	/** This facet's own box, used to convert the cursor to/from a sync-broadcast fraction. */
	width: () => number;
	height: () => number;
	/** Forces the crosshair rule(s) off entirely — see {@link import('$lib/types/plots/props').HoverConfig.crosshair}. */
	crosshair?: () => boolean | undefined;
}) {
	let cursor = $state<{ x: number; y: number } | null>(null);
	// This facet's own `activePoint`, as a pixel position reported by `HoverMarker`.
	let activePointPixel = $state<{ x: number; y: number } | null>(null);

	// Finds the matching hoverPoint for a hit row — by identity first, then
	// by x/y value (for svelteplot's `Pointer`, which hands back clones).
	const pointForRow = (row: T): HoverPoint<T> | undefined => {
		const byIdentity = args.points().find((p) => p.row === row);
		if (byIdentity) return byIdentity;
		const x = args.getX()(row);
		const y = args.getY()(row);
		return args.points().find((p) => eq(p.x, x) && eq(p.y, y));
	};

	// Points matched in THIS facet. Non-source facets only react when sync is
	// enabled. The strategy in the shared store determines how points are found.
	const matched = $derived.by((): HoverPoint<T>[] => {
		const h = args.hover();
		const isSource = h.source === args.facetId();
		if (!isSource && !h.sync) return [];
		return matchByStrategy(args.points(), h);
	});

	const matchedRows = $derived(filterBySeries(matched, args.seriesFilter?.()));

	// Points highlighted in THIS facet for the in-SVG marker — no series
	// filtering, since that's the tooltip text's concern, not the marker's.
	// Keeps `row` (not just the display fields) so plot-kind templates can
	// resolve a semantic value off the source row directly — e.g. a bar
	// plot's category, regardless of which visual axis it's drawn on.
	const highlight = $derived(
		matched.map(({ x, y, label, series, color, dx, dy, row }) => ({
			x,
			y,
			label,
			series,
			color,
			dx,
			dy,
			row
		}))
	);

	/**
	 * The specific matched point that was actually hovered — found by the
	 * shared store's `activeSeries` (set from whichever row was hit), falling
	 * back to the first match when there's no series concept (punctual
	 * matches) or nothing tags a series. Consumers read `.x`/`.y` off this
	 * for the crosshair rule position — every point in `matched` already
	 * shares the "implied" axis's value by construction of `matchByStrategy`,
	 * and picking the actively-hovered one is what makes forcing a rule on
	 * the *other* axis (e.g. `ruleY: true` under an `'x'`-strategy chart)
	 * point at the row under the cursor rather than an arbitrary matched
	 * sibling. `BasePlotLayout` gates actual display with
	 * `impliesCrosshairX`/`Y` + the marker's own `ruleX`/`ruleY` props.
	 *
	 * `activeSeries` alone can't disambiguate two matched rows that share the
	 * same (or absent) series tag — e.g. an ungrouped bar/line chart where two
	 * categories tie on the matched axis value. `onPointer` sets `activeX`/
	 * `activeY` straight from the hit row, so when more than one series-tied
	 * candidate remains, narrowing to the one whose own x/y equals the hit
	 * row's picks the actual row under the cursor instead of an arbitrary tie.
	 */
	const activePoint = $derived.by((): HoverPoint<T> | null => {
		if (matched.length === 0) return null;
		const h = args.hover();
		const bySeries = matched.filter((p) => p.series === h.activeSeries);
		const candidates = bySeries.length > 0 ? bySeries : matched;
		if (candidates.length === 1) return candidates[0];
		const { activeX, activeY } = h;
		if (activeX == null || activeY == null) return candidates[0];
		return candidates.find((p) => eq(p.x, activeX) && eq(p.y, activeY)) ?? candidates[0];
	});

	// Whether the current strategy implies a crosshair rule on each axis, unless `crosshair: false`.
	const _impliesCrosshairX = $derived(
		args.crosshair?.() === false ? false : impliesCrosshairX(args.hover().strategy)
	);
	const _impliesCrosshairY = $derived(
		args.crosshair?.() === false ? false : impliesCrosshairY(args.hover().strategy)
	);

	const showTooltip = $derived.by(() => {
		if (matchedRows.length === 0) return false;
		const h = args.hover();
		if (h.source === args.facetId()) return cursor != null;
		return h.sync;
	});
	function onPointer(data: T[]) {
		const h = args.hover();
		if (data.length) {
			const point = pointForRow(data[0]);
			h.activeX = point?.x ?? args.getX()(data[0]);
			h.activeY = point?.y ?? args.getY()(data[0]);
			h.activeSeries = point?.series ?? null;
			h.source = args.facetId();
		} else if (h.source === args.facetId()) {
			h.activeX = null;
			h.activeY = null;
			h.activeSeries = null;
			h.source = null;
		}
	}

	function onMove(e: PointerEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		cursor = { x, y };
		const w = args.width();
		const h = args.height();
		if (w > 0 && h > 0) args.hover().cursorFrac = { x: x / w, y: y / h };
	}

	function onLeave() {
		cursor = null;
		const h = args.hover();
		if (h.source === args.facetId()) {
			h.activeX = null;
			h.activeY = null;
			h.activeSeries = null;
			h.cursorFrac = null;
			h.source = null;
		}
	}

	/** This facet's tooltip position: the cursor, else `activePointPixel`, else the source facet's cursor fraction reprojected onto this box. */
	const tooltipPosition = $derived.by((): { x: number; y: number } | null => {
		if (cursor) return cursor;
		if (activePointPixel) return activePointPixel;
		const frac = args.hover().cursorFrac;
		return frac ? { x: frac.x * args.width(), y: frac.y * args.height() } : null;
	});

	return {
		onPointer,
		onMove,
		onLeave,
		reportActivePointPixel(pos: { x: number; y: number } | null) {
			activePointPixel = pos;
		},
		get points() {
			return highlight;
		},
		get matchedRows() {
			return matchedRows;
		},
		get activePoint() {
			return activePoint;
		},
		get impliesCrosshairX() {
			return _impliesCrosshairX;
		},
		get impliesCrosshairY() {
			return _impliesCrosshairY;
		},
		get showTooltip() {
			return showTooltip;
		},
		get tooltipPosition() {
			return tooltipPosition;
		},
		get cursor() {
			return cursor;
		}
	};
}
