import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** A heatmap cell mark; `fill` is always set per row. */
export type CellMarkerConfig = {
	type: 'cell';
	styles?: AreaStyle;
	inset?: number;
} & CommonMarkerConfigWithColor &
	Required<Pick<CommonMarkerConfigWithArea, 'fill'>>;
