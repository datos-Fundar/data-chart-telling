import PeakMarker from '$lib/markers/PeakMarker.svelte';

type Props = Record<string, unknown>;

/**
 * How a custom component takes its series color through its own props. A
 * component listed here gets the color injected at resolve time, the same way
 * a built-in marker inherits it, and explicit props still win.
 */
const COLOR_PROPS = new Map<unknown, (props: Props, color: string) => Props>([
	[
		PeakMarker,
		(props, color) => ({
			...props,
			dot: { dotFill: color, dotStroke: color, ...(props.dot as object) },
			text: { fill: color, ...(props.text as object) }
		})
	]
]);

/** Gives a scoped custom component its series color, when it knows how to take one. */
export function withComponentSeriesColor<T extends { component?: unknown; props?: unknown }>(
	marker: T,
	color: string | undefined
): T {
	const colorize = color ? COLOR_PROPS.get(marker.component) : undefined;
	if (!colorize) return marker;
	return { ...marker, props: colorize((marker.props ?? {}) as Props, color!) };
}
