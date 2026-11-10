import type { MarkerLabelConfig, MarkerLabels } from '$lib/types/markers/labels/common';

/** `TLabel` names the layouts the marker kind supports. */
export type CommonMarkerConfigWithLabel<TLabel extends MarkerLabelConfig> = {
	/** One label per shape, or a list of them. `layout` defaults to the marker kind's. */
	label?: MarkerLabels<TLabel>;
};
