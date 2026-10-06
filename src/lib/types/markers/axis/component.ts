import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** Mounts an arbitrary Svelte component as a mark, per series or per segment. */
export type CustomComponentMarkerConfig = {
	type: 'component';
	series?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: any;
	props?: Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any[];
	scope?: 'series' | 'segment';
} & ClipUnawareMarkerConfig;
