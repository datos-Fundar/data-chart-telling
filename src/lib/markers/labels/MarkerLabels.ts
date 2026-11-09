import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { BoxGeometry } from '$lib/markers/labels/geometry/BoxGeometry';
import { BoxLayout } from '$lib/markers/labels/layouts/BoxLayout';
import type { BoxLabelMarker, BoxScales, BoxedMarker } from '$lib/types/markers/labels/box';
import type { LabelLayout, MarkerLabelConfig } from '$lib/types/markers/labels/common';

type Labelled = BoxedMarker & { label?: MarkerLabelConfig | MarkerLabelConfig[] };

type LabelPlot = { isHorizontal?: boolean; scales?: () => BoxScales | undefined; gap?: number };

/** A marker's labels, each laid out in its `layout` (else its kind's) on the geometry its kind gives it. */
export class MarkerLabels {
	static list(marker: { label?: MarkerLabelConfig | MarkerLabelConfig[] }): MarkerLabelConfig[] {
		const { label } = marker;
		return label === undefined ? [] : Array.isArray(label) ? label : [label];
	}

	/** Maps each label, keeping a single one single. */
	static map<T>(marker: T, fn: (label: MarkerLabelConfig) => MarkerLabelConfig): T {
		const { label } = marker as { label?: MarkerLabelConfig | MarkerLabelConfig[] };
		if (label === undefined) return marker;
		return { ...marker, label: Array.isArray(label) ? label.map(fn) : fn(label) };
	}

	/** `undefined` when the kind does not support it. */
	static layoutOf(marker: { type?: string }, label: MarkerLabelConfig): LabelLayout | undefined {
		const traits = MarkerKinds.of(marker.type)?.labels;
		if (!traits) return undefined;
		const layout = label.layout ?? traits.default;
		return traits[layout] === undefined ? undefined : layout;
	}

	/** Whether it is read on its shape's color. */
	static isOnShape(label: MarkerLabelConfig): boolean {
		return (label.layout ?? 'box') === 'box' && !label.outside;
	}

	static build(marker: Labelled, plot: LabelPlot = {}): BoxLabelMarker[] {
		const shape = MarkerKinds.of(marker.type)?.labels?.box;
		if (!shape) return [];
		return MarkerLabels.list(marker).flatMap((label) => {
			if (MarkerLabels.layoutOf(marker, label) !== 'box') return [];
			const geometry = BoxGeometry.of(shape, marker, plot);
			return geometry
				? [
						BoxLayout.build(label, geometry, {
							data: marker.data,
							scales: plot.scales,
							gap: plot.gap
						})
					]
				: [];
		});
	}
}
