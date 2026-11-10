import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { BoxGeometry } from '$lib/markers/labels/geometry/BoxGeometry';
import { PointGeometry } from '$lib/markers/labels/geometry/PointGeometry';
import { BoxLayout } from '$lib/markers/labels/layouts/BoxLayout';
import { PathLayout } from '$lib/markers/labels/layouts/PathLayout';
import { PointLayout } from '$lib/markers/labels/layouts/PointLayout';
import { LabelMerge } from '$lib/markers/labels/LabelMerge';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type {
	BoxLabelConfig,
	BoxLabelMarker,
	BoxScales,
	BoxedMarker
} from '$lib/types/markers/labels/box';
import type { LabelLayout, MarkerLabelConfig } from '$lib/types/markers/labels/common';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { PathLabelConfig } from '$lib/types/markers/labels/path';
import type { TextMarkerConfig } from '$lib/types/markers/basic/text';

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
	static isOnShape(marker: { type?: string }, label: MarkerLabelConfig): boolean {
		const layout = MarkerLabels.layoutOf(marker, label);
		return layout === 'box' || (layout === 'path' && (label as PathLabelConfig).side === 'inside');
	}

	/** The `'box'` and `'path'` labels of a marker, drawn with its shapes. */
	static build(marker: Labelled, plot: LabelPlot = {}): BoxLabelMarker[] {
		const shape = MarkerKinds.of(marker.type)?.labels?.box;
		if (!shape) return [];
		const options = { data: marker.data, scales: plot.scales, gap: plot.gap };
		return MarkerLabels.list(marker).flatMap((label) => {
			const layout = MarkerLabels.layoutOf(marker, label);
			if (layout !== 'box' && layout !== 'path') return [];
			const geometry = BoxGeometry.of(shape, marker, plot);
			if (!geometry) return [];
			const built =
				layout === 'box'
					? BoxLayout.build(label as BoxLabelConfig, geometry, options)
					: PathLayout.build(label as PathLabelConfig, geometry, options);
			return built ? [built] : [];
		});
	}

	/**
	 * `markers` without their `'point'` labels, and those labels as `text` markers, merged where alike so they
	 * declutter together. `rows` are what a marker with no `data` of its own draws.
	 */
	static extractPoints<T extends object>(
		markers: T[],
		plot: { rows?: unknown[]; valueAxis?: 'x' | 'y'; isHorizontal?: boolean; gap?: number } = {}
	): { markers: T[]; labels: TextMarkerConfig[] } {
		const labels: TextMarkerConfig[] = [];
		const stripped = markers.map((marker) => {
			const own = marker as Labelled & { series?: string; grouping?: unknown; y2?: unknown };
			const traits = MarkerKinds.of(own.type)?.labels;
			const shape = traits?.point;
			const all = MarkerLabels.list(own);
			const points = all.filter((label) => MarkerLabels.layoutOf(own, label) === 'point');
			if (points.length === 0) return marker;
			const point =
				shape && PointGeometry.of(shape, own, { box: traits.box, isHorizontal: plot.isHorizontal });
			if (point) {
				const rows =
					own.data ??
					(plot.rows ?? []).filter(
						(row) =>
							own.series === undefined ||
							(row as Record<string, unknown>)[SERIES_KEY] === own.series
					);
				for (const label of points) {
					const text = PointLayout.build(label as PointLabelConfig, point, rows, {
						grouping: own.grouping,
						valueAxis: plot.valueAxis,
						gap: plot.gap
					});
					if (text) labels.push(text);
				}
			}
			const rest = all.filter((label) => !points.includes(label));
			return { ...marker, label: rest.length > 0 ? rest : undefined } as T;
		});
		return { markers: stripped, labels: LabelMerge.merge(labels) };
	}
}
