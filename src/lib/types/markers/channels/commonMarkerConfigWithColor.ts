import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the color ramp channel. */
export type CommonMarkerConfigWithColor = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	color?: string | ((d: any) => unknown);
};
