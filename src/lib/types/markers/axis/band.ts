import type { AxisValue } from '$lib/types/layout/mapping';
import type { BandSlice } from '$lib/types/layout/hover';
import type { AreaStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/**
 * The band of a category on a band axis, across the whole of the other axis: one per category, however many rows
 * name it. On an axis that is not a band scale it draws nothing.
 */
export type BandMarkerConfig = {
	type: 'band';
	axis: 'x' | 'y';
	/**
	 * Which band. A list draws one at each category (without `data`); with `data`, a field key or a function of the
	 * row gives each row's own.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: AxisValue | string | (AxisValue | string)[] | ((d: any) => AxisValue);
	/**
	 * The part of the band it fills, as the fractions of its width left out at its start and its end (a grouped
	 * bar's series' slice). A function of the row gives each row's own; a band several rows share fills what all of
	 * them do. Unset, the whole band.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	slice?: BandSlice | ((d: any) => BandSlice | undefined);
	styles?: PerRow<AreaStyle>;
} & Omit<CommonMarkerConfig, 'x' | 'y'>;
