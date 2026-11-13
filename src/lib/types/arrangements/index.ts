import type { TreemapArrangement } from '$lib/types/arrangements/treemap';
import type { FlowArrangement } from '$lib/types/arrangements/flow';

/** How a graph kind places its rows in a space of its own: run as a transform, but only by the kind itself. */
export type ArrangementTransform = TreemapArrangement | FlowArrangement;
