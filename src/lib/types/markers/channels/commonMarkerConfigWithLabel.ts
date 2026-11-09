import type { MarkerLabelConfig, MarkerLabels } from '$lib/types/markers/labels/common';

export type CommonMarkerConfigWithLabel<TLabel extends MarkerLabelConfig = MarkerLabelConfig> = {
	/** One label per shape, or a list of them. `layout` defaults to the marker kind's. */
	label?: MarkerLabels<TLabel>;
};
