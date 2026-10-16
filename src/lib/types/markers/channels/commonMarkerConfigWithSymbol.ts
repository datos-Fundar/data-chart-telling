import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the categorical shape channel `symbol`. */
export type CommonMarkerConfigWithSymbol = CommonMarkerConfig & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	symbol?: string | ((d: any) => unknown);
};
