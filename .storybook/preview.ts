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
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				transform: (_src: string, ctx: any) => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			// What an `order` leaves out, or lists only as `'*'`, is sorted alphabetically.
			storySort: {
				method: 'alphabetical',
				order: [
					'Plots',
					[
						'Correlation',
						[
							'HeatmapPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'ScatterPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							]
						],
						'Distribution',
						[
							'BoxPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'DensityPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'HistogramPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'PyramidPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'ViolinPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							]
						],
						'Evolution',
						[
							'AreaPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'LinePlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'SlopePlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'SparklinePlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'StepPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							]
						],
						'Map',
						[
							'GeoPlot',
							// Every plot kind lists its sections the same way: series, scales, styles (`Basic` first, then
							// the others alphabetically), segments, markers (alphabetically), tooltip, and whatever else it
							// has (estimate, legend, curves...) alphabetically. Its coordinates also have an order of their own.
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'Coordinates',
								['Projection', 'Zoom', 'Pan', 'Rotate', 'Camera', 'CameraTransition'],
								'*'
							]
						],
						'Part of a whole',
						[
							'TreemapPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							]
						],
						'Ranking',
						[
							'BarPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'BulletPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'ClevelandPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'DumbbellPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'ForestPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							],
							'LollipopPlot',
							[
								'Series',
								'Scales',
								'Styles',
								['Basic', '*'],
								'Segments',
								'Markers',
								['*'],
								'Tooltip',
								'*'
							]
						]
					],
					'Channels',
					[
						'Color',
						['Plot Level', 'Marker Level', 'Independent Ramps'],
						'Length',
						'Opacity',
						'R',
						'Symbol',
						'X1X2Y1Y2'
					],
					'Transforms',
					[
						'Bin',
						'Bollinger',
						'Density',
						'Filter',
						'Group',
						'Interval',
						'Jitter',
						'Map',
						'Normalize',
						'Select',
						'Shift',
						'Sort',
						'Stack',
						'Treemap',
						'Window'
					],
					'Markers',
					[
						'Area',
						'Arrow',
						'Bar',
						'Bollinger',
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
						'Waffle'
					],
					'Layout',
					[
						'Events',
						'Facets',
						['Grid', 'MarginAlignment', 'Paginated', 'Carousel', 'RowsAndCols'],
						'Legend',
						['Automatic', 'Discrete', 'Continuous', 'Composition', 'Interactive', 'Paginated'],
						'Statistics',
						'Timeline',
						['Player', 'Rule'],
						'Tooltip',
						['Basics', 'MultiSeries', 'Customization', 'FacetSync'],
						'Values',
						['Layouts', 'Point', 'Path', 'Box', 'Parts', 'Text']
					],
					'Configuration',
					'Composition',
					['Chrome', 'PlotComposer', 'Custom Plots']
				]
			}
		}
	}
};

export default preview;
