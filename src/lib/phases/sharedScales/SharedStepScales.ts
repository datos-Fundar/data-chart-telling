type Extent = { domain: unknown[]; nice?: boolean };
type ScalesByPanel = Record<string, Record<string, Extent | undefined>>;

/** A channel's numeric extent, or a date one - `undefined` for any other domain. */
function extentOf(domain: unknown[] | undefined): [number, number] | undefined {
	if (domain?.length !== 2) return undefined;
	const [lo, hi] = domain.map((v) => (v instanceof Date ? +v : v));
	return typeof lo === 'number' && typeof hi === 'number' ? [lo, hi] : undefined;
}

export const SharedStepScales = {
	/**
	 * The domains the slices of a timeline share, when its steps each draw their own rows: a step's rows
	 * stack, aggregate or bin among themselves, so the extent the whole run reads across every step is
	 * wider than any step's. `whole` is the shared scales read over every row, and `steps` the same over each
	 * step's rows. A numeric (or date) extent becomes the widest any step reaches; a band or categorical
	 * domain stays the whole run's, which holds every category.
	 */
	over(
		whole: Record<string, object> | undefined,
		bands: string[],
		steps: (Record<string, object> | undefined)[]
	): Record<string, object> | undefined {
		if (!whole) return whole;
		const out: ScalesByPanel = {};
		for (const [panel, scales] of Object.entries(whole as ScalesByPanel)) {
			out[panel] = { ...scales };
			for (const [channel, scale] of Object.entries(scales)) {
				if (!scale || bands.includes(channel)) continue;
				const own = extentOf(scale.domain);
				if (!own) continue;
				const extents = steps
					.map((step) => extentOf((step as ScalesByPanel | undefined)?.[panel]?.[channel]?.domain))
					.filter((extent): extent is [number, number] => extent !== undefined);
				if (!extents.length) continue;
				const lo = Math.min(...extents.map(([a]) => a));
				const hi = Math.max(...extents.map(([, b]) => b));
				out[panel][channel] = {
					...scale,
					domain: scale.domain[0] instanceof Date ? [new Date(lo), new Date(hi)] : [lo, hi]
				};
			}
		}
		return out as Record<string, object>;
	}
};
