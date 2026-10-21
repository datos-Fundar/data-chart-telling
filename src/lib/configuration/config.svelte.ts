import { merge } from '$lib/utils/merge';
import type {
	PlotStylesConfig,
	PlotStylesConfigInput,
	TextStyle
} from '$lib/types/configuration/styling';

/**
 * Global, reactive styling configuration. Chrome reads it as CSS custom
 * properties ({@link configToCssVars}); plots read it as plain values.
 * {@link setConfiguration} re-renders every plot.
 */

// ── Defaults ────────────────────────────────────────────────────────────────
// `axis.locale` defaults to `es-AR` and `axis.compactDisplay` to `short`.

const text = (over: Partial<TextStyle>): TextStyle => ({
	font: 'inherit',
	size: '1rem',
	weight: 400,
	color: 'inherit',
	leading: '1.3',
	spacing: 'normal',
	...over
});

export const DEFAULT_CONFIG: PlotStylesConfig = {
	font: 'inherit',
	color: 'currentColor',
	background: 'transparent',

	spacing: {
		headerPadding: '0.5rem 0',
		legendPadding: '0.5rem 0',
		captionPadding: '0.5rem 0',
		bleed: '12px'
	},

	divider: {
		color: 'color-mix(in srgb, currentColor 15%, transparent)',
		width: '1px',
		style: 'solid',
		margin: '0.5rem 0px'
	},

	// Title and subtitle (or header), a divider, legend, plot, a player timeline,
	// then caption (or footer). With no title, subtitle or header, the divider has nothing above
	// it, so it isn't drawn.
	chrome: {
		order: [
			'header',
			'title',
			'subtitle',
			'divider',
			'legend',
			'plot',
			'timeline',
			'footer',
			'caption'
		],
		rowGap: '1rem'
	},

	title: text({ size: '1.5rem', weight: 500, leading: '1.2' }),
	subtitle: text({
		size: '1rem',
		weight: 400,
		color: 'color-mix(in srgb, currentColor 85%, transparent)'
	}),
	caption: text({ size: '0.75rem', color: 'color-mix(in srgb, currentColor 75%, transparent)' }),

	legend: {
		font: 'inherit',
		size: '0.875rem',
		weight: 400,
		color: 'inherit',
		titleSize: '0.875rem',
		titleWeight: 500,
		gap: '0.5rem 2rem',
		swatchSize: '0.9rem',
		disabledOpacity: 0.12,
		pretty: true,
		seriesTitle: { enabled: true, text: 'Series' },
		sizeScale: { gap: '12px' },
		navButton: {
			background: 'transparent',
			color: 'currentColor',
			size: '1.5rem',
			fontSize: '1rem',
			disabledOpacity: 0.3
		},
		continuous: {
			height: 20,
			barHeight: 12,
			barRadius: 2,
			// A slim vertical bar handle, taller than the 12px gradient track.
			handle: {
				width: '6px',
				height: '20px',
				radius: '3px',
				fill: 'currentColor',
				stroke: 'var(--dct-bg, #fff)',
				strokeWidth: '1.5px'
			},
			tick: {
				color: 'currentColor',
				width: '1px',
				length: '6px'
			},
			label: {
				rotate: '0deg',
				size: '0.875rem',
				weight: 600,
				overlap: {
					enabled: true,
					margin: 4,
					rotate: '90deg'
				}
			}
		}
	},

	axis: {
		color: 'currentColor',
		fontSize: 14,
		labelFontSize: 14,
		titleFontSize: 14,
		xTickSize: 5,
		yTickSize: 5,
		xTickPadding: 10,
		yTickPadding: 10,
		grid: false,
		locale: 'es-AR',
		compactDisplay: 'short',
		edgeTicks: {
			x: { enabled: true, collision: 'drop-nice' },
			y: { enabled: false, collision: 'drop-nice' }
		},
		autoRotate: true
	},

	tooltip: {
		background: '#111827',
		color: '#ffffff',
		fontSize: '0.8125rem',
		padding: '0.5rem 0.75rem',
		radius: '0.375rem',
		border: 'none'
	},

	margins: { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' },
	frameClip: { tolerance: 5 },
	// ColorBrewer Dark2 - qualitative, harmonious, and dark enough to read on white.
	palette: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
	symbols: ['circle', 'square', 'triangle', 'diamond', 'star', 'cross'],
	continuous: { min: '#f7fcfd', max: '#1b9e77', labelColor: '#111827', opacityRange: [0.2, 1] },
	line: {
		strokeWidth: 3,
		dotRadius: 4,
		gap: {
			stroke: { strokeOpacity: 0.6, strokeDasharray: '4 4' },
			dots: {}
		}
	},
	text: {
		declutter: {
			elbowGap: 10,
			laneStep: 7,
			labelGap: 6,
			connector: { stroke: '#94a3b8', strokeWidth: 0.5 }
		}
	},
	bar: {
		gap: { fillOpacity: 0.5 },
		seriesPadding: 0.2,
		paddingInner: 0.15,
		paddingOuter: 0.15
	},
	pyramid: { gap: { fillOpacity: 0.5 } },
	area: { fillOpacity: 0.6 },
	histogram: { inset: 1, fillOpacity: 1 },
	box: { fillOpacity: 0.9, paddingInner: 0.4, paddingOuter: 0.2 },
	lollipop: {
		dotRadius: 6,
		stemWidth: 2,
		labelGap: 10,
		paddingInner: 0.5,
		paddingOuter: 0.5
	},
	dumbbell: {
		dotRadius: 6,
		stemWidth: 'dots',
		connectorColor: '#9ca3af',
		labelGap: 10,
		paddingInner: 0.5,
		paddingOuter: 0.5
	},
	cleveland: {
		dotRadius: 5,
		stemWidth: 5,
		connectorColor: '#9ca3af',
		labelGap: 10,
		paddingInner: 0.5,
		paddingOuter: 0.5
	},
	forest: {
		dotRadius: 5,
		stemWidth: 2,
		caps: true,
		labelGap: 10,
		paddingInner: 0.5,
		paddingOuter: 0.5
	},
	bullet: {
		barThickness: 10,
		rangeWidth: 28,
		rangeColors: ['#9ca3af', '#d1d5db', '#eceff3'],
		targetLength: 22,
		targetWidth: 3,
		paddingInner: 0.4,
		paddingOuter: 0.3
	},
	connector: {
		sign: { positive: '#1b9e77', negative: '#d95f02', zero: '#9ca3af' },
		lengthScheme: ['#d1d5db', '#374151'],
		differenceScheme: ['#d95f02', '#e5e7eb', '#1b9e77'],
		arrow: { width: 2, headLength: 8, headAngle: 60 },
		capLength: 8,
		outsideOpacity: 0.4,
		labelFontSize: 11,
		labelGap: 4
	},
	scatter: { dotRadius: 5 },
	timeline: {
		axisColor: 'currentColor',
		activeColor: '#1b9e77',
		thickness: 60,
		gap: '12px',
		rule: {
			fontSize: 12,
			activeFontSize: 20,
			activeFontWeight: 'bold',
			labelOpacity: 0.55,
			axisWidth: 1.5,
			axisOpacity: 0.7
		},
		player: {
			controls: ['play', 'value', 'slider'],
			speeds: [0.5, 1, 2],
			stepDuration: 800,
			background: 'color-mix(in srgb, currentColor 6%, transparent)',
			color: 'currentColor',
			radius: '0.5rem',
			padding: '0.5rem 1rem',
			gap: '1rem',
			fontSize: '0.875rem',
			fontWeight: 500,
			valueWidth: '3rem',
			button: {
				size: '2rem',
				background: '#1b9e77',
				color: '#ffffff',
				hoverBackground: '#0c4937',
				radius: '999px'
			},
			track: {
				height: '3px',
				color: 'color-mix(in srgb, currentColor 25%, transparent)',
				fillColor: '#1b9e77',
				radius: '999px'
			},
			thumb: { size: '14px', color: '#1b9e77' },
			toggle: {
				background: 'transparent',
				color: 'currentColor',
				activeBackground: '#1b9e77',
				activeColor: '#ffffff',
				radius: '0.375rem',
				fontSize: '0.75rem',
				padding: '0.125rem 0.5rem'
			}
		}
	},
	hover: {
		rule: { stroke: '#e6580d', strokeOpacity: 0.35, strokeWidth: 1.5, strokeDasharray: '4 4' },
		dot: { dotRadius: 5, dotFill: 'currentColor' },
		font: { fill: 'currentColor', fontSize: 12, dy: -18 },
		area: { fill: '#94a3b8', fillOpacity: 0.25 }
	},
	// Beside a vertical delta (taken on x), above a horizontal one (on y).
	delta: {
		text: {
			x: { dx: 12, dy: 0, lineAnchor: 'middle', textAnchor: 'start' },
			y: { dx: 0, dy: -10, lineAnchor: 'middle', textAnchor: 'middle' }
		}
	},
	facet: {
		indicator: {
			background: '#111827',
			color: '#ffffff',
			fontSize: '0.8125rem',
			padding: '0.125rem 0.5rem',
			radius: '999px'
		},
		navButton: {
			background: '#111827',
			color: '#ffffff',
			size: '2rem',
			fontSize: '1.1rem',
			disabledOpacity: 0.3
		}
	}
};

// ── Reactive store ──────────────────────────────────────────────────────────

let current = $state<PlotStylesConfig>(structuredClone(DEFAULT_CONFIG));

/** Read the live, reactive configuration. */
export function getConfiguration(): PlotStylesConfig {
	return current;
}

/** Deep-merge a partial override into the global configuration. Reactive. */
export function setConfiguration(patch: PlotStylesConfigInput): PlotStylesConfig {
	current = merge(current, patch);
	return current;
}

/** Restore the shipped defaults. */
export function resetConfiguration(): void {
	current = structuredClone(DEFAULT_CONFIG);
}

// ── CSS variable bridge ───────────────────────────────────────────────────────

/** Flatten a config into the `--dct-*` custom properties used by the styles. */
export function configToCssVars(c: PlotStylesConfig): Record<string, string> {
	const t = (prefix: string, s: TextStyle): Record<string, string> => ({
		[`--dct-${prefix}-font`]: s.font,
		[`--dct-${prefix}-size`]: s.size,
		[`--dct-${prefix}-weight`]: String(s.weight),
		[`--dct-${prefix}-color`]: s.color,
		[`--dct-${prefix}-leading`]: s.leading,
		[`--dct-${prefix}-spacing`]: s.spacing
	});

	return {
		'--dct-font': c.font,
		'--dct-fg': c.color,
		'--dct-bg': c.background,

		'--dct-header-pad': c.spacing.headerPadding,
		'--dct-legend-pad': c.spacing.legendPadding,
		'--dct-caption-pad': c.spacing.captionPadding,
		'--dct-bleed': c.spacing.bleed,

		'--dct-divider-color': c.divider.color,
		'--dct-divider-width': c.divider.width,
		'--dct-divider-style': c.divider.style,
		'--dct-divider-margin': c.divider.margin,
		'--dct-row-gap': c.chrome.rowGap,

		...t('title', c.title),
		...t('subtitle', c.subtitle),
		...t('caption', c.caption),

		'--dct-legend-font': c.legend.font,
		'--dct-legend-size': c.legend.size,
		'--dct-legend-weight': String(c.legend.weight),
		'--dct-legend-color': c.legend.color,
		'--dct-legend-title-size': c.legend.titleSize,
		'--dct-legend-title-weight': String(c.legend.titleWeight),
		'--dct-legend-gap': c.legend.gap,
		'--dct-legend-swatch': c.legend.swatchSize,
		'--dct-legend-size-gap': c.legend.sizeScale.gap,

		'--dct-legend-nav-bg': c.legend.navButton.background,
		'--dct-legend-nav-color': c.legend.navButton.color,
		'--dct-legend-nav-size': c.legend.navButton.size,
		'--dct-legend-nav-font-size': c.legend.navButton.fontSize,
		'--dct-legend-nav-disabled-opacity': String(c.legend.navButton.disabledOpacity),

		'--dct-continuous-handle-width': c.legend.continuous.handle.width,
		'--dct-continuous-handle-height': c.legend.continuous.handle.height,
		'--dct-continuous-handle-radius': c.legend.continuous.handle.radius,
		'--dct-continuous-handle-fill': c.legend.continuous.handle.fill,
		'--dct-continuous-handle-stroke': c.legend.continuous.handle.stroke,
		'--dct-continuous-handle-stroke-width': c.legend.continuous.handle.strokeWidth,
		'--dct-continuous-tick-color': c.legend.continuous.tick.color,
		'--dct-continuous-tick-width': c.legend.continuous.tick.width,
		'--dct-continuous-tick-length': c.legend.continuous.tick.length,
		'--dct-continuous-label-rotate': c.legend.continuous.label.rotate,
		'--dct-continuous-label-size': c.legend.continuous.label.size,
		'--dct-continuous-label-weight': String(c.legend.continuous.label.weight),
		'--dct-continuous-label-overlap-rotate': c.legend.continuous.label.overlap.rotate,

		'--dct-axis-color': c.axis.color,

		'--dct-tooltip-bg': c.tooltip.background,
		'--dct-tooltip-color': c.tooltip.color,
		'--dct-tooltip-size': c.tooltip.fontSize,
		'--dct-tooltip-pad': c.tooltip.padding,
		'--dct-tooltip-radius': c.tooltip.radius,
		'--dct-tooltip-border': c.tooltip.border,

		'--dct-timeline-axis': c.timeline.axisColor,
		'--dct-timeline-active': c.timeline.activeColor,
		'--dct-timeline-gap': c.timeline.gap,

		'--dct-player-bg': c.timeline.player.background,
		'--dct-player-color': c.timeline.player.color,
		'--dct-player-radius': c.timeline.player.radius,
		'--dct-player-pad': c.timeline.player.padding,
		'--dct-player-gap': c.timeline.player.gap,
		'--dct-player-size': c.timeline.player.fontSize,
		'--dct-player-weight': String(c.timeline.player.fontWeight),
		'--dct-player-value-width': c.timeline.player.valueWidth,
		'--dct-player-button-size': c.timeline.player.button.size,
		'--dct-player-button-bg': c.timeline.player.button.background,
		'--dct-player-button-color': c.timeline.player.button.color,
		'--dct-player-button-hover-bg': c.timeline.player.button.hoverBackground,
		'--dct-player-button-radius': c.timeline.player.button.radius,
		'--dct-player-track-height': c.timeline.player.track.height,
		'--dct-player-track-color': c.timeline.player.track.color,
		'--dct-player-track-fill': c.timeline.player.track.fillColor,
		'--dct-player-track-radius': c.timeline.player.track.radius,
		'--dct-player-thumb-size': c.timeline.player.thumb.size,
		'--dct-player-thumb-color': c.timeline.player.thumb.color,
		'--dct-player-toggle-bg': c.timeline.player.toggle.background,
		'--dct-player-toggle-color': c.timeline.player.toggle.color,
		'--dct-player-toggle-active-bg': c.timeline.player.toggle.activeBackground,
		'--dct-player-toggle-active-color': c.timeline.player.toggle.activeColor,
		'--dct-player-toggle-radius': c.timeline.player.toggle.radius,
		'--dct-player-toggle-size': c.timeline.player.toggle.fontSize,
		'--dct-player-toggle-pad': c.timeline.player.toggle.padding,

		'--dct-heat-min': c.continuous.min,
		'--dct-heat-max': c.continuous.max,
		'--dct-heat-text': c.continuous.labelColor,

		'--dct-facet-indicator-bg': c.facet.indicator.background,
		'--dct-facet-indicator-color': c.facet.indicator.color,
		'--dct-facet-indicator-size': c.facet.indicator.fontSize,
		'--dct-facet-indicator-pad': c.facet.indicator.padding,
		'--dct-facet-indicator-radius': c.facet.indicator.radius,

		'--dct-facet-nav-bg': c.facet.navButton.background,
		'--dct-facet-nav-color': c.facet.navButton.color,
		'--dct-facet-nav-btn-size': c.facet.navButton.size,
		'--dct-facet-nav-font-size': c.facet.navButton.fontSize,
		'--dct-facet-nav-disabled-opacity': String(c.facet.navButton.disabledOpacity)
	};
}

/** Serialize a CSS-vars record into a `style` attribute string. */
export function cssVarsStyle(vars: Record<string, string>): string {
	return Object.entries(vars)
		.map(([k, v]) => `${k}:${v}`)
		.join(';');
}
