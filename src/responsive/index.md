These days the majority of people accessing any web site you build [will be using a small mobile touchscreen device](https://searchenginewatch.com/sew/opinion/2353616/mobile-now-exceeds-pc-the-biggest-shift-since-the-internet-began). But there will still be a significant minority who will also access that same site from a laptop or desktop device with a much larger monitor and mouse. This poses an interesting design dilemma: how do we build one site that looks and works well on both a tiny phone screen as well as a gigantic desktop monitor?

There is no magic formula for this, but there are some best practices, as well as some powerful CSS features that let us adjust our page's appearance and layout based on the screen size.

## Mobile-First Design

Because the majority of web traffic is now coming from mobile devices, the current best practice is to design your site for a mobile device first, and only later consider how you can take advantage of the larger screen of a desktop. This is known as **mobile-first design**. In general this boils down to the following principles:

- **Layout**: Blocks of content should typically stack on top of each other on narrow screens, but sit side-by-side on wider screens. You can also use the `width` or `max-width` properties to constrain the overall width of your content so that it doesn't stretch to ridiculous line lengths on super-wide monitors. Content [fixed to the viewport](../csslayout#secfixedelements) should be kept to a minimum on small screens, as it reduces the amount of scrollable screen real-estate.

- **Media**: Large images and video look great on large monitors, but typically don't work as well on small screens. They also take much longer to download over slow mobile links. Consider using background colors or [linear gradient fills](https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient) instead of background images on mobile. If you must use images, [compress them](https://tinypng.com/) or use lower-resolution images on mobile so that they download faster.

- **Fonts**: Font sizes may need to be adjusted so that text remains readable as the screen size changes. You can also increase the size of headings or callout text on wider monitors to take advantage of the extra room.

- **Navigation**: Site navigation links take up a lot of room on small screens and may end up wrapping to multiple lines. Keep the site navigation hidden on small screens and show it only when the user taps a menu icon (colloquially known as the "hamburger icon"). Most CSS frameworks (which we will learn about next) provide some kind of collapsible navigation on mobile.

- **Input and Interaction**: Tap/click targets need to be large-enough on mobile to select using a finger, especially for people with poor eyesight or thick fingers. Tiny icons placed right next to one another, or one-word hyperlinks are difficult to select accurately. Specifying a data type on form fields (e.g., email address, phone number, date, integer) also generates optimized on-screen keyboards, making data entry much easier.

- **Content**: For some sites, you may even want to adjust what content is shown to mobile users as opposed to desktop users. For example, a phone number might become a large telephone icon with a `tel:` hyperlink on phone-sized screens, but simply appear as a normal telephone number on larger screens.

## Media Rules

All of the style rules we saw in the [Essential CSS Tutorial](../css/) apply to all devices and screens regardless of size. But CSS now lets us define blocks of rules that apply only when the screen size is at least a particular width. We do this via [media rules](http://www.w3schools.com/cssref/css3_pr_mediaquery.asp), which look like this:

```css
/* these rules apply to _all_ screen sizes */
body {
    background-color: rgb(255,64,129); /* background color on small screens */
    font-size: 16px;                   /* default font size is 16 pixels */
}

@media (min-width: 768px) {
	/* these rules apply _only_ to screens 768 pixels and wider */

    body {
        background-image: url(...);   /* use background image on larger screens */
        font-size: 18px;              /* increase font size to 18 pixels on larger screens */
    }

    .mobile-call-icon {
        display: none;                /* hide mobile call icon */
    }

    .phone-number {
    	display: inline;              /* show the textual telephone number */
    }
}
```

The `@media` rule defines a new block of style rules that apply only when the conditions of the `@media` rule are met. In this case, the `@media` rule condition is "the device width is at least 768 pixels." If the current device width is less than `768px`, the rules inside the block do not apply. If the width is equal to or greater than `768px`, they do.

All rules defined outside of a `@media` rule block will always apply to all screens. So you can define several rules at the top of your stylesheet that set your default formatting, and then adjust only the properties you need to change inside the `@media` rule block. Because they appear later, they override the same property setting in the earlier rules.

You can define as many `@media` rule blocks as you want in a stylesheet, each with a different condition, but most professionals define only a few that match the common breakpoints between phone, tablet, and desktop screen widths.

The rules inside the `@media` rule can alter the formatting of any element, including completely hiding or showing it using the `display` property. Setting `display: none` will remove the element from the page, and `display: block` or `display: inline` will show it.


## Responsive Flexbox Layouts

> **Note:** this next section assumes you have already read and understood the [CSS Flexbox Tutorial](../flexbox/). If you haven't, now would be a good time to go through that.

Media rules can also be used to dynamically adjust a [flexbox-based layout](../flexbox/) depending on the width of the browser's viewport. As noted earlier, it's common to layout blocks of content stacked on top of each other on small mobile touchscreens, but make them side-by-side in a multi-column layout on larger desktop screens. Since a flexbox is just a property we add to existing block elements, we can effectively "turn on" the flexbox layout once the screen width gets above a particular threshold.

Start with some HTML content like this:

```html
<div class="row">
	<div class="col">
		<h2>Column One</h2>
	</div>
	<div class="col">
		<h2>Column Two</h2>
	</div>
	<div class="col">
		<h2>Column Three</h2>
	</div>
	<div class="col">
		<h2>Column Four</h2>
	</div>
</div>
```

By default, these `<div>` elements will stack on top of each other, which is what we want on narrow mobile screens. We don't need to transform these into a multi-column flexbox layout until the screen width exceeds a particular threshold (say `768px`). To achieve this, use a `@media` rule:

```css
/* no flexbox by default... */

@media (min-width: 768px) {
	/* on screens 768px and wider, make the .row element a flexbox */
	.row {
		display: flex;
	}
	/* and make the .col elements grow to consume the row width */
	.col {
		flex-grow: 1;
	}
}
```

<p><a href="https://codepen.io/drstearns/pen/RZymgx" class="button is-primary">Open in CodePen</a></p>

Resize that CodePen browser window and you'll see the layout automatically adjust when you cross over the `768px` threshold. No JavaScript rquired!

## Multiple Breakpoints

What if we want to have a layout that starts stacked, becomes two-by-two on medium screens, and then becomes four-by-one on larger screens? We can do this by defining another `@media` rule block, and using a few Flexbox properties. Change your CSS to be like this:

```css
/* no flexbox by default... */

@media (min-width: 768px) {
	/* on screens 768px and wider, make the .row element a flexbox */
	.row {
		display: flex;
		/* wrap columns if they are too wide for one line */
		flex-wrap: wrap;
	}
	/* make all columns consume half the row width */
	.col {
		flex-basis: 50%;
	}
}

@media (min-width: 1200px) {
	/* on screens 1200px and wider... */
	.col {
		/* reset flex-basis to automatic sizing based on content*/
		flex-basis: auto;
		/* grow all columns equally */
		flex-grow: 1;
	}
}
```

<p><a href="https://codepen.io/drstearns/pen/ayGrMW" class="button is-primary">Open in CodePen</a></p>

Now we have two media rules, one that applies to screens `768px` and wider, and one that applies to screens `1200px` and wider. Note the "and wider" part of that: all of the rules in the `@media (min-width: 768px)` block will also apply to screens 1200 pixels and wider, because 1200 is still wider than 768. But we can _override_ some of those properties when the screen is `1200px` or wider, or add new properties to the mix. The key is to see these blocks as _progressively adding_ things as the screen widths get larger. As written, they are not mutually exclusive.

We changed the first media rule block to set the `flex-wrap` propery to `wrap`. This will allow the browser to wrap columns to the next line if you give them a width that adds up to more than the available row width. We do just that in the `.col` rule: we set `flex-basis` on all columns to `50%`. Since there are four columns, that allows for only two columns on a line, and the browser wraps the remaining two to a second line, creating a two-by-two layout.

When the screen width is `1200px` or wider, we reset the `flex-basis` property on the columns back to `auto`, which means "size me based on my content." We also set `flex-grow` to `1` so that the columns stretch to fill the entire row width. The browser will then give each column a quarter of the row width, creating a four-by-one layout.

We don't need to reset `flex-wrap` to `no-wrap` in the second media rule block because wrapping only occurs if the column widths add up to be more than the available row width. Because we no longer set `flex-basis`, the browser is now in charge of the column widths, and will autoamtically make them narrow enough to fit on one line.

## More Details

Media rules are a powerful and declarative way to create a single page that looks great on everything from a small mobile touchscreen to a large desktop monitor with a mouse. There are several properties beyond `min-width` that you can test to determine the devices capabilities and adjust your styling accordingly. For more details see these references:

- [Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)
- [@media reference](https://developer.mozilla.org/en-US/docs/Web/CSS/@media)



