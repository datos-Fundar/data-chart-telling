import type { AxisValue } from '$lib/types/layout/mapping';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the interval channels `x1`/`x2`/`y1`/`y2`. */
export type CommonMarkerConfigWithInterval = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x1?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x2?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y1?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y2?: string | number | ((d: any) => AxisValue);
};
