# Plots

Every plot kind shares one set of props (see [Concepts](concepts.md)). They differ in what they draw, which channels they need and how they hover.

| Plot                                | Draws                                   | Needs                                                 |
| ----------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| [LinePlot](plots/line.md)           | A line per series                       | `x`, `y`                                              |
| [AreaPlot](plots/area.md)           | A filled area per series                | `x`, `y`                                              |
| [BarPlot](plots/bar.md)             | Bars, grouped, stacked or horizontal    | a category channel and a value channel                |
| [HistogramPlot](plots/histogram.md) | Counts of a numeric field in bins       | `x` or `y`                                            |
| [BoxPlot](plots/box.md)             | The distribution of values per category | a category channel and a value channel                |
| [LollipopPlot](plots/lollipop.md)   | One dot on a stem per category          | a category channel and a value channel                |
| [DumbbellPlot](plots/dumbbell.md)   | Two dots per category, joined           | a category channel, a value channel, two series       |
| [ClevelandPlot](plots/cleveland.md) | Any number of dots per category, joined | a category channel, a value channel, a series per dot |
| [ForestPlot](plots/forest.md)       | One dot on an interval per row          | a category channel, a value channel, `lower`/`upper`  |
| [HeatmapPlot](plots/heatmap.md)     | A grid of colored cells                 | `x`, `y`, `color`                                     |
| [PyramidPlot](plots/pyramid.md)     | Two series mirrored around zero         | a category channel, a value channel, two series       |
| [ScatterPlot](plots/scatter.md)     | A point per row                         | `x`, `y`                                              |
| [GeoPlot](geo.md)                   | A map from GeoJSON or TopoJSON          | `data` (see [Maps](geo.md))                           |

All of them accept `data` with `grouping`/`color`, or pre-built `series`.
