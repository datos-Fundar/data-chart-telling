import type { StrokeStyle, DotStyle, FontStyle, AreaStyle } from '$lib/types/plots/styling';
import type { SymbolType } from '$lib/types/plots/constants';

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

/** How a chrome divider's line is drawn, as a CSS border style. */
export type DividerLineStyle = 'solid' | 'dashed' | 'dotted' | 'double';

export type PlotStylesConfig = {
	// ── Base ──────────────────────────────────────────────────────────────────
	font: string;
	color: string;
	background: string;

	// ── Spacing / padding ───────────────────────────────────────────────────────
	spacing: {
		headerPadding: string;
		legendPadding: string;
		captionPadding: string;
		bleed: string;
	};

	// ── Divider ─────────────────────────────────────────────────────────────────
	/** The line every `'divider'` in a plot's chrome `order` draws. */
	divider: {
		color: string;
		/** Line thickness, e.g. `'1px'`. */
		width: string;
		style: DividerLineStyle;
		/** Space around the line, as a CSS `margin`. */
		margin: string;
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
					/** Rotation magnitude applied once overlapping - lo rotates by this amount, hi by its negation, so both still grow inward toward the bar instead of off its edges. */
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
	 * side to fit whatever it actually renders there - tick labels, an axis
	 * title, rotated ticks - instead of clipping content or leaving unused
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
	/** Default shape cycle for the `symbol` channel, in order. */
	symbols: SymbolType[];
	/** Continuous gradient endpoints + on-cell label colour, plus the default opacity-channel range. */
	continuous: { min: string; max: string; labelColor: string; opacityRange: [number, number] };
	/** Default line geometry. */
	line: {
		strokeWidth: number;
		dotRadius: number;
		/**
		 * Default gap-fill bridge styling (`LinePlot`'s `styles.gaps`) - the
		 * fallback merged under whatever a gap zone's own `style` sets, the
		 * same way `hover.rule`/`hover.dot` back every hover marker's style.
		 */
		gap: { stroke: StrokeStyle; dots: DotStyle };
	};
	/** Default text-marker behavior. */
	text: {
		/** Geometry and connector of a decluttered text marker (`declutter`) - e.g. LinePlot's end-of-line value labels. */
		declutter: {
			/** Shortest lane's distance (px) from the point before a connector bends. */
			elbowGap: number;
			/** Extra distance (px) each further lane sits out from the last. */
			laneStep: number;
			/** Clearance (px) between the outermost lane and the label text. */
			labelGap: number;
			/** Default connector stroke. */
			connector: StrokeStyle;
		};
	};
	/** Default bar-mark styling. */
	bar: {
		/** Default gap-fill styling (`BarPlot`'s `styles.gaps`) - the fallback merged under whatever a gap zone's own `style` sets. */
		gap: AreaStyle;
		/** Gap (0-1) between the bars of side-by-side series within one category, as a fraction of each bar's slice. */
		seriesPadding: number;
		/** Fallback gap (0-1) *between* category groups on BarPlot's own category axis, when a plot doesn't set its own `scales.x/y.paddingInner`. */
		paddingInner: number;
		/** Fallback gap (0-1) before the first and after the last category group on BarPlot's own category axis, when a plot doesn't set its own `scales.x/y.paddingOuter`. */
		paddingOuter: number;
	};
	/** Default pyramid-bar styling. */
	pyramid: {
		/** Default gap-fill styling (`PyramidPlot`'s `styles.gaps`) - the fallback merged under whatever a gap zone's own `style` sets. */
		gap: AreaStyle;
	};
	/** Default area-plot styling. */
	area: {
		/** Fill opacity of every area marker that sets none of its own. */
		fillOpacity: number;
	};
	/** Default histogram styling. */
	histogram: {
		/** Pixels taken off each side of every bar, so neighbouring bars leave a gap of twice this. */
		inset: number;
		/** Fill opacity of every bar, so a grouped histogram's bars behind another group's still show. */
		fillOpacity: number;
	};
	/** Default scatter point geometry. */
	scatter: { dotRadius: number };
	/** Timeline gutter styling. */
	timeline: {
		axisColor: string;
		activeColor: string;
		thickness: number;
		/** Space between a plot (or a composition's panels) and its timeline, as a CSS length. */
		gap: string;
	};
	/**
	 * In-SVG hover highlight: crosshair rule, dot + value label, and the area
	 * highlight - a restyled feature on `GeoPlot`, or an `areaX`/`areaY` band
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
export type PlotStylesConfigInput = DeepPartial<PlotStylesConfig>;

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};
