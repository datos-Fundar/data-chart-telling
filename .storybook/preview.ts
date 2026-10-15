import type { Preview } from '@storybook/svelte-vite';
import { setConfiguration } from '$lib/configuration/config.svelte';
import { THEMES } from '$lib/configuration/themes';
import { renderSource } from '../stories/common/docsSource';

const preview: Preview = {
	// Storybook's object control always expands `data` in full, with no option
	// to collapse it, so the control is hidden for every story instead.
	argTypes: {
		data: { control: false }
	},
	beforeEach: () => {
		// `DEFAULT_CONFIG` follows the host's fonts and styles, and a Storybook
		// canvas has none; apply the Default preset (a system sans-serif font)
		// so every story shows a clean look out of the box. Runs
		// before each story, so it re-asserts even after a story (e.g. the
		// Configuration demo) resets or switches the global config.
		setConfiguration(THEMES.Default);
	},
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		docs: {
			source: {
				type: 'dynamic',
				// Overridable per-story via `parameters.docs.source.code` - see `renderSource`.
				transform: (_src: string, ctx: any) => {
					const c = ctx.component as any;
					const name =
						ctx.parameters?.docs?.source?.name ||
						c?.displayName ||
						c?.__name ||
						c?.name ||
						ctx.title?.split('/').pop() ||
						'Component';
					return renderSource(name, ctx.args ?? {});
				}
			}
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo'
		},

		options: {
			// Unlisted stories fall back to alphabetical order.
			storySort: {
				order: [
					'Plots',
					[
						'AreaPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							'Tooltip'
						],
						'BarPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							['Rules', 'Hover'],
							'Tooltip'
						],
						'GeoPlot',
						[
							'Series',
							'Scales',
							'Coordinates',
							['Projection', 'Zoom', 'Pan', 'Rotate', 'Camera', 'CameraTransition'],
							'Styles',
							'Segments',
							'Markers',
							['Graticule', 'Dot', 'Vector', 'Link', 'Contour', 'Inset', 'Hover', 'Custom'],
							'Tooltip'
						],
						'HeatmapPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							['Rules', 'Hover'],
							'Tooltip'
						],
						'HistogramPlot',
						[
							'Series',
							'Scales',
							'Tooltip',
							'Transforms',
						],
						'LinePlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							['Rules', 'Deltas', 'Custom'],
							'Tooltip'
						],
						'PyramidPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							['Rules'],
							'Tooltip'
						],
						'ScatterPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Bubble',
							'Markers',
							['Rules', 'Hover', 'Custom'],
							'Tooltip'
						],
					],
					'Channels',
					[
						'Color',
						[
							'Plot Level',
							'Marker Level',
							'Independent Ramps'
						],
						'Length',
						'Opacity',
						'R',
						'Symbol',
						'X1X2Y1Y2'
					],
					'Transforms',
					[
						'Bin',
						'Stack',
					],
					'Markers',
					[
						'Area',
						'Arrow',
						'Bar',
						'Box',
						'Brush',
						'Cell',
						'Contour',
						'Custom',
						'Delaunay',
						'Delta',
						'Density',
						'Difference',
						'Dot',
						'Geo',
						'Graticule',
						'Hover',
						'Hull',
						'Image',
						'Inset',
						'Line',
						'Link',
						'Raster',
						'Rect',
						'Rule',
						'Sphere',
						'Text',
						'Tick',
						'Trail',
						'Vector',
						'Voronoi',
						'Waffle',
					],
					'Layout',
					[
						'Facets',
						['Grid', 'MarginAlignment', 'Paginated', 'Carousel', 'RowsAndCols'],
						'Legend',
						['Automatic', 'Discrete', 'Continuous', 'Composition', 'Interactive', 'Paginated'],
						'Statistics',
						'Timeline',
						['Rule', 'Player'],
						'Tooltip',
						['Basics', 'MultiSeries', 'Customization', 'FacetSync'],
					],
					'Configuration',
					'Composition',
					['Chrome', 'Plot', 'PlotComposer']
				]
			}
		}
	}
};

export default preview;
