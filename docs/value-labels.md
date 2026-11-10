# Value labels

A plot can write its values on its own shapes: the value of each bar, the last value of each line, the count of each bin. They are the plot's `styles.values`. This page goes from turning them on to placing them precisely; the _Layout/Values_ stories in Storybook show every option drawn.

## Turning them on

```svelte
<BarPlot {data} x="province" y="value" styles={{ values: { show: true } }} />
```

Setting any option of `styles.values` turns the labels on, so `show: true` is only needed alone: `styles={{ values: { decimals: 1 } }}` draws them too. `show: false` turns them off whatever else is set. A heatmap and a treemap show theirs by default.

Each plot kind places them its own way: past the tip of each bar, beside the last point of each line, on a free spot around each dot of a scatter, in the middle of each cell. The rest of this page is about changing that.

## What a label says

A label writes the value it labels, as `decimals`, `prefix`, `suffix` and `signDisplay` ask, over the configuration's `numbers` (see [Number format](theming.md#number-format)):

```ts
styles: { values: { decimals: 1, signDisplay: 'always', suffix: ' yrs' } }
```

`format(value, number, context)` writes anything else. `number` writes a value as the fields above ask; `context` is what the plot knows of the labelled row (see [Row context](state.md#row-context)): its `series`, its `row` with the other fields of the data, and what the plot kind works out, such as a histogram bin's `count` or a treemap tile's `share`.

```ts
format: (value, number, { series, row }) => `${row.country}: ${number(value)}`;
```

## Which rows

`select` picks the rows labelled of each group: `'first'`, `'last'`, `'min'`, `'max'`, or a list of them. A group is a series on a line or area plot (where the default is `'last'`) and a category on the plots that join dots; elsewhere every row is labelled. `series` labels only the series named.

```ts
styles: { values: { select: ['min', 'max'], series: 'female' } }
```

On a bar, a heatmap or a histogram, `select` applies to the `'point'` layout below, which labels some shapes and leaves the others bare.

## Layouts

Where a label goes is its layout, one of three, named by the geometry it is laid out on:

| Layout    | Where                                                                                | Example                                            |
| --------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `'point'` | Beside a point of the shape: a line's last point, a dot, a corner of a bar           | `{ layout: 'point', side: 'above' }`               |
| `'path'`  | Along an edge or a stroke of the shape: past a bar's tip, along a line, around a dot | `{ layout: 'path', edge: 'base', side: 'inside' }` |
| `'box'`   | Inside the box of each shape, fitted to it: a bar, a cell, a tile                    | `{ layout: 'box', anchor: 'top' }`                 |

A plot kind takes the layouts its shapes can write, and its `styles.values` type takes only those: a line has no box to write in, so `LinePlot` takes `'point'` and `'path'`. Changing the layout is explicit, with `layout`; each kind brings its own defaults for every layout it takes, so `{ layout: 'path' }` alone is enough.

| Plot                                           | Default                                                | Also                                                  |
| ---------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Line, slope, sparkline                         | `'point'` after the last point                         | `'path'`: each series' name along its line            |
| Area                                           | `'point'` after the last point                         | `'path'`: along the top (or bottom) edge of each area |
| Bar, bullet, pyramid                           | `'path'` past each bar's tip; `'box'` on a stacked bar | `'box'`, `'point'`                                    |
| Histogram                                      | `'path'` past each bin's top                           | `'box'`, `'point'`                                    |
| Heatmap                                        | `'box'`                                                | `'path'`, `'point'`                                   |
| Treemap                                        | `'box'`                                                |                                                       |
| Scatter, Cleveland, dumbbell, lollipop, forest | `'point'` beside each dot                              | `'path'`: around each dot's rim                       |

## Beside a point: `'point'`

The point depends on the shape: on a line or an area, a row's own point; on a dot, its center; on a bar or a cell, a point of its box, which `anchor` names - an edge's middle (`'top'`...) or a corner (`'top-left'`...).

From that point, `side` says where the text goes, as it reads: `'after'` it (to its right), `'before'` it, `'above'`, `'below'` or `'on'` it. `gap` is how far, 6px across and 8px up or down by default.

```ts
styles: { values: { side: 'above', gap: 12 } }                      // a line's last value, over its point
styles: { values: { layout: 'point', anchor: 'top', select: 'max' } } // only the longest bar, over its top
```

Labels that would overlap move apart:

- On a line, they fan out into lanes along one column, each joined back to its point by an elbow; `strokeStyle` styles those connectors. The margin on that side grows to hold them while it is `'auto'`.
- On a scatter, each takes a free spot around its dot - above it first (its own `side`), then on clockwise - clear of the other labels and dots, and one with no room is left out.
- A label on its own point (`side: 'on'`) stays there; where a shape drawn after its own covers it, it is left out. Of dots drawn over one another, only the top one's value shows.

## Along a path: `'path'`

The path depends on the shape:

- On a bar or a cell, an edge of its box, which `edge` names: `'top'`, `'bottom'`, `'left'` or `'right'` as the page draws them, and on a bar `'tip'`, the end its value runs to, or `'base'`, the one at zero. The tip is read per row, so a bar below zero has its tip at its bottom, and a label past it goes under it.
- On a line, the line itself, curving with it: one label per series, its series' name unless `format` writes another.
- On an area, its top edge, or its bottom one with `edge: 'bottom'`; on a stack, each band's own.
- On a dot, its rim, over its top.

`side` is which side of the path the text sits on: on a shape `'outside'` (the default), `'inside'` or `'on'` its edge; on a line or an area `'above'` (the default), `'below'` or `'on'` it, where the text is drawn over a halo of the background. `offset` is where along the path, from its left or top end: `'start'`, `'middle'`, `'end'` or a percentage of its length; on a line or an area, `'max'` and `'min'` put each label at its own peak or trough. A label centred near an end of its line is moved in just enough to be written whole. `gap` is how far from it.

```ts
styles: { values: { layout: 'path', edge: 'tip', side: 'inside' } } // inside each bar's end
styles: { values: { layout: 'path', side: 'on', offset: '60%' } }    // each name on its line
```

A label along a path is written whole, not fitted to its shape. Along a straight-segmented line or area, it follows a smooth curve through the same points, so its letters do not spread apart at the corners.

## In a box: `'box'`

The label is written in the middle of its shape's box. `anchor` puts it against an edge (`'top'`, `'bottom'`, `'left'`, `'right'`) or in a corner (`'top-left'`...), `gap` from it.

A label in a box is fitted to it: one too wide is written smaller, down to `minFontSize`; at that size it breaks into the lines the box holds and the last one is cut short with an ellipsis; and when not even that fits, it is left out. `padding` is the room kept free inside each edge. The defaults of `gap`, `padding`, `minFontSize` (8) and `minLetters` (3) are the configuration's `text.label`: `setConfiguration({ text: { label: { gap: 6 } } })`.

## How labels look

- A label inside its shape - in a box, or along an edge with `side: 'inside'` - with no color of its own is written in the color that reads best on the shape: white on a dark one, near black on a light one, picked per shape from the configuration's `text.label.contrast`. The shape is read as it is seen: a `fillOpacity` under 1 blends it with the plot's `background`.
- A label outside its shape is written in its series' color on a line or an area, and in the axis color elsewhere. `color: 'series'` writes each in its series' color, and any other CSS color writes them all in it.
- `fontStyle` sets the text's look - `fontSize`, `fontWeight`, `fill`, `rotate`, `class`... - but never where it sits, which is the layout's.
- `hoverIsolate: true` dims every other series while the pointer is over a label.

## Labels on markers

A marker writes the same labels on its shapes with `label`, which takes a layout and its options like `styles.values`, with every option of a `text` marker besides (`text`, `styles`, `fit`, `declutter`...):

```ts
{ type: 'line', data, x: 'year', y: 'value', grouping: 'country',
  label: { layout: 'path', text: 'country', offset: '80%' } }
```

`text` is a field of the row, a function of it, or a literal. A list of labels writes each of them: `label: [{ text: 'value', anchor: 'top' }, { text: 'name', anchor: 'bottom' }]`. Each marker kind takes the layouts its shapes can write, `'box'` by default on shapes with a box and `'point'` on the others:

| Marker          | `'box'` | `'path'`                            | `'point'`                     |
| --------------- | ------- | ----------------------------------- | ----------------------------- |
| `bar`, `waffle` | default | its edges, `'tip'` and `'base'` too | a point of its box (`anchor`) |
| `rect`, `cell`  | default | its edges                           | a point of its box (`anchor`) |
| `line`, `trail` |         | the line                            | default: each row's point     |
| `area`          |         | its top or bottom edge              | default: each row's top       |
| `dot`           |         | its rim                             | default: its center           |

On a marker:

- `select` picks a `'point'` label's rows of each `grouping` of the marker; it also takes a function of the row. Rows without a place (a gap) are never labelled.
- `declutter: true` (or `'lanes'`) fans overlapping point labels into lanes, `declutter: 'around'` moves each to a free spot around its point. The point labels of every marker of a plot are laid out together, so the ends of several lines fan out as one.
- A label takes the pointer only with a handler of its own (`onpointerenter`...); the others leave it to the shape under it, so `onclick` and the hover go on as they were. Its styles take functions of the row, to dim the label of a series, say.
- A box label's `fit` takes `false`, or an object: `minFontSize`, `minLetters`, `padding`, and `fallback` - a value, a field or a function of the row, written instead when fewer than `minLetters` letters would show.
- `fitMargins: true` grows the plot's margins to hold a label that runs past them.

A `text` marker of your own takes the same `declutter`, and `covers`: the shape each row's point sits in, so a label covered by a later row's shape is left out.
