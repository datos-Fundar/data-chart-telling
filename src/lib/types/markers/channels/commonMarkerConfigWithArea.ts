import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the fill and opacity channels. */
export type CommonMarkerConfigWithArea = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill?: (d: any) => string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	opacity?: string | ((d: any) => unknown);
};
