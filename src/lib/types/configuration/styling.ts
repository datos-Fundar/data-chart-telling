import type { StrokeStyle, DotStyle, FontStyle, AreaStyle } from '$lib/types/plots/styling';

export type TextStyle = {
	/** font-family */
	font: string;
	/** font-size (any CSS length) */
	size: string;
	/** font-weight */
	weight: number | string;
	/** color */
	color: string;
	/** line-height */
	leading: string;
	/** letter-spacing */
	spacing: string;
};

export type ChartConfig = {
	// ── Base ──────────────────────────────────────────────────────────────────
	font: string;
	color: string;
	background: string;
	border: string;

	// ── Spacing / padding ───────────────────────────────────────────────────────
	spacing: {
		headerPadding: string;
		legendPadding: string;
		captionPadding: string;
		bleed: string;
	};

	// ── Text blocks ─────────────────────────────────────────────────────────────
	title: TextStyle;
	subtitle: TextStyle;
	caption: TextStyle;

	// ── Legend ──────────────────────────────────────────────────────────────────
	legend: {
		font: string;
		size: string;
		weight: number | string;
		color: string;
		titleSize: string;
		titleWeight: number | string;
		/** row/column gap between sections (CSS `gap` shorthand) */
		gap: string;
		/** swatch square size */
		swatchSize: string;
		/** Fallback opacity for a legend-disabled series/value when a section doesn't set its own style. */
		disabledOpacity: number;
		/** Prev/next arrows shown when a `layout: { type: 'horizontal' }` discrete section overflows `maxRows`. */
		navButton: {
			background: string;
			color: string;
			size: string;
			fontSize: string;
			disabledOpacity: number;
		};
		/** Continuous section styling: the draggable lo/hi handles and the tick/edge labels. */
		continuous: {
			/** Total height (px) of the bar's drawing area. */
			height: number;
			/** Height (px) of the gradient bar itself, centered within `height`. */
			barHeight: number;
			/** Corner radius (px) of the gradient bar and excluded-range overlays. */
			barRadius: number;
			/** The draggable lo/hi handle. */
			handle: {
				width: string;
				height: string;
				radius: string;
				fill: string;
				stroke: string;
				strokeWidth: string;
			};
			tick: {
				color: string;
				width: string;
				/** Length of the tick mark below the gradient bar. */
				length: string;
			};
			label: {
				/** Rotation applied to tick/edge label text. */
				rotate: string;
				/** font-size of the tick/edge/handle labels. */
				size: string;
				/** font-weight of the draggable lo/hi handle labels. */
				weight: number | string;
				/** Interactive-mode-only: the lo/hi handle labels flip to read top-to-bottom once dragging brings them too close to read side by side. */
				overlap: {
					/** Whether the flip-to-vertical behavior is active at all; false always keeps both labels horizontal, however close together. */
					enabled: boolean;
					/** How many px of horizontal slack the two labels need between them before they're considered overlapping (and flipped). */
					margin: number;
					/** Rotation magnitude applied once overlapping — lo rotates by this amount, hi by its negation, so both still grow inward toward the bar instead of off its edges. */
					rotate: string;
				};
			};
		};
	};

	// ── Axes (consumed by plots) ────────────────────────────────────────────────
	axis: {
		color: string;
		fontSize: number;
		labelFontSize: number;
		titleFontSize: number;
		xTickSize: number;
		yTickSize: number;
		xTickPadding: number;
		yTickPadding: number;
		grid: boolean;
		locale: string;
		compactDisplay: 'short' | 'long';
	};

	// ── Tooltip ─────────────────────────────────────────────────────────────────
	tooltip: {
		background: string;
		color: string;
		fontSize: string;
		padding: string;
		radius: string;
		border: string;
	};

	// ── Plot geometry / colour ──────────────────────────────────────────────────
	/**
	 * Per-side plot margin. `'auto'` (the default) lets svelteplot size that
	 * side to fit whatever it actually renders there — tick labels, an axis
	 * title, rotated ticks — instead of clipping content or leaving unused
	 * space. A number pins that side exactly, opting out of auto-sizing.
	 */
	margins: {
		top: number | 'auto';
		right: number | 'auto';
		bottom: number | 'auto';
		left: number | 'auto';
	};
	/** Discrete categorical palette (grouped series). */
	palette: string[];
	/** Continuous gradient endpoints + on-cell label colour. */
	continuous: { min: string; max: string; labelColor: string };
	/** Default line geometry. */
	line: {
		strokeWidth: number;
		dotRadius: number;
		/**
		 * Default gap-fill bridge styling (`LinePlot`'s `styles.gaps`) — the
		 * fallback merged under whatever a gap zone's own `style` sets, the
		 * same way `hover.rule`/`hover.dot` back every hover marker's style.
		 */
		gap: { stroke: StrokeStyle; dots: DotStyle };
		/**
		 * End-of-line value-label declutter geometry and connector styling —
		 * `LinePlot`-specific, since only line charts spread colliding
		 * end-point labels apart with elbow-routed leader lines.
		 */
		valueLabels: {
			/** Shortest lane's distance (px) from the data point before a leader line bends. */
			elbowGap: number;
			/** Extra distance (px) each subsequent lane sits out from the last. */
			laneStep: number;
			/** Clearance (px) between the outermost lane and the label text it feeds into. */
			labelGap: number;
			/** Default leader-line colour — overridable per-plot via `styles.values.strokeStyle`. */
			connectorColor: string;
			/** Default leader-line width — overridable per-plot via `styles.values.strokeStyle`. */
			connectorWidth: number;
		};
	};
	/** Default bar-mark styling. */
	bar: {
		/** Default gap-fill styling (`BarPlot`'s `styles.gaps`) — the fallback merged under whatever a gap zone's own `style` sets. */
		gap: AreaStyle;
		/** Fallback `scales.z.seriesPadding` (0–1) for 'grouped' series layout, when a plot doesn't set its own. */
		seriesPadding: number;
		/** Fallback gap (0–1) *between* category groups on BarPlot's own category axis, when a plot doesn't set its own `scales.x/y.paddingInner`. */
		paddingInner: number;
		/** Fallback gap (0–1) before the first and after the last category group on BarPlot's own category axis, when a plot doesn't set its own `scales.x/y.paddingOuter`. */
		paddingOuter: number;
	};
	/** Default pyramid-bar styling. */
	pyramid: {
		/** Default gap-fill styling (`PyramidPlot`'s `styles.gaps`) — the fallback merged under whatever a gap zone's own `style` sets. */
		gap: AreaStyle;
	};
	/** Default scatter point geometry. */
	scatter: { dotRadius: number };
	/** Timeline gutter styling. */
	timeline: { axisColor: string; activeColor: string; thickness: number };
	/**
	 * In-SVG hover highlight: crosshair rule, dot + value label, and the area
	 * highlight — a restyled feature on `GeoPlot`, or an `areaX`/`areaY` band
	 * on an axis-based plot's band scale.
	 */
	hover: { rule: StrokeStyle; dot: DotStyle; font: FontStyle; area: AreaStyle };

	// ── Facet (small multiples) ──────────────────────────────────────────────────
	facet: {
		/** Position badge shown in `carousel`/`paginated` facet modes. */
		indicator: {
			background: string;
			color: string;
			fontSize: string;
			padding: string;
			radius: string;
		};
		/** Prev/next buttons shown in `paginated` facet mode. */
		navButton: {
			background: string;
			color: string;
			/** Button diameter (width and height). */
			size: string;
			fontSize: string;
			disabledOpacity: number;
		};
	};
};

/** Deep-partial input accepted by `setConfiguration`. */
export type ChartConfigInput = DeepPartial<ChartConfig>;

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};
