import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the per-row weight channel used by density estimates. */
export type CommonMarkerConfigWithWeight = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	weight?: string | ((d: any) => number);
};
