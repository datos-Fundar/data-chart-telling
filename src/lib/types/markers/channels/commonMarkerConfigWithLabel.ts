import type { TextLabelConfig } from '$lib/types/markers/basic/text';

/** The markers that draw a shape per row, which can write a label in each one. */
export type CommonMarkerConfigWithLabel = {
	/**
	 * A label for each shape, written by a `text` marker: every option of one but `type`, `data`, `x` and `y`,
	 * which the shape sets. The label is centred on its shape, and fitted to it unless `fit` is `false` - see
	 * {@link TextFitConfig}. It never takes the pointer from the shape under it.
	 */
	label?: TextLabelConfig;
};
