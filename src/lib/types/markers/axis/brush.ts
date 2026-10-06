import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** Live selection rectangle of a brush marker, the same shape as svelteplot's `Brush` state. */
export type BrushSelection = {
	x1?: number | Date;
	x2?: number | Date;
	y1?: number | Date;
	y2?: number | Date;
	enabled: boolean;
};

/** An interactive drag-to-select rectangle (svelteplot's `Brush`), drawn in screen space. */
export type BrushMarkerConfig = {
	type: 'brush';
	brush?: BrushSelection;
	limitDimension?: false | 'x' | 'y';
	constrainToDomain?: boolean;
	resizeHandleSize?: number;
	onbrushstart?: (event: MouseEvent & { brush: BrushSelection }) => void;
	onbrush?: (event: MouseEvent & { brush: BrushSelection }) => void;
	onbrushend?: (event: MouseEvent & { brush: BrushSelection }) => void;
	styles?: StrokeStyle;
} & Pick<CommonMarkerConfig, 'series'> &
	ClipUnawareMarkerConfig;
