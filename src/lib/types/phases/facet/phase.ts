import type { FacetConfig } from '$lib/types/layout/facet';

/** One facet panel: its key, its label, and in a `rows`/`cols` grid its row and col values. */
export type FacetPanel = { key: string; label: string; row?: string; col?: string };

/** What the "facet" phase reads from and writes to a plot's state. */
export type FacetStageState = {
	data?: Record<string, unknown>[];
	series?: unknown[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	facet?: FacetConfig<any>;
	/** Every panel the facet lays out, in layout order. */
	panels?: FacetPanel[];
	/** The panel a row belongs to: its own panel tag, or its facet values. `undefined` for a row no panel shows. */
	panelOf?: (row: Record<string | symbol, unknown>) => string | undefined;
	/** The plot's `segments`. The phase moves those that name a facet to the panels they name, or drops them without panels. */
	segments?: Record<string, object[]>;
	/** The plot's own markers. The phase tags those that name a facet with the panels they name, or drops them without panels. */
	authorMarkers?: object[];
};
