import { resolveColorScale } from '$lib/utils/color';
import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { ChartConfig } from '$lib/types/configuration/styling';

/**
 * Resolves a `ChannelMarkerStyle` pair into a per-row fill accessor, or
 * `undefined` when `color` is unset (caller falls back to its own flat
 * fill/stroke). Shared by every marker kind that intersects `ChannelMarkerStyle`.
 */
export function resolveChannelFill<TData>(
	data: TData[],
	color: string | ((d: TData) => unknown) | undefined,
	scales: ChannelScalesConfig | undefined,
	cfg: ChartConfig
): ((d: TData) => string) | undefined {
	if (!color) return undefined;
	const colorFn = typeof color === 'function' ? color : (d: TData) => (d as Record<string, unknown>)[color];
	const vals = data.map((d) => Number(colorFn(d))).filter((v) => Number.isFinite(v));
	if (!vals.length) return undefined;
	const domain: [number, number] = [Math.min(...vals), Math.max(...vals)];
	const colorScale = resolveColorScale(scales?.color, domain, [cfg.continuous.min, cfg.continuous.max]);
	return (d: TData) => colorScale(Number(colorFn(d)));
}
