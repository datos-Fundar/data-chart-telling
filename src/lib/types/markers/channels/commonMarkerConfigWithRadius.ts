import type { CommonMarkerConfigWithArea } from './commonMarkerConfigWithArea';

/** Fill and opacity channels plus the per-row radius `r`. */
export type CommonMarkerConfigWithRadius = CommonMarkerConfigWithArea & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	r?: number | string | ((d: any) => number);
};
