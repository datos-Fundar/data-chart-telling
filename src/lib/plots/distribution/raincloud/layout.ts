import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { MarkerTransform } from '$lib/types/transforms';
import type {
	RaincloudBoxStyle,
	RaincloudPlotStylesConfig
} from '$lib/types/plots/distribution/raincloud/props';
import type { RaincloudPlotState } from '$lib/types/plots/distribution/raincloud/state';

/**
 * Across each series' share of the band, in fractions from its middle toward the
 * side the cloud rises on: where the box centers and the stretch the rain falls
 * over, by box position. The cloud grows from the middle out to that side.
 */
const LAYOUT: Record<
	NonNullable<RaincloudBoxStyle['position']>,
	{ box: number; rain: [number, number] }
> = {
	between: { box: -0.06, rain: [-0.45, -0.14] },
	cloud: { box: 0.06, rain: [-0.42, -0.06] },
	rain: { box: -0.24, rain: [-0.42, -0.06] }
};

/**
 * Where a raincloud's parts sit across its share of the band. The cloud rises
 * toward the end of a vertical band and the top of a horizontal one, so every
 * fraction is signed by that side.
 */
export class RaincloudLayout {
	/** `1` when the cloud rises toward the end of the band, `-1` toward its start. */
	static toward<TData extends Record<string, unknown>>(state: RaincloudPlotState<TData>): 1 | -1 {
		return state.axes?.isHorizontal ? -1 : 1;
	}

	/** Where the box centers, as a fraction of the share from its middle. */
	static box<TData extends Record<string, unknown>>(state: RaincloudPlotState<TData>): number {
		return RaincloudLayout.#of(state).box * RaincloudLayout.toward(state);
	}

	/**
	 * The plot's transforms with the rain's scatter first: a jitter across the
	 * band as wide as the rain's stretch - the author's own jitter of the category
	 * axis merged over it, the author's props winning - shifted onto the stretch,
	 * and every other transform after them in order.
	 */
	static transforms<TData extends Record<string, unknown>>(
		state: RaincloudPlotState<TData>
	): MarkerTransform[] {
		const own = state.transforms ?? [];
		const horizontal = PlotAxes.categoryOf(state) === 'y';
		const [from, to] = RaincloudLayout.#of(state).rain.map(
			(u) => u * RaincloudLayout.toward(state)
		);
		const jitter = (horizontal ? 'jitterY' : 'jitterX') as 'jitterX';
		const shift = (horizontal ? 'shiftY' : 'shiftX') as 'shiftX';
		const merged = own
			.filter((t) => t.type === jitter)
			.reduce<MarkerTransform>((all, t) => ({ ...all, ...t }) as MarkerTransform, {
				type: jitter,
				width: Math.abs(to - from) / 2
			});
		return [merged, { type: shift, by: (from + to) / 2 }, ...own.filter((t) => t.type !== jitter)];
	}

	static #of<TData extends Record<string, unknown>>(state: RaincloudPlotState<TData>) {
		const box = (state.styles as RaincloudPlotStylesConfig | undefined)?.box;
		return LAYOUT[(typeof box === 'object' ? box.position : undefined) ?? 'between'];
	}
}
