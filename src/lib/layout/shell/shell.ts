import type { PlotChrome } from '$lib/types/plots/props';

/** Whether a plot draws any chrome around it: a title, subtitle, caption, header, footer or legend. */
export function hasPlotChrome(props: PlotChrome): boolean {
	const { title, subtitle, caption, header, footer, legend } = props;
	return Boolean(title || subtitle || caption || header || footer || legend?.length);
}

/** Whether a plot needs its shell at all - any chrome, a timeline or a facet. Without one, the core renders bare. */
export function hasPlotShell(
	props: PlotChrome & { timeline?: unknown; facet?: unknown }
): boolean {
	return hasPlotChrome(props) || Boolean(props.timeline || props.facet);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `author` scales over `base`, merged per channel. */
export function mergeScales<T extends object>(
	base: T | undefined,
	author: T | undefined
): T | undefined {
	if (!base) return author;
	if (!author) return base;
	const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, value] of Object.entries(author as Record<string, unknown>)) {
		const prev = out[key];
		out[key] = isPlainObject(prev) && isPlainObject(value) ? { ...prev, ...value } : value;
	}
	return out as T;
}
