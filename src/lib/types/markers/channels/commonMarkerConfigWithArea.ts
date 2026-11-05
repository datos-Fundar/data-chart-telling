import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the opacity channel. */
export type CommonMarkerConfigWithArea = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	opacity?: string | ((d: any) => unknown);
};
