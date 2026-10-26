# Plots

Every plot kind shares one set of props (see [Concepts](concepts.md)). They differ in what they draw, which channels they need and how they hover.

| Category     | Plot                                             | Draws                                                                 | Needs                                                   |
| ------------ | ------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
| Distribution | [DensityPlot](plots/distribution/density.md)     | A smoothed distribution of a numeric field                            | `x` or `y`                                              |
| Distribution | [HistogramPlot](plots/distribution/histogram.md) | Counts of a numeric field in bins                                     | `x` or `y`                                              |
| Distribution | [BoxPlot](plots/distribution/box.md)             | The distribution of values per category                               | a category channel and a value channel                  |
| Distribution | [ViolinPlot](plots/distribution/violin.md)       | The mirrored density of values per category, with a box inside        | a category channel and a value channel                  |
| Distribution | [RaincloudPlot](plots/distribution/raincloud.md) | Half the density of values per category, its values as dots and a box | a category channel and a value channel                  |
| Distribution | [PyramidPlot](plots/distribution/pyramid.md)     | Two series mirrored around zero                                       | a category channel, a value channel, two series         |
| Correlation  | [HeatmapPlot](plots/correlation/heatmap.md)      | A grid of colored cells                                               | `x`, `y`, `color`                                       |
| Correlation  | [ScatterPlot](plots/correlation/scatter.md)      | A point per row                                                       | `x`, `y`                                                |
| Ranking      | [BarPlot](plots/ranking/bar.md)                  | Bars, grouped, stacked or horizontal                                  | a category channel and a value channel                  |
| Ranking      | [BulletPlot](plots/ranking/bullet.md)            | A bar against a target, over graded ranges                            | a category channel, a value channel, `target`, `ranges` |
| Ranking      | [LollipopPlot](plots/ranking/lollipop.md)        | One dot on a stem per category                                        | a category channel and a value channel                  |
| Ranking      | [DumbbellPlot](plots/ranking/dumbbell.md)        | Two dots per category, joined                                         | a category channel, a value channel, two series         |
| Ranking      | [ClevelandPlot](plots/ranking/cleveland.md)      | Any number of dots per category, joined                               | a category channel, a value channel, a series per dot   |
| Ranking      | [ForestPlot](plots/ranking/forest.md)            | One dot on an interval per row                                        | a category channel, a value channel, `lower`/`upper`    |
| Evolution    | [LinePlot](plots/evolution/line.md)              | A line per series                                                     | `x`, `y`                                                |
| Evolution    | [AreaPlot](plots/evolution/area.md)              | A filled area per series                                              | `x`, `y`                                                |
| Evolution    | [SparklinePlot](plots/evolution/sparkline.md)    | A small line with its last value, no axes                             | `x`, `y`                                                |
| Evolution    | [SlopePlot](plots/evolution/slope.md)            | A line per series between two positions                               | a category channel with two values, a value channel     |
| Map          | [GeoPlot](geo.md)                                | A map from GeoJSON or TopoJSON                                        | `data` (see [Maps](geo.md))                             |

All of them accept `data` with `grouping`/`color`, or pre-built `series`.
