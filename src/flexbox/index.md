By default the browser lays out elements in lines going down the page. Each new block element starts a new line, so all the blocks are stacked on top of each other. This is fine for a document, but there are many times when you'll want to arrange these block elements to be side-by-side, in multiple columns on the same line. This is known as a **multi-column layout**, and until recently, it's been surprisingly hard to do.

In the bad old days of the web (90s and 2000s) many web developers turned to `<table>` elements to create multi-column layouts, but as many others pointed out, this was a horrible semantic misuse of that element. Although tables happen to create a grid-like layout, they are meant for rows of data, not random content you just want to layout side-by-side. Plug-ins that helped you import data from `<table>` elements into spreadsheets like Excel would mistakenly treat all multi-column layouts as tables of data!

The other common approach was to use [floated elements](../csslayout/#secfloatedelements). Each column in the layout was floated to the left and given a fixed width. The columns that followed then floated up next to their previous sibling columns. At the end of the row the floats were cleared so that the next block element would start a new line. It sounds straightforward in theory, but it was very difficult to make it work consistently across all browsers. Clearing the floats reliably also required some [really hacky tricks](https://css-tricks.com/snippets/css/clear-fix/).

Thankfully, a new standard was published in 2012 that makes multi-column layouts easy and reliable: [flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/). It's now [widely supported in all the current browsers](https://caniuse.com/#feat=flexbox), but if you still need to support IE 9 or earlier, you'll have to use the older float technique.

## The Basics

Creating a multi-column flexbox layout is super-easy. Follow along by creating a new HTML page, and adding this content to the body, or by [opening this example over in CodePen](https://codepen.io/drstearns/pen/xLjmmb).

```html
<div class="row">
    <div class="col">
        <h2>First Column</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, nihil? Fugit corporis dignissimos earum magnam pariatur quos id ducimus dolor! Laboriosam tempora repudiandae amet dolorum assumenda. Nam, animi doloremque. Inventore!</p>
    </div>
    <div class="col">
        <h2>Second Column</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, nihil? Fugit corporis dignissimos earum magnam pariatur quos id ducimus dolor! Laboriosam tempora repudiandae amet dolorum assumenda. Nam, animi doloremque. Inventore!</p>
    </div>
    <div class="col">
        <h2>Third Column</h2>                
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, nihil? Fugit corporis dignissimos earum magnam pariatur quos id ducimus dolor! Laboriosam tempora repudiandae amet dolorum assumenda. Nam, animi doloremque. Inventore!</p>
    </div>
    <div class="col">
        <h2>Fourth Column</h2>                
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, nihil? Fugit corporis dignissimos earum magnam pariatur quos id ducimus dolor! Laboriosam tempora repudiandae amet dolorum assumenda. Nam, animi doloremque. Inventore!</p>
    </div>
</div>
```

<p><a href="https://codepen.io/drstearns/pen/xLjmmb?editors=1100" class="button is-primary">Open in CodePen</a></p>

When creating elements for a multi-column flexbox layout, add one element for the entire row, and one child element for each column in your layout. Here we also add a style class name to the row and column elements so that we can select them more easily in our CSS. The style class names we are using are typical, but there's nothing magic about those names: they are just names we can refer to in our CSS selectors. You can use any class name you want, or elements selectors if you use distinct element names instead.

Open the page, and note that the columns are all stacked on top of each other by default. To make these be side-by-side, add a stylesheet to your page, and define this one rule to make it multi-column:

```css
/* select all `class="row"` elements and make them flexboxes */
.row {
	display: flex;
}
```

Setting `display: flex;` on the `.row` element tells the browser to make it a flexbox. The immediate child elements will then become columns on the same line. 

By default the browser will adjust the width of these columns based on their content. In this case, the columns have a bunch of text in them, so the browser grows their width up to 25% of the row width, and then wraps the text within the column. It stops at 25% because there are four columns in the row, and each column gets an equal share of the row width by default.

## Growing Columns

But what if the columns don't have much content? What if they only need a small amount of width each? To see what happens, remove the `<p>Lorem...</p>` elements from the HTML, or open [this already-altered example in CodePen](https://codepen.io/drstearns/pen/LjmqpR).

You'll notice that the columns are now only as wide as the headings, and are scrunched up against each other, taking up only part of the row width. This is because columns only grow in width to fit their content by default. If you want them to grow to consume an equal amount of the row width, regardless of their content, add another CSS rule to your stylesheet:

```css
.col {
	flex-grow: 1;
}
```

<p><a href="https://codepen.io/drstearns/pen/LjmqpR?editors=1100" class="button is-primary">Open in CodePen</a></p>

This tells the browser to grow all of your `<div class="col">` elements equally so that they consume the entire width of the containing flexbox, regardless of their content. If you want the content to be centered instead of left-aligned, just add `text-align: center;` to the `.col` rule.

Flexbox also makes it easy to grow some columns while letting others size only to match their content. For example, say you want to show an icon or two on the far right, but have the content in the first column grow to consume the rest of the available row width. Change your HTML content to this (requires [Font Awesome](http://fontawesome.io/) for the icon):

```html
<div class="row">
  <div class="col">
    <h2>This Column Grows</h2>
  </div>
  <div class="col-icons">
    <h2><span class="fa fa-home"></span></h2>
  </div>
</div>
```

<p><a href="https://codepen.io/drstearns/pen/xLjMRO?editors=1100" class="button is-primary">Open in CodePen</a></p>

Because we use `class="col-icons"` on the second column, that element will no longer be selected by our `.col` style rule, so it won't get the `flex-grow: 1` property setting. The other column will, so it will grow to consume the rest of the available row width. This will continue to work even if we add more icons to the right side: that column will grow only as large as it needs to be to show its content, but the first column will grow to consume the remaining row width.

## Specifying Widths Explicitly

So far we've seen how to make columns just wide enough to fit their content, or grow to consume the available row width, but what if you want to specify an exact column width, like 20% or 300 pixels? You can do this using the `flex-basis` property.

When you start setting widths explicitly, it's a good idea to also tell the browser that you want the element's padding and borders to be included in the element's width. By default, browsers consider an element's width to be only the width of the content area: padding and borders are then added on top of that. So if you set the width of an element to be `300px` but then add `10px` of padding to the left and right sides, the overall width of the element will actually be `320px` by default.

To make the browser include padding and borders when setting the widths of all elements, use a rule like this:

```css
/* select all elements in the page */
* {
	/* include padding and borders when setting element widths */
	box-sizing: border-box;
}
```

Once you specify this, you can now set explicit widths on your columns. For example, say you want a two column layout where the first column (your navigation area) is exactly 200 pixels, and the second (the main content area) grows to fill the remaining row width. Start with HTML like this:

```html
<div class="row">
	<nav>
		<h2>Navigation Area</h2>
	</nav>
	<main>
		<h2>Main Content Area</h2>
	</main>
</div>
```

Then use this CSS in your stylesheet:

```css
* {
	box-sizing: border-box;
}
.row {
	display: flex;
}
nav {
	/* set column width to exactly 200 pixels with 1rem of padding */
	flex-basis: 200px;
	padding: 1rem;
	background-color: #CFD8DC; /* just to highlight the area */
}
main {
	/* grow the main content area to consume the rest of the row width */
	flex-grow: 1;
	padding: 1rem;
	background-color: #BBDEFB; /* just to highlight the area */
}
```

<p><a href="https://codepen.io/drstearns/pen/wqjOPa?editors=1100" class="button is-primary">Open in CodePen</a></p>

## Vertical Centering

Flexbox also solves another long-standing problem: vertically-centering content. A few years ago it became trendy to make the first block of content on your page the same height as the browser's viewport, with some splashy content right in the center. This was quite tricky before flexbox, but is now almost trivial.

Start with HTML like this:

```html
<section class="fullpage">
	<div class="content">
		<h2>Some Splashy Content</h2>
		<p>blah, blah, blah</p>
	</div>
</section>
<section>
	<p>Some more content you see when you scroll down...</p>
</section>
```

Then add some CSS to make the `.fullpage` element a flexbox that stretches to fill the entire viewport, and centers the `.content` element both vertically and horizontally:

```css
* {
	box-sizing: border-box
}
body {
	/* remove the default margin on the body */
	margin: 0;
	font-family: "Helvetica Neue", Helvetica, sans-serif;
}
section {
	padding: 1rem;
}
.fullpage {
	display: flex;
	/* vertically-center the child elements of the flexbox */
	align-items: center;
	/* horizontally-center the child elements as well */
	justify-content: center;
	/* make it 100% of the viewport height */
	height: 100vh;
	/* shade the background */
	background-color: #CCC;
	/* center align all text */
	text-align: center;
}
.fullpage .content h2 {
	font-weight: 100;
	font-size: 5rem;
}
```

<p><a href="https://codepen.io/drstearns/pen/zdjXGm?editors=1100" class="button is-primary">Open in CodePen</a></p>

When you open this page, you see only the first section consuming the entire browser viewport, regardless of how large the browser window is. Try resizing your window and you'll notice how the first section grows to fill it. When you scroll down, you then see the second section, and any other elements you might add after it.

## More Information and Practice

THe Flexbox standard defines several other properties you can use to precisely control a multi-column layout. To learn more, check out these very helpful resources:

- [The Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- Test your Flexbox skills by playing [Flexbox Froggy!](http://flexboxfroggy.com/)











