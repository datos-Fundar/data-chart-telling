import type { ChartConfig, ChartConfigInput, TextStyle } from '$lib/types/configuration/styling';

/**
 * Global, reactive styling configuration for the whole package.
 *
 * One source of truth feeds two consumers:
 *   1. HTML chrome (container, legend, caption, tooltip) reads it as **CSS
 *      custom properties** — {@link configToCssVars} flattens the config and
 *      {@link ChartContainer} stamps the variables on its root so the scoped
 *      `<style>` blocks resolve them.
 *   2. Plots read it as **plain JS values** for the props svelteplot needs as
 *      numbers/strings (margins, tick font sizes, palette, gradient endpoints).
 *
 * Because the store is a module-level Svelte `$state`, calling
 * {@link setConfiguration} re-renders every chart on screen.
 */

// ── Defaults ────────────────────────────────────────────────────────────────
// Mirror the values the components shipped with, so adopting the config system
// is visually a no-op until something is overridden.

const text = (over: Partial<TextStyle>): TextStyle => ({
	font: 'inherit',
	size: '1rem',
	weight: 400,
	color: 'inherit',
	leading: '1.3',
	spacing: 'normal',
	...over
});

export const DEFAULT_CONFIG: ChartConfig = {
	font: 'inherit',
	color: 'currentColor',
	background: 'transparent',
	border: 'color-mix(in srgb, currentColor 15%, transparent)',

	spacing: {
		headerPadding: '0.75rem 0 1rem',
		legendPadding: '0.75rem 0',
		captionPadding: '0.5rem 0'
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
		swatchSize: '1.25rem',
		disabledOpacity: 0.12,
		navButton: {
			background: 'transparent',
			color: 'currentColor',
			size: '1.5rem',
			fontSize: '1rem',
			disabledOpacity: 0.3
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
		grid: false
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
	palette: ['#4f46e5', '#e6580d', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#ca8a04', '#db2777'],
	continuous: { min: '#e0e7ff', max: '#4f46e5', labelColor: '#111827' },
	line: {
		strokeWidth: 3,
		dotRadius: 4,
		gap: {
			stroke: { strokeOpacity: 0.6, strokeDasharray: '4 4' },
			dots: {}
		},
		valueLabels: {
			elbowGap: 10,
			laneStep: 7,
			labelGap: 6,
			connectorColor: '#94a3b8',
			connectorWidth: 0.5
		}
	},
	bar: { gap: { fillOpacity: 0.5 } },
	pyramid: { gap: { fillOpacity: 0.5 } },
	scatter: { dotRadius: 5 },
	timeline: { axisColor: 'currentColor', activeColor: '#e6580d', thickness: 60 },
	hover: {
		rule: { stroke: '#e6580d', strokeOpacity: 0.35, strokeWidth: 1.5, strokeDasharray: '4 4' },
		dot: { dotRadius: 5, dotFill: 'currentColor' },
		font: { fill: 'currentColor', fontSize: 12, dy: -18 },
		area: { stroke: '#e6580d', strokeWidth: 2, fillOpacity: 0 }
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

// ── Merge ─────────────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function merge<T>(base: T, patch: Record<string, unknown>): T {
	const out = { ...(base as Record<string, unknown>) };
	for (const key in patch) {
		const pv = patch[key];
		if (pv === undefined) continue;
		const bv = out[key];
		out[key] = isPlainObject(bv) && isPlainObject(pv) ? merge(bv, pv) : pv;
	}
	return out as T;
}

// ── Reactive store ──────────────────────────────────────────────────────────

let current = $state<ChartConfig>(structuredClone(DEFAULT_CONFIG));

/** Read the live, reactive configuration. */
export function getConfiguration(): ChartConfig {
	return current;
}

/** Deep-merge a partial override into the global configuration. Reactive. */
export function setConfiguration(patch: ChartConfigInput): ChartConfig {
	current = merge(current, patch);
	return current;
}

/** Restore the shipped defaults. */
export function resetConfiguration(): void {
	current = structuredClone(DEFAULT_CONFIG);
}

// ── CSS variable bridge ───────────────────────────────────────────────────────

/** Flatten a config into the `--dct-*` custom properties used by the styles. */
export function configToCssVars(c: ChartConfig): Record<string, string> {
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
		'--dct-border': c.border,

		'--dct-header-pad': c.spacing.headerPadding,
		'--dct-legend-pad': c.spacing.legendPadding,
		'--dct-caption-pad': c.spacing.captionPadding,

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

		'--dct-legend-nav-bg': c.legend.navButton.background,
		'--dct-legend-nav-color': c.legend.navButton.color,
		'--dct-legend-nav-size': c.legend.navButton.size,
		'--dct-legend-nav-font-size': c.legend.navButton.fontSize,
		'--dct-legend-nav-disabled-opacity': String(c.legend.navButton.disabledOpacity),

		'--dct-axis-color': c.axis.color,

		'--dct-tooltip-bg': c.tooltip.background,
		'--dct-tooltip-color': c.tooltip.color,
		'--dct-tooltip-size': c.tooltip.fontSize,
		'--dct-tooltip-pad': c.tooltip.padding,
		'--dct-tooltip-radius': c.tooltip.radius,
		'--dct-tooltip-border': c.tooltip.border,

		'--dct-timeline-axis': c.timeline.axisColor,
		'--dct-timeline-active': c.timeline.activeColor,

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
