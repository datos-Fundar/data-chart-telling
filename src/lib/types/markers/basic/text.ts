import type { FontStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A text label per row (svelteplot's `Text`), usable on any plot kind. */
export type TextMarkerConfig = {
	type: 'text';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	text: string | ((d: any) => string);
	styles?: FontStyle;
} & CommonMarkerConfig;
