import type { FacetStageState } from './facet/phase';

/**
 * What a {@link Pipeline.runData} leaves: every panel's part of the
 * data phases, and the domains its slices (facet panels, timeline steps)
 * share, keyed by panel - `''` for the whole run without a facet. Without a
 * domain there, a slice fits its own. Author `scales` win.
 */
export type DataRunState = FacetStageState & { sharedScales?: Record<string, object> };
