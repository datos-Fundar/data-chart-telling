import type { BoxMarkerConfig } from '$lib/types/markers/common';

/**
 * Options for `type: 'box'` — the box plot's own styling and tick options,
 * same fields and defaults as a `box` marker (see `BoxMarkerConfig`'s own
 * doc comment). Summarizes the source's own distribution, one box per
 * category.
 */
export type BoxStatisticOptions = Omit<BoxMarkerConfig, 'type' | 'data' | 'x' | 'y' | 'series'>;
